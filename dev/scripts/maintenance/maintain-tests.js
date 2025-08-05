#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

// Promisify filesystem operations
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const unlink = promisify(fs.unlink);
const copyFile = promisify(fs.copyFile);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const mkdir = promisify(fs.mkdir);
const rmdir = promisify(fs.rmdir);

// Configuration
const CONFIG = {
    sourceDir: path.join(__dirname, '..', 'test-reports'),
    backupDir: path.join(__dirname, '..', 'test-results'),
    summaryPath: path.join(__dirname, '..', 'test-reports', 'summary.json'),
    retentionDays: 14,
    dateFormat: 'YYYY-MM-DD-HH-mm-ss'
};

// Utility functions
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day}-${hours}-${minutes}-${seconds}`;
}

function getAgeInDays(date) {
    const now = new Date();
    const diffMs = now - date;
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

// Copy directory recursively
async function copyDirectory(src, dest) {
    await mkdir(dest, { recursive: true });
    const entries = await readdir(src, { withFileTypes: true });
    
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
            await copyDirectory(srcPath, destPath);
        } else {
            await copyFile(srcPath, destPath);
        }
    }
}

// Archive test results
async function backupTestResults() {
    console.log('Starting test results backing up...');
    
    try {
        // Check if source directory exists
        if (!fs.existsSync(CONFIG.sourceDir)) {
            console.log('No test-reports directory found. Nothing to backup.');
            return 0;
        }
        
        // Ensure backup directory exists
        await mkdir(CONFIG.backupDir, { recursive: true });
        
        const timestamp = formatDate(new Date());
        const backupSubDir = path.join(CONFIG.backupDir, timestamp);
        
        // Copy entire test-reports directory to backup
        await copyDirectory(CONFIG.sourceDir, backupSubDir);
        
        // Count backupd files
        let backupdCount = 0;
        async function countFiles(dir) {
            const entries = await readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isDirectory()) {
                    await countFiles(path.join(dir, entry.name));
                } else {
                    backupdCount++;
                }
            }
        }
        
        await countFiles(backupSubDir);
        console.log(`Backed up ${backupdCount} files to ${backupSubDir}`);
        
        return { count: backupdCount, timestamp, backupPath: backupSubDir };
        
    } catch (error) {
        console.error('Error backing up test results:', error);
        return { count: 0, timestamp: null, backupPath: null };
    }
}

// Clean up old backups
async function cleanupOldBackups() {
    console.log(`\nCleaning up backups older than ${CONFIG.retentionDays} days...`);
    
    try {
        if (!fs.existsSync(CONFIG.backupDir)) {
            console.log('No backup directory found. Nothing to clean up.');
            return 0;
        }
        
        const backups = await readdir(CONFIG.backupDir);
        let deletedCount = 0;
        
        for (const backup of backups) {
            const backupPath = path.join(CONFIG.backupDir, backup);
            const backupStat = await stat(backupPath);
            
            if (backupStat.isDirectory()) {
                const ageInDays = getAgeInDays(backupStat.mtime);
                
                if (ageInDays > CONFIG.retentionDays) {
                    await removeDirectory(backupPath);
                    deletedCount++;
                    console.log(`Deleted old backup: ${backup} (${ageInDays} days old)`);
                }
            }
        }
        
        console.log(`Deleted ${deletedCount} old backups`);
        return deletedCount;
        
    } catch (error) {
        console.error('Error cleaning up old backups:', error);
        return 0;
    }
}

// Recursively remove directory
async function removeDirectory(dirPath) {
    const entries = await readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
            await removeDirectory(fullPath);
        } else {
            await unlink(fullPath);
        }
    }
    
    await rmdir(dirPath);
}

// Get directory size recursively
async function getDirectorySize(dirPath) {
    let totalSize = 0;
    
    async function calculateSize(dir) {
        const entries = await readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            
            if (entry.isDirectory()) {
                await calculateSize(fullPath);
            } else {
                const stats = await stat(fullPath);
                totalSize += stats.size;
            }
        }
    }
    
    await calculateSize(dirPath);
    return totalSize;
}

// Parse test results from backupd files
async function parseTestResults(backupPath) {
    const testResults = {
        totalTests: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: 0,
        testFiles: []
    };
    
    try {
        // Look for common test result files
        const resultFiles = [
            'results.json',
            'playwright-last-run.json',
            'extreme-test-findings.json',
            'question-display-report.json'
        ];
        
        for (const file of resultFiles) {
            const filePath = path.join(backupPath, file);
            if (fs.existsSync(filePath)) {
                try {
                    const content = await readFile(filePath, 'utf8');
                    const data = JSON.parse(content);
                    
                    // Extract test statistics based on file type
                    if (file === 'playwright-last-run.json' && data.status) {
                        testResults.totalTests += data.tests || 0;
                        testResults.passed += data.passed || 0;
                        testResults.failed += data.failed || 0;
                        testResults.duration += data.duration || 0;
                    }
                    
                    testResults.testFiles.push(file);
                } catch (e) {
                    // Ignore parse errors
                }
            }
        }
    } catch (error) {
        // Ignore errors in parsing individual backups
    }
    
    return testResults;
}

// Generate summary report
async function generateSummaryReport(latestArchive = null) {
    console.log('\nGenerating summary report...');
    
    try {
        // Load existing summary or create new one
        let summary = {
            lastUpdated: new Date().toISOString(),
            retention: {
                days: CONFIG.retentionDays,
                policy: `Archives older than ${CONFIG.retentionDays} days are automatically deleted (reduced from 30 to save space)`
            },
            history: [],
            statistics: {
                totalArchives: 0,
                totalSize: 0,
                totalTests: 0,
                totalPassed: 0,
                totalFailed: 0,
                averageTestsPerRun: 0,
                oldestArchive: null,
                newestArchive: null
            }
        };
        
        // Try to load existing summary
        if (fs.existsSync(CONFIG.summaryPath)) {
            try {
                const existingData = await readFile(CONFIG.summaryPath, 'utf8');
                const existing = JSON.parse(existingData);
                if (existing.history) {
                    summary.history = existing.history;
                }
            } catch (e) {
                console.log('Could not load existing summary, creating new one');
            }
        }
        
        // Add latest backup to history if provided
        if (latestArchive) {
            const backupEntry = {
                timestamp: latestArchive.timestamp,
                path: latestArchive.backupPath,
                filesBacked up: latestArchive.count,
                createdAt: new Date().toISOString()
            };
            
            // Parse test results from the backup
            const testResults = await parseTestResults(latestArchive.backupPath);
            backupEntry.testResults = testResults;
            
            summary.history.unshift(backupEntry);
            
            // Keep only last 100 entries in history
            if (summary.history.length > 100) {
                summary.history = summary.history.slice(0, 100);
            }
        }
        
        // Scan all backups and update statistics
        if (fs.existsSync(CONFIG.backupDir)) {
            const backups = await readdir(CONFIG.backupDir);
            let totalSize = 0;
            let totalTests = 0;
            let totalPassed = 0;
            let totalFailed = 0;
            let validArchives = [];
            
            for (const backup of backups) {
                const backupPath = path.join(CONFIG.backupDir, backup);
                const backupStat = await stat(backupPath);
                
                if (backupStat.isDirectory()) {
                    const size = await getDirectorySize(backupPath);
                    totalSize += size;
                    
                    const testResults = await parseTestResults(backupPath);
                    totalTests += testResults.totalTests;
                    totalPassed += testResults.passed;
                    totalFailed += testResults.failed;
                    
                    validArchives.push({
                        name: backup,
                        created: backupStat.mtime,
                        size: size,
                        testResults: testResults
                    });
                }
            }
            
            // Sort backups by creation date
            validArchives.sort((a, b) => a.created - b.created);
            
            // Update statistics
            summary.statistics = {
                totalArchives: validArchives.length,
                totalSize: totalSize,
                totalTests: totalTests,
                totalPassed: totalPassed,
                totalFailed: totalFailed,
                averageTestsPerRun: validArchives.length > 0 ? Math.round(totalTests / validArchives.length) : 0,
                oldestArchive: validArchives.length > 0 ? validArchives[0].name : null,
                newestArchive: validArchives.length > 0 ? validArchives[validArchives.length - 1].name : null
            };
            
            // Generate detailed report
            summary.backups = validArchives.map(backup => ({
                name: backup.name,
                created: backup.created.toISOString(),
                ageInDays: getAgeInDays(backup.created),
                size: backup.size,
                sizeFormatted: formatBytes(backup.size),
                testResults: backup.testResults
            }));
        }
        
        // Save summary
        await mkdir(path.dirname(CONFIG.summaryPath), { recursive: true });
        await writeFile(CONFIG.summaryPath, JSON.stringify(summary, null, 2));
        
        console.log(`Summary report updated at: ${CONFIG.summaryPath}`);
        console.log(`Total backups: ${summary.statistics.totalArchives}`);
        console.log(`Total size: ${formatBytes(summary.statistics.totalSize)}`);
        console.log(`Total tests run: ${summary.statistics.totalTests}`);
        console.log(`Pass rate: ${summary.statistics.totalTests > 0 ? 
            ((summary.statistics.totalPassed / summary.statistics.totalTests) * 100).toFixed(1) : 0}%`);
        
        return summary;
        
    } catch (error) {
        console.error('Error generating summary report:', error);
        return null;
    }
}

// Main maintenance function
async function maintainTests() {
    // Import compression utility
    const { compressTraceFiles } = require('./compress-traces');
    console.log('=== Test Maintenance System ===');
    console.log(`Started at: ${new Date().toISOString()}\n`);
    
    try {
        // 1. Archive current test results
        const backupResult = await backupTestResults();
        
        // 2. Clean up old backups
        const deletedCount = await cleanupOldBackups();
        
        // 2.5. Compress trace files
        console.log('\nCompressing trace files...');
        const compressionResult = await compressTraceFiles();
        
        // 3. Generate summary report
        const report = await generateSummaryReport(backupResult.count > 0 ? backupResult : null);
        
        // Log summary
        console.log('\n=== Maintenance Summary ===');
        console.log(`Files backupd: ${backupResult.count}`);
        console.log(`Archive location: ${backupResult.backupPath || 'N/A'}`);
        console.log(`Old backups deleted: ${deletedCount}`);
        console.log(`Files compressed: ${compressionResult.filesCompressed}`);
        console.log(`Space saved by compression: ${formatBytes(compressionResult.totalSaved)}`);
        
        if (report) {
            console.log(`Total backups: ${report.statistics.totalArchives}`);
            console.log(`Total size: ${formatBytes(report.statistics.totalSize)}`);
            console.log(`Total tests tracked: ${report.statistics.totalTests}`);
            console.log(`Overall pass rate: ${report.statistics.totalTests > 0 ? 
                ((report.statistics.totalPassed / report.statistics.totalTests) * 100).toFixed(1) : 0}%`);
        }
        
        console.log('\nMaintenance completed successfully!');
        
        // Return results for programmatic use
        return {
            backupd: backupResult,
            deleted: deletedCount,
            summary: report
        };
        
    } catch (error) {
        console.error('Fatal error during maintenance:', error);
        process.exit(1);
    }
}

// Helper function to format bytes
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Run maintenance if called directly
if (require.main === module) {
    maintainTests().catch(error => {
        console.error('Unhandled error:', error);
        process.exit(1);
    });
}

// Export functions for external use
module.exports = {
    backupTestResults,
    cleanupOldBackups,
    generateSummaryReport,
    maintainTests
};
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { promisify } = require('util');
const { pipeline } = require('stream');

const pipelineAsync = promisify(pipeline);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const unlink = promisify(fs.unlink);

const BACKUP_DIR = path.join(__dirname, '..', 'test-results');
const MIN_SIZE_TO_COMPRESS = 1024 * 100; // 100KB minimum

async function compressTraceFiles() {
    console.log('=== Trace File Compression ===');
    console.log(`Scanning: ${BACKUP_DIR}\n`);
    
    let totalSaved = 0;
    let filesCompressed = 0;
    
    async function scanDirectory(dir) {
        const entries = await readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            
            if (entry.isDirectory()) {
                await scanDirectory(fullPath);
            } else if (entry.name.endsWith('.zip') && !entry.name.endsWith('.gz')) {
                const stats = await stat(fullPath);
                
                if (stats.size > MIN_SIZE_TO_COMPRESS) {
                    const gzPath = `${fullPath}.gz`;
                    
                    try {
                        // Compress the file
                        await pipelineAsync(
                            fs.createReadStream(fullPath),
                            zlib.createGzip({ level: 9 }),
                            fs.createWriteStream(gzPath)
                        );
                        
                        const gzStats = await stat(gzPath);
                        const saved = stats.size - gzStats.size;
                        
                        if (saved > 0) {
                            // Remove original if compression saved space
                            await unlink(fullPath);
                            totalSaved += saved;
                            filesCompressed++;
                            
                            console.log(`Compressed: ${entry.name}`);
                            console.log(`  Original: ${formatBytes(stats.size)}`);
                            console.log(`  Compressed: ${formatBytes(gzStats.size)}`);
                            console.log(`  Saved: ${formatBytes(saved)} (${Math.round(saved/stats.size*100)}%)\n`);
                        } else {
                            // Remove gz file if no savings
                            await unlink(gzPath);
                        }
                    } catch (error) {
                        console.error(`Error compressing ${entry.name}:`, error.message);
                    }
                }
            }
        }
    }
    
    try {
        await scanDirectory(BACKUP_DIR);
        
        console.log('=== Compression Summary ===');
        console.log(`Files compressed: ${filesCompressed}`);
        console.log(`Total space saved: ${formatBytes(totalSaved)}`);
        
        return { filesCompressed, totalSaved };
    } catch (error) {
        console.error('Compression failed:', error);
        return { filesCompressed: 0, totalSaved: 0 };
    }
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Run if called directly
if (require.main === module) {
    compressTraceFiles().catch(console.error);
}

module.exports = { compressTraceFiles };
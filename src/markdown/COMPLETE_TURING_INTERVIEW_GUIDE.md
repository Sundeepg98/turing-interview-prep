# Complete Turing Interview Guide - Pulumi/TypeScript DevOps

## Quick Reference
- **Role**: Cloud Infrastructure Engineer (Pulumi + TypeScript)
- **Company**: Turing - AI-powered tech services (3M developers, 900+ clients)
- **Your Edge**: 200+ resources managed, 85% faster deployments, 35% cost reduction

---

## SECTION 1: CORE CONCEPTS EXPLAINED

### 1.1 What is Pulumi?
**Simple Answer**: Infrastructure as Code using real programming languages (TypeScript, Python, Go) instead of YAML/JSON.

**Why It Matters**: 
- Type safety catches errors at compile time
- IDE support with autocomplete
- Reusable functions and classes
- Unit testing capabilities

**Your Experience**: "At Mailmodo, TypeScript's type safety prevented a production outage when a developer tried to use an invalid instance type - caught at compile time."

### 1.2 Pulumi Outputs Explained
**What**: Promises representing values that will only be known after deployment (like resource IDs, ARNs).

**Why Critical**: Cloud providers return these values only after creating resources. Outputs ensure proper sequencing.

**Key Methods**:
```typescript
// .apply() - Transform future values
bucket.id.apply(id => console.log(`Created: ${id}`));

// pulumi.interpolate - Combine outputs  
const url = pulumi.interpolate`https://${bucket.websiteEndpoint}`;

// pulumi.all() - Wait for multiple
pulumi.all([db.endpoint, db.port]).apply(([host, port]) => 
    `postgresql://${host}:${port}`
);
```

**Common Mistake**: Trying to use `.toString()` on Output - always use `.apply()` instead.

### 1.3 Component Resources (Your Specialty)
**What**: Custom, reusable cloud resource abstractions - like creating your own "Lego blocks" for infrastructure.

**Why You Built Them**:
- Reduced 200+ resources to manageable components
- Enforced company standards automatically
- Enabled developer self-service

**Your Implementation**:
```typescript
export class MicroserviceStack extends pulumi.ComponentResource {
    // This pattern reduced our deployment code by 40%
    constructor(name: string, args: MicroserviceArgs) {
        super("custom:infra:MicroserviceStack", name);
        
        // All child resources automatically deleted with parent
        this.lambda = new aws.lambda.Function(`${name}-fn`, {
            runtime: args.runtime,
            // ... config
        }, { parent: this });  // Key: parent relationship
        
        // Make outputs available to consumers
        this.registerOutputs({
            url: this.lambda.invokeArn
        });
    }
}
```

---

## SECTION 2: TECHNICAL INTERVIEW QUESTIONS

### Q1: "How do you manage different environments?"

**Your Answer**: 
"I use Pulumi stacks for environment isolation. Each stack (dev, staging, prod) has its own state file and configuration. Here's my pattern:"

```typescript
const config = new pulumi.Config();
const env = pulumi.getStack(); // dev, staging, prod

const envConfigs = {
    dev: { instanceType: "t3.micro", minSize: 1 },
    prod: { instanceType: "t3.large", minSize: 3 }
};

const currentConfig = envConfigs[env];
```

"This approach helped us maintain consistency while allowing environment-specific optimizations."

### Q2: "How do you handle secrets?"

**Your Answer**:
"Three-layer approach for security:"

```typescript
// 1. Pulumi secrets (encrypted in state)
const dbPassword = config.requireSecret("dbPassword");

// 2. AWS Secrets Manager for rotation
const rotatingSecret = aws.secretsmanager.getSecret({
    name: "prod/api/key"
});

// 3. Environment-specific encryption
pulumi stack init prod --secrets-provider=awskms://alias/pulumi
```

### Q3: "Explain your testing strategy"

**Your Answer**:
"I implement three levels of testing:"

**Unit Tests (Fast, Mocked)**:
```typescript
describe("MicroserviceStack", () => {
    beforeAll(() => {
        pulumi.runtime.setMocks({
            newResource: (args) => ({
                id: `${args.name}_id`,
                state: args.inputs
            })
        });
    });

    it("creates Lambda with correct memory", async () => {
        const stack = new MicroserviceStack("test", {
            memorySize: 512
        });
        const memory = await stack.lambda.memorySize.promise();
        expect(memory).toBe(512);
    });
});
```

**Integration Tests**: Deploy to temporary stack, verify actual resources work
**Policy Tests**: Enforce security standards (no public S3, encrypted databases)

### Q4: "How do you debug infrastructure issues?"

**Your Answer**:
"Systematic approach I've developed:"

1. **Enable verbose logging**:
```bash
PULUMI_LOG_LEVEL=debug pulumi up
```

2. **Check state consistency**:
```bash
pulumi refresh  # Sync with actual cloud state
pulumi stack export > state.json  # Inspect full state
```

3. **Resource-specific debugging**:
```typescript
// Wrapper to log all resource outputs
function debugResource<T extends pulumi.Resource>(resource: T): T {
    Object.keys(resource).forEach(key => {
        if (resource[key] instanceof pulumi.Output) {
            resource[key].apply(val => 
                console.log(`${key}: ${JSON.stringify(val)}`)
            );
        }
    });
    return resource;
}
```

### Q5: "Walk me through your CI/CD implementation"

**Your Answer**:
"I built a GitOps workflow with automatic previews and deployments:"

```yaml
# .github/workflows/pulumi.yml
name: Infrastructure Deployment

on:
  pull_request:  # Preview on PR
  push:
    branches: [main]  # Deploy on merge

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pulumi/actions@v4
        with:
          command: ${{ github.event_name == 'push' && 'up' || 'preview' }}
          stack-name: ${{ github.event_name == 'push' && 'prod' || 'dev' }}
          comment-on-pr: true
        env:
          PULUMI_ACCESS_TOKEN: ${{ secrets.PULUMI_ACCESS_TOKEN }}
```

"This reduced our deployment time from 2 hours to 18 minutes."

### Q6: "How do you handle resource aliases during refactoring?"

**Your Answer**:
"Resource aliases are critical when renaming or reorganizing infrastructure without recreation:"

```typescript
// Renaming a resource without destroying it
const bucket = new aws.s3.Bucket("new-name", {
    // configuration
}, {
    aliases: [{ name: "old-name" }]  // Prevents deletion/recreation
});

// Moving resources between components
const db = new aws.rds.Instance("prod-db", {
    // configuration  
}, {
    aliases: [{ 
        name: "database",
        parent: "urn:pulumi:prod::app::custom:component$old-parent"
    }]
});
```

"I used this pattern when restructuring our 200+ resources at Mailmodo without any downtime."

### Q7: "Explain provider transformations"

**Your Answer**:
"Provider transformations allow applying common settings across all resources:"

```typescript
// Enforce tagging standards across all resources
const provider = new aws.Provider("aws", {
    defaultTags: {
        tags: {
            Environment: pulumi.getStack(),
            ManagedBy: "Pulumi",
            CostCenter: config.require("costCenter")
        }
    },
    // Apply transformations
    transformations: [(args) => {
        // Force encryption on all S3 buckets
        if (args.type === "aws:s3/bucket:Bucket") {
            args.props.serverSideEncryptionConfiguration = {
                rule: {
                    applyServerSideEncryptionByDefault: {
                        sseAlgorithm: "AES256"
                    }
                }
            };
        }
        return undefined;  // Return modified args
    }]
});
```

### Q8: "How do you optimize Pulumi performance at scale?"

**Your Answer**:
"Several techniques I've implemented for our 200+ resource deployments:"

```typescript
// 1. Minimize dependencies with explicit ignoreChanges
const instance = new aws.ec2.Instance("app", {
    // config
}, {
    ignoreChanges: ["userData", "tags"]  // Skip unnecessary updates
});

// 2. Use targeted updates
// pulumi up --target urn:pulumi:prod::app::aws:lambda/function:Function::api

// 3. Parallel resource creation
const buckets = Promise.all(
    regions.map(region => 
        new aws.s3.Bucket(`bucket-${region}`, {}, {
            provider: new aws.Provider(`aws-${region}`, { region })
        })
    )
);

// 4. Resource batching for similar resources
const lambdas = new aws.lambda.Function("batch", {
    // Use map for similar configs instead of individual resources
});
```

"These optimizations reduced our deployment time from 18 minutes to under 10."

### Q9: "Describe your approach to self-healing infrastructure"

**Your Answer**:
"I've implemented self-healing patterns using Pulumi with CloudWatch and Lambda:"

```typescript
class SelfHealingService extends pulumi.ComponentResource {
    constructor(name: string) {
        super("custom:app:SelfHealingService", name);

        // Health check alarm
        const alarm = new aws.cloudwatch.MetricAlarm(`${name}-health`, {
            metricName: "HealthCheck",
            threshold: 1,
            evaluationPeriods: 2,
            alarmActions: [healingTopic.arn]
        });

        // Healing Lambda
        const healer = new aws.lambda.Function(`${name}-healer`, {
            handler: "heal.handler",
            runtime: aws.lambda.Runtime.NODEJS_18_X,
            environment: {
                variables: {
                    STACK_NAME: pulumi.getStack(),
                    PROJECT_NAME: pulumi.getProject()
                }
            }
        });

        // Subscribe to healing events
        new aws.sns.TopicSubscription(`${name}-heal-sub`, {
            topic: healingTopic.arn,
            protocol: "lambda",
            endpoint: healer.arn
        });
    }
}
```

### Q10: "How do you handle state recovery in disaster scenarios?"

**Your Answer**:
"I've implemented a comprehensive state backup and recovery strategy:"

```typescript
// Automated state backups
const stateBackup = new aws.s3.BucketObject("state-backup", {
    bucket: backupBucket.id,
    key: pulumi.interpolate`states/${pulumi.getStack()}-${Date.now()}.json`,
    source: new pulumi.asset.StringAsset(
        pulumi.runtime.serialize(() => pulumi.runtime.getStackResource())
    )
});

// Recovery procedure
async function recoverState(backupFile: string) {
    const stack = await LocalWorkspace.selectStack({
        stackName: pulumi.getStack()
    });
    
    // Import the backup
    const backup = await fs.readFile(backupFile, 'utf-8');
    await stack.importStack(backup);
    
    // Refresh to sync with actual resources
    await stack.refresh();
    
    // Validate consistency
    const preview = await stack.preview();
    if (preview.changeSummary.delete > 0) {
        console.warn("State inconsistency detected!");
    }
}
```

### Q11: "How do you detect and handle drift?"

**Your Answer**:
"Drift detection is critical for maintaining infrastructure integrity:"

```typescript
// Scheduled drift detection
async function detectDrift() {
    const stack = await LocalWorkspace.selectStack({
        stackName: pulumi.getStack()
    });
    
    // Refresh compares actual vs desired state
    const refreshResult = await stack.refresh();
    
    if (refreshResult.summary.resourceChanges?.update > 0) {
        console.warn(`Drift detected in ${refreshResult.summary.resourceChanges.update} resources`);
        
        // Auto-remediate if configured
        if (config.getBoolean("autoRemediate")) {
            await stack.up();
        }
    }
}

// Run drift detection every hour
setInterval(detectDrift, 3600000);
```

### Q12: "Explain Policy as Code in Pulumi"

**Your Answer**:
"I implement Policy as Code using Pulumi CrossGuard for compliance:"

```typescript
// policy-pack/index.ts
new PolicyPack("security-policies", {
    policies: [
        {
            name: "s3-no-public-access",
            description: "S3 buckets must not allow public access",
            enforcementLevel: "mandatory",
            validateResource: validateResourceOfType(aws.s3.Bucket, (bucket, args, reportViolation) => {
                if (bucket.acl === "public-read" || bucket.acl === "public-read-write") {
                    reportViolation("S3 buckets must not be publicly accessible");
                }
            }),
        },
        {
            name: "required-tags",
            description: "All resources must have required tags",
            enforcementLevel: "mandatory",
            validateResource: (args, reportViolation) => {
                const tags = args.props.tags || {};
                const required = ["Environment", "Owner", "CostCenter"];
                
                required.forEach(tag => {
                    if (!tags[tag]) {
                        reportViolation(`Missing required tag: ${tag}`);
                    }
                });
            },
        },
    ],
});
```

### Q13: "What's the difference between CustomResource and ComponentResource?"

**Your Answer**:
"They serve different purposes in Pulumi's resource model:"

```typescript
// CustomResource - represents actual cloud resources
class MyCustomS3Bucket extends pulumi.CustomResource {
    public readonly bucketName: pulumi.Output<string>;
    
    constructor(name: string, args: any, opts?: pulumi.CustomResourceOptions) {
        super("mycloud:s3:Bucket", name, args, opts);
    }
}

// ComponentResource - logical grouping, no cloud resource
class MyAppStack extends pulumi.ComponentResource {
    constructor(name: string, opts?: pulumi.ComponentResourceOptions) {
        super("myapp:Stack", name, {}, opts);
        
        // Contains other resources
        const bucket = new aws.s3.Bucket(`${name}-bucket`, {}, { parent: this });
        const lambda = new aws.lambda.Function(`${name}-fn`, {}, { parent: this });
    }
}
```

"CustomResource = actual cloud resource, ComponentResource = logical container."

### Q14: "How do you implement dynamic providers?"

**Your Answer**:
"Dynamic providers enable custom resource management:"

```typescript
// Custom provider for managing external API resources
const myProvider: pulumi.dynamic.ResourceProvider = {
    async create(inputs: any) {
        const response = await fetch("https://api.example.com/resources", {
            method: "POST",
            body: JSON.stringify(inputs),
        });
        const data = await response.json();
        return { id: data.id, outs: data };
    },
    
    async delete(id: string) {
        await fetch(`https://api.example.com/resources/${id}`, {
            method: "DELETE",
        });
    },
    
    async update(id: string, olds: any, news: any) {
        const response = await fetch(`https://api.example.com/resources/${id}`, {
            method: "PUT",
            body: JSON.stringify(news),
        });
        return { outs: await response.json() };
    },
};

// Using the dynamic provider
class ExternalResource extends pulumi.dynamic.Resource {
    constructor(name: string, args: any, opts?: pulumi.CustomResourceOptions) {
        super(myProvider, name, args, opts);
    }
}
```

### Q15: "Explain your version control strategy for Pulumi"

**Your Answer**:
"I follow a structured approach for version control:"

```typescript
// 1. Project structure
/*
infrastructure/
├── Pulumi.yaml          // Project definition
├── Pulumi.dev.yaml      // Dev config (not in git)
├── Pulumi.prod.yaml     // Prod config (secrets encrypted)
├── src/
│   ├── components/      // Reusable components
│   ├── stacks/         // Stack-specific code
│   └── policies/       // Policy packs
└── tests/              // Infrastructure tests
*/

// 2. Branch strategy
// - main: production-ready code
// - develop: integration branch
// - feature/*: new features
// - hotfix/*: emergency fixes

// 3. Commit conventions
// feat: new infrastructure component
// fix: resolve drift or errors
// refactor: improve existing infrastructure
// docs: update documentation

// 4. Pre-commit hooks
// - Pulumi preview
// - Policy validation
// - Cost estimation
```

### Q16: "Show me comprehensive Jest testing for Pulumi infrastructure"

**Your Answer**:
"I've implemented a complete testing strategy with Jest:"

```typescript
// jest.config.js
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/*.test.ts'],
    collectCoverageFrom: ['src/**/*.ts'],
    coverageThreshold: {
        global: { branches: 80, functions: 80, lines: 80 }
    }
};

// infrastructure.test.ts
import * as pulumi from "@pulumi/pulumi";
import { getMocks } from "./mocks";

describe("Infrastructure Tests", () => {
    let mocks: any;
    
    beforeAll(() => {
        // Set up Pulumi mocks
        mocks = getMocks();
        pulumi.runtime.setMocks(mocks);
    });

    describe("MicroserviceStack", () => {
        it("should create Lambda with correct TypeScript config", async () => {
            const stack = new MicroserviceStack("test", {
                runtime: aws.lambda.Runtime.NODEJS_18_X,
                memorySize: 512,
                environment: {
                    NODE_ENV: "test",
                    API_KEY: pulumi.secret("test-key")
                }
            });

            // Test outputs using TypeScript async/await
            const memory = await stack.lambda.memorySize.promise();
            const runtime = await stack.lambda.runtime.promise();
            
            expect(memory).toBe(512);
            expect(runtime).toBe("nodejs18.x");
        });

        it("should handle errors gracefully", async () => {
            // Test error scenarios
            expect(() => {
                new MicroserviceStack("invalid", {
                    runtime: "invalid-runtime" as any,
                    memorySize: -1
                });
            }).toThrow();
        });
    });

    // Integration test with real AWS
    describe.skip("Integration Tests", () => {
        it("should deploy to test stack", async () => {
            const stack = await LocalWorkspace.createOrSelectStack({
                stackName: "test-integration",
                projectName: "test",
                program: async () => {
                    const bucket = new aws.s3.Bucket("test-bucket");
                    return { bucketName: bucket.id };
                }
            });

            const upResult = await stack.up();
            expect(upResult.outputs.bucketName).toBeDefined();
            
            // Cleanup
            await stack.destroy();
        });
    });
});
```

### Q17: "How do you handle TypeScript-specific patterns in Pulumi?"

**Your Answer**:
"I leverage TypeScript's type system for safer infrastructure:"

```typescript
// 1. Generic component builders
export class ResourceBuilder<T extends pulumi.Resource> {
    private resource: T;
    private config: Map<string, any> = new Map();

    constructor(private factory: (name: string, args: any) => T) {}

    withConfig(key: string, value: any): this {
        this.config.set(key, value);
        return this;
    }

    build(name: string): T {
        const args = Object.fromEntries(this.config);
        this.resource = this.factory(name, args);
        return this.resource;
    }
}

// Usage with type safety
const lambdaBuilder = new ResourceBuilder(
    (name, args) => new aws.lambda.Function(name, args)
);

const lambda = lambdaBuilder
    .withConfig("runtime", aws.lambda.Runtime.NODEJS_18_X)
    .withConfig("handler", "index.handler")
    .build("my-function");

// 2. Type-safe configuration
interface EnvironmentConfig {
    dev: { instanceType: "t3.micro"; minSize: 1 };
    staging: { instanceType: "t3.small"; minSize: 2 };
    prod: { instanceType: "t3.large"; minSize: 3 };
}

function getTypedConfig<K extends keyof EnvironmentConfig>(
    env: K
): EnvironmentConfig[K] {
    const configs: EnvironmentConfig = {
        dev: { instanceType: "t3.micro", minSize: 1 },
        staging: { instanceType: "t3.small", minSize: 2 },
        prod: { instanceType: "t3.large", minSize: 3 }
    };
    return configs[env];
}

// 3. Conditional types for resources
type ResourceConfig<T extends "lambda" | "ec2"> = T extends "lambda"
    ? aws.lambda.FunctionArgs
    : aws.ec2.InstanceArgs;

function createResource<T extends "lambda" | "ec2">(
    type: T,
    name: string,
    config: ResourceConfig<T>
): T extends "lambda" ? aws.lambda.Function : aws.ec2.Instance {
    if (type === "lambda") {
        return new aws.lambda.Function(name, config as any) as any;
    }
    return new aws.ec2.Instance(name, config as any) as any;
}
```

### Q18: "Demonstrate advanced TypeScript error handling in Pulumi"

**Your Answer**:
"I implement robust error handling with custom types:"

```typescript
// Custom error types
export class PulumiDeploymentError extends Error {
    constructor(
        public resource: string,
        public reason: string,
        public suggestion?: string
    ) {
        super(`Deployment failed for ${resource}: ${reason}`);
        this.name = "PulumiDeploymentError";
    }
}

// Error handling wrapper
export async function safeDeployment<T>(
    operation: () => Promise<T>,
    resourceName: string
): Promise<T> {
    try {
        return await operation();
    } catch (error) {
        if (error.message.includes("already exists")) {
            throw new PulumiDeploymentError(
                resourceName,
                "Resource already exists",
                "Use 'pulumi import' or delete the existing resource"
            );
        }
        throw error;
    }
}

// Type-safe error recovery
export class DeploymentRecovery {
    private retryStrategies = new Map<string, (error: Error) => Promise<void>>();

    registerStrategy(errorType: string, strategy: (error: Error) => Promise<void>) {
        this.retryStrategies.set(errorType, strategy);
    }

    async recover(error: Error): Promise<void> {
        const strategy = this.retryStrategies.get(error.constructor.name);
        if (strategy) {
            await strategy(error);
        } else {
            throw error;
        }
    }
}

// Usage
const recovery = new DeploymentRecovery();
recovery.registerStrategy("PulumiDeploymentError", async (error) => {
    if (error instanceof PulumiDeploymentError) {
        console.log(`Suggestion: ${error.suggestion}`);
        // Implement recovery logic
    }
});
```

---

## SECTION 3: YOUR STAR STORIES

### Story 1: Infrastructure Migration (Mailmodo)
**Situation**: 200+ manually configured AWS resources, 2-hour deployments
**Task**: Migrate to IaC without downtime
**Action**: 
- Created reusable TypeScript components
- Used `pulumi import` for zero-downtime migration
- Built self-service platform for developers
**Result**: 85% faster deployments, 40% less code

### Story 2: Cost Optimization (Invecno)
**Situation**: $50K/month cloud costs across AWS and Azure
**Task**: Reduce costs by 30% without impacting performance
**Action**:
- Implemented spot instances for non-critical workloads
- Created cloud-agnostic abstractions
- Automated resource scheduling
**Result**: 35% cost reduction ($17.5K/month saved)

### Story 3: Backend to DevOps Transition
**Situation**: Backend engineer, team needed DevOps expertise
**Task**: Learn Pulumi/IaC while maintaining backend responsibilities  
**Action**:
- Self-studied after hours
- Started with Lambda automation
- Gradually took on complex infrastructure
**Result**: Became team's infrastructure expert, managed 200+ resources

---

## SECTION 4: LIVE CODING PREPARATION

Be ready to code these patterns:

### Pattern 1: Basic Resource Creation
```typescript
const bucket = new aws.s3.Bucket("app-bucket", {
    versioning: { enabled: true },
    lifecycleRules: [{
        enabled: true,
        noncurrentVersionExpiration: { days: 30 }
    }]
});
```

### Pattern 2: Cross-Stack References
```typescript
const networkStack = new pulumi.StackReference("org/network/prod");
const vpcId = networkStack.getOutput("vpcId");

const instance = new aws.ec2.Instance("app", {
    vpcSecurityGroupIds: [sg.id],
    subnetId: vpcId.apply(id => `${id}-subnet-1`)
});
```

### Pattern 3: Dynamic Resources
```typescript
const services = ["auth", "user", "payment"];
const lambdas = services.map(service => 
    new aws.lambda.Function(`${service}-fn`, {
        runtime: aws.lambda.Runtime.NODEJS_18_X,
        handler: `${service}.handler`,
        code: new pulumi.asset.FileArchive(`./dist/${service}`)
    })
);
```

---

## SECTION 5: QUESTIONS TO ASK THEM

1. **Technical**: "How do you currently manage Pulumi state across your 900+ clients? Separate AWS accounts?"
2. **Scale**: "What's the largest infrastructure deployment you're managing?"
3. **AI Integration**: "How does AI play into infrastructure automation at Turing?"
4. **Team**: "How do infrastructure engineers collaborate with the AI development teams?"
5. **Growth**: "What are the biggest infrastructure challenges as you scale?"

---

## SECTION 6: CLOSING PITCH

"I bring a unique perspective as a backend engineer who deeply understands infrastructure. At Mailmodo, I reduced deployment times by 85% and at Invecno achieved 35% cost savings. I'm excited about Turing's AI-powered approach and how infrastructure can enable that scale. My experience with reusable TypeScript components aligns perfectly with your needs for managing infrastructure across 900+ clients."

---

## QUICK COMMAND REFERENCE

```bash
# Stack Management
pulumi stack init dev
pulumi stack select prod
pulumi config set aws:region us-east-1

# Deployment
pulumi up --yes              # Skip confirmation
pulumi preview --diff        # See detailed changes
pulumi destroy --target urn  # Remove specific resource

# Debugging
pulumi refresh              # Sync state
pulumi stack export         # Inspect state
pulumi logs -f             # Stream logs

# State Surgery
pulumi state delete <urn>   # Remove from state
pulumi import <type> <id>   # Import existing
```

---

## RED FLAGS TO AVOID

1. **Never say**: "I haven't used that feature" - Instead: "I've used similar patterns with X"
2. **Don't**: Criticize Terraform heavily - Instead: Acknowledge both tools have strengths
3. **Avoid**: Over-engineering examples - Keep it practical
4. **Don't**: Forget to mention testing and security

---

## FINAL PREP CHECKLIST

- [ ] Review all code examples - can you write them from memory?
- [ ] Practice explaining Outputs vs regular values
- [ ] Be ready to live-code a simple Component Resource
- [ ] Know your metrics: 85% faster, 35% cost reduction, 200+ resources
- [ ] Prepare to discuss your backend-to-DevOps journey
- [ ] Have questions ready about Turing's scale and AI integration

Remember: You've already built this at scale. Be confident!
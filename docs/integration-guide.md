# Integration Guide for Job Specification Extraction

This guide explains how to integrate the Job Specification Extraction pipeline into your Hono application routes.

## Prerequisites

Before integrating, ensure you have:

1. **Ollama installed and running**
   ```bash
   # Install from https://ollama.ai
   
   # Pull the model
   ollama pull llama3.2
   
   # Start the server
   ollama serve
   ```

2. **Dependencies installed** (already done)
   ```bash
   npm install langchain @langchain/core @langchain/community --legacy-peer-deps
   ```

## Option 1: Direct Use Case Integration

The simplest way to use the extraction pipeline is to import and call it directly:

```typescript
import { extractJobSpecification } from "./src/app/jobs/usecase/extractJobSpecification.js";

// In your application logic
const result = await extractJobSpecification({
  jobDescription: "Your job description text...",
  sourceLanguage: "en",
  targetLanguage: "en",
});

console.log(result);
```

## Option 2: HTTP Route Integration (Recommended for API)

To expose the extraction pipeline as an HTTP endpoint, create a route handler:

### Step 1: Create the Route File

Create `/src/routes/jobs.ts`:

```typescript
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import type { RequestContext } from "../types/RequestContext.js";
import { ok } from "../core/result.js";
import { jsonRequestValidator } from "../core/validator.js";
import { ExtractJobSpecInput } from "../app/jobs/schema.js";
import { extractJobSpecification } from "../app/jobs/usecase/extractJobSpecification.js";
import { middlewares } from "../middleware/index.js";

const jobRoutes = new Hono<RequestContext>();

// Optional: Add authentication if needed
// jobRoutes.use('*', middlewares.auth);

jobRoutes.post(
  "/extract",
  jsonRequestValidator(ExtractJobSpecInput),
  describeRoute({
    description: "Extract structured job specifications from a job description using AI",
    responses: {
      200: {
        description: "Successfully extracted job specification",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                data: {
                  type: "object",
                  properties: {
                    jobTitle: { type: "string" },
                    company: { type: "string" },
                    location: { type: "string" },
                    employmentType: { type: "string" },
                    experienceLevel: { type: "string" },
                    salary: { type: "string" },
                    requiredSkills: {
                      type: "array",
                      items: { type: "string" },
                    },
                    preferredSkills: {
                      type: "array",
                      items: { type: "string" },
                    },
                    education: { type: "string" },
                    responsibilities: {
                      type: "array",
                      items: { type: "string" },
                    },
                    benefits: {
                      type: "array",
                      items: { type: "string" },
                    },
                    applicationDeadline: { type: "string" },
                    confidenceScores: {
                      type: "object",
                      additionalProperties: { type: "number" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      400: {
        description: "Invalid input or extraction failed",
      },
    },
  }),
  async (c) => {
    const input = c.req.valid("json");
    const result = await extractJobSpecification(input);
    return c.json(ok(result));
  }
);

export default jobRoutes;
```

### Step 2: Register the Route

Update `/src/routes/index.ts` to include the jobs route:

```typescript
import type { Hono } from "hono";
import type { RequestContext } from "../types/RequestContext.js";
import dummyRoutes from "./dummy.js";
import jobRoutes from "./jobs.js"; // Add this import

export function routes(app: Hono<RequestContext>) {
  app.route("/dummy", dummyRoutes);
  app.route("/jobs", jobRoutes); // Add this line
}
```

### Step 3: Test the Endpoint

```bash
# Start the development server
npm run dev

# Test with curl
curl -X POST http://localhost:3000/api/jobs/extract \
  -H "Content-Type: application/json" \
  -d '{
    "jobDescription": "Senior Full-Stack Developer needed. Must have React, Node.js, and TypeScript experience. Remote work available.",
    "sourceLanguage": "en",
    "targetLanguage": "en"
  }'
```

## Option 3: Background Job Processing

For batch processing or long-running extractions, consider using a job queue:

```typescript
import { Queue } from "bullmq"; // Example with BullMQ
import { extractJobSpecification } from "./src/app/jobs/usecase/extractJobSpecification.js";

// Setup queue
const jobExtractionQueue = new Queue("job-extraction", {
  connection: {
    host: "localhost",
    port: 6379,
  },
});

// Add job to queue
async function queueJobExtraction(jobDescription: string) {
  await jobExtractionQueue.add("extract", {
    jobDescription,
    sourceLanguage: "en",
    targetLanguage: "en",
  });
}

// Worker process
const worker = new Worker(
  "job-extraction",
  async (job) => {
    const result = await extractJobSpecification(job.data);
    return result;
  },
  {
    connection: {
      host: "localhost",
      port: 6379,
    },
  }
);
```

## Option 4: Batch Processing

Process multiple job descriptions in parallel:

```typescript
import { extractJobSpecification } from "./src/app/jobs/usecase/extractJobSpecification.js";

async function extractMultipleJobs(jobDescriptions: string[]) {
  // Process in parallel with Promise.all
  const results = await Promise.all(
    jobDescriptions.map((jobDescription) =>
      extractJobSpecification({
        jobDescription,
        sourceLanguage: "en",
        targetLanguage: "en",
      })
    )
  );

  return results;
}

// Or with concurrency limit
async function extractMultipleJobsWithLimit(
  jobDescriptions: string[],
  concurrencyLimit: number = 5
) {
  const results = [];

  for (let i = 0; i < jobDescriptions.length; i += concurrencyLimit) {
    const batch = jobDescriptions.slice(i, i + concurrencyLimit);
    const batchResults = await Promise.all(
      batch.map((jd) =>
        extractJobSpecification({
          jobDescription: jd,
          sourceLanguage: "en",
          targetLanguage: "en",
        })
      )
    );
    results.push(...batchResults);
  }

  return results;
}
```

## Environment Configuration

Add these optional environment variables to your `.env` file:

```bash
# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2

# Job Extraction Settings
JOB_EXTRACTION_DEFAULT_LANGUAGE=en
JOB_EXTRACTION_TEMPERATURE=0.1
```

Then update your use case to read from environment variables:

```typescript
const result = await extractJobSpecification({
  jobDescription,
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
  ollamaModel: process.env.OLLAMA_MODEL || "llama3.2",
});
```

## Error Handling Best Practices

Always wrap the extraction in proper error handling:

```typescript
import { DomainError } from "../core/result.js";

try {
  const result = await extractJobSpecification(input);
  return result;
} catch (error) {
  if (error instanceof DomainError) {
    // Handle domain-specific errors
    console.error(`Extraction failed: ${error.message}`);
    console.error(`Error code: ${error.code}`);
    
    // Return a fallback or re-throw
    throw error;
  } else {
    // Handle unexpected errors
    console.error("Unexpected error during job extraction:", error);
    throw new DomainError(
      "An unexpected error occurred during job extraction",
      "UNEXPECTED_ERROR"
    );
  }
}
```

## Monitoring and Logging

Add monitoring to track extraction performance:

```typescript
async function extractWithMonitoring(input: ExtractJobSpecInput) {
  const startTime = Date.now();

  try {
    const result = await extractJobSpecification(input);
    const duration = Date.now() - startTime;

    // Log success metrics
    console.log({
      event: "job_extraction_success",
      duration,
      fieldsExtracted: Object.keys(result).filter((k) => result[k] !== undefined).length,
      averageConfidence: result.confidenceScores
        ? Object.values(result.confidenceScores).reduce((a, b) => a + b, 0) /
          Object.values(result.confidenceScores).length
        : 0,
    });

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    // Log failure metrics
    console.error({
      event: "job_extraction_failed",
      duration,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    throw error;
  }
}
```

## Testing

Create tests for your integration:

```typescript
import { describe, it, expect } from "vitest";
import { extractJobSpecification } from "./extractJobSpecification.js";

describe("Job Extraction Integration", () => {
  it("should extract basic job information", async () => {
    const result = await extractJobSpecification({
      jobDescription: "Senior Developer position. React and TypeScript required.",
    });

    expect(result.jobTitle).toBeDefined();
    expect(result.requiredSkills).toContain("React");
    expect(result.requiredSkills).toContain("TypeScript");
  });

  it("should handle errors gracefully", async () => {
    await expect(
      extractJobSpecification({
        jobDescription: "",
      })
    ).rejects.toThrow();
  });
});
```

## Performance Optimization

### Caching

Implement caching to avoid re-processing identical job descriptions:

```typescript
import { createHash } from "crypto";

const extractionCache = new Map<string, JobSpecificationOutput>();

async function extractWithCache(input: ExtractJobSpecInput) {
  // Create a hash of the input
  const hash = createHash("md5")
    .update(JSON.stringify(input))
    .digest("hex");

  // Check cache
  if (extractionCache.has(hash)) {
    console.log("Cache hit for job extraction");
    return extractionCache.get(hash)!;
  }

  // Extract and cache
  const result = await extractJobSpecification(input);
  extractionCache.set(hash, result);

  return result;
}
```

### Connection Pooling

For production deployments, consider connection pooling for Ollama:

```typescript
import { ChatOllama } from "@langchain/community/chat_models/ollama";

// Create a reusable model instance
const sharedModel = new ChatOllama({
  baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
  model: process.env.OLLAMA_MODEL || "llama3.2",
  temperature: 0.1,
});

// Use in extraction
export async function extractJobSpecification(input: unknown) {
  // ... use sharedModel instead of creating new instance
}
```

## Security Considerations

1. **Rate Limiting**: Add rate limiting to prevent abuse
2. **Input Validation**: Always validate and sanitize input
3. **Authentication**: Protect the endpoint with authentication
4. **Quota Management**: Implement usage quotas per user/API key

## Next Steps

- Add authentication to the jobs endpoint
- Implement caching for frequently processed job descriptions
- Set up monitoring and alerting
- Add support for PDF and HTML input formats
- Integrate with your CV matching system

For more details, see the [main documentation](./job-specification-extraction.md).

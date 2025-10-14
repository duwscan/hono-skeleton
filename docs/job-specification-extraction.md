# Dynamic AI Pipeline for Automated Job Specification Extraction

## Overview

This document describes the implementation of an end-to-end AI-powered pipeline that automatically extracts and normalizes job specification fields from diverse job descriptions. The system is designed to support dynamic field discovery, strict JSON schema validation, and robust normalization suitable for CV-matching or recommendation systems.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Job Description Input                     │
│            (Text, PDF, HTML, Database Sources)               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   Input Validation Layer                     │
│              (Zod Schema Validation)                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  LangChain Orchestration                     │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Prompt Template                                      │  │
│  │  - System role definition                            │  │
│  │  - Task instructions                                 │  │
│  │  - Format specifications                             │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Ollama LLM Engine                         │
│              (llama3.2 or custom model)                      │
│  - Temperature: 0.1 (factual extraction)                     │
│  - Structured output parsing                                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Structured Output Parser                        │
│          (Zod Schema-based JSON Parser)                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│               Post-Processing & Normalization                │
│  - Field name normalization (snake_case)                     │
│  - Array deduplication                                       │
│  - Whitespace trimming                                       │
│  - Value validation                                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Confidence Score Generation                     │
│  - Field-level confidence scoring (0-1)                      │
│  - Text span tracing (future)                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                 Structured JSON Output                       │
│         (Ready for CV Matching/Recommendations)              │
└─────────────────────────────────────────────────────────────┘
```

## Implementation Details

### File Structure

```
src/app/jobs/
├── schema.ts                          # Zod schemas for input/output validation
└── usecase/
    └── extractJobSpecification.ts     # Main extraction use case implementation
```

### Key Features

#### 1. Dynamic Field Extraction

The system doesn't rely on pre-defined static fields. Instead, it uses an LLM to intelligently extract all relevant information from job descriptions, including:

- **Basic Information**: Job title, company, location
- **Employment Details**: Type, experience level, salary
- **Requirements**: Required skills, preferred skills, education
- **Job Details**: Responsibilities, benefits, application deadline
- **Extended Fields**: Any additional relevant information

#### 2. Strict Schema Validation

Input and output are validated using Zod schemas:

```typescript
// Input validation
export const ExtractJobSpecInput = z.object({
  jobDescription: z.string().min(1),
  sourceLanguage: z.enum(["en", "vn", "jp"]).optional(),
  targetLanguage: z.enum(["en", "vn", "jp"]).optional(),
  ollamaModel: z.string().optional(),
  ollamaBaseUrl: z.string().url().optional(),
});

// Output validation with strict typing
export const JobSpecificationOutput = z.object({
  jobTitle: z.string().optional(),
  company: z.string().optional(),
  // ... other fields
  confidenceScores: z.record(z.string(), z.number().min(0).max(1)).optional(),
});
```

#### 3. Robust Post-Processing

After LLM extraction, the output undergoes normalization:

- **String Normalization**: Trim whitespace, consistent casing
- **Array Deduplication**: Remove duplicate items from skill lists, benefits, etc.
- **Value Validation**: Ensure extracted values make sense
- **Field Unification**: Merge related fields when appropriate

#### 4. Multilingual Support

The system supports three languages:
- **English (en)**: Default
- **Vietnamese (vn)**: Full support
- **Japanese (jp)**: Full support

Translation between languages is handled within the prompt, allowing extraction from one language and output in another.

#### 5. Confidence Scoring

Each extracted field receives a confidence score (0-1) based on:
- Field presence and completeness
- Text length and detail level
- Future: Text span matching and NER confidence

## Usage

### Basic Usage

```typescript
import { extractJobSpecification } from "./src/app/jobs/usecase/extractJobSpecification.js";

const jobDescription = `
Senior Full-Stack Developer

We are looking for an experienced Full-Stack Developer to join our team.

Requirements:
- 5+ years of experience with React and Node.js
- Strong understanding of TypeScript
- Experience with cloud platforms (AWS, Azure)
- Bachelor's degree in Computer Science or related field

Responsibilities:
- Design and implement scalable web applications
- Collaborate with cross-functional teams
- Mentor junior developers

Benefits:
- Competitive salary ($120,000 - $150,000)
- Remote work option
- Health insurance
- 401(k) matching
`;

const result = await extractJobSpecification({
  jobDescription,
  sourceLanguage: "en",
  targetLanguage: "en",
});

console.log(result);
```

### Example Output

```json
{
  "jobTitle": "Senior Full-Stack Developer",
  "company": null,
  "location": "Remote",
  "employmentType": "full-time",
  "experienceLevel": "senior",
  "salary": "$120,000 - $150,000",
  "requiredSkills": [
    "React",
    "Node.js",
    "TypeScript",
    "AWS",
    "Azure",
    "Cloud Platforms"
  ],
  "preferredSkills": [],
  "education": "Bachelor's degree in Computer Science or related field",
  "responsibilities": [
    "Design and implement scalable web applications",
    "Collaborate with cross-functional teams",
    "Mentor junior developers"
  ],
  "benefits": [
    "Competitive salary",
    "Remote work option",
    "Health insurance",
    "401(k) matching"
  ],
  "applicationDeadline": null,
  "confidenceScores": {
    "jobTitle": 0.9,
    "location": 0.85,
    "employmentType": 0.8,
    "experienceLevel": 0.75,
    "salary": 0.7,
    "requiredSkills": 0.85,
    "education": 0.8,
    "responsibilities": 0.85,
    "benefits": 0.8
  }
}
```

### Multilingual Example

```typescript
const result = await extractJobSpecification({
  jobDescription: "Tuyển dụng Lập trình viên Full-Stack...", // Vietnamese job description
  sourceLanguage: "vn",
  targetLanguage: "en", // Output in English
});
```

## Configuration

### Ollama Setup

The system requires an Ollama instance running locally or remotely:

1. **Install Ollama**: Visit [ollama.ai](https://ollama.ai) and follow installation instructions

2. **Pull a model**:
   ```bash
   ollama pull llama3.2
   ```

3. **Start Ollama server** (usually runs on port 11434):
   ```bash
   ollama serve
   ```

4. **Configure the base URL** (if not using default):
   ```typescript
   const result = await extractJobSpecification({
     jobDescription: "...",
     ollamaBaseUrl: "http://your-ollama-server:11434",
     ollamaModel: "llama3.2", // or another model
   });
   ```

### Environment Variables

You can configure default values via environment variables:

```bash
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

## Advanced Features

### Future Enhancements

1. **Text Span Tracing**: Track which parts of the job description contributed to each extracted field
   
2. **Batch Processing**: Process multiple job descriptions in parallel
   ```typescript
   const results = await extractJobSpecificationsBatch([jd1, jd2, jd3]);
   ```

3. **PDF/HTML Support**: Direct parsing from PDF files and HTML pages
   ```typescript
   const result = await extractJobSpecification({
     jobDescriptionFile: "./path/to/job.pdf",
     format: "pdf",
   });
   ```

4. **Caching**: Cache LLM responses for identical job descriptions
   
5. **Explainability**: Provide explanations for why certain fields were extracted
   
6. **Custom Field Discovery**: Allow dynamic addition of custom fields based on industry or job type

## Integration Examples

### With Route Handler

```typescript
import { Hono } from "hono";
import { extractJobSpecification } from "../app/jobs/usecase/extractJobSpecification.js";
import { jsonRequestValidator } from "../core/validator.js";
import { ExtractJobSpecInput } from "../app/jobs/schema.js";
import { ok, err } from "../core/result.js";

const jobRoutes = new Hono();

jobRoutes.post(
  "/extract",
  jsonRequestValidator(ExtractJobSpecInput),
  async (c) => {
    try {
      const input = c.req.valid("json");
      const result = await extractJobSpecification(input);
      return c.json(ok(result));
    } catch (error) {
      return c.json(err(error), 400);
    }
  }
);

export default jobRoutes;
```

### With CV Matching System

```typescript
import { extractJobSpecification } from "./extractJobSpecification.js";
import { matchCandidateToJob } from "./matchCandidateToJob.js";

async function findBestCandidates(jobDescription: string, candidates: Candidate[]) {
  // Extract job requirements
  const jobSpec = await extractJobSpecification({ jobDescription });
  
  // Match each candidate against the job
  const matches = await Promise.all(
    candidates.map(candidate => matchCandidateToJob(candidate, jobSpec))
  );
  
  // Sort by match score
  return matches.sort((a, b) => b.score - a.score);
}
```

## Performance Considerations

### Response Time

- **Average**: 2-5 seconds per job description (depending on Ollama model and hardware)
- **Optimization**: Use streaming for real-time results (future enhancement)

### Resource Usage

- **Memory**: ~500MB for Ollama + model (llama3.2)
- **CPU**: Depends on model size and prompt complexity
- **GPU**: Recommended for faster processing (optional)

### Scaling

For production deployments:

1. **Load Balancing**: Multiple Ollama instances behind a load balancer
2. **Caching**: Redis cache for frequently processed job descriptions
3. **Async Processing**: Queue-based processing for batch operations
4. **Model Selection**: Choose smaller models for faster response times

## Error Handling

The system provides detailed error messages:

```typescript
try {
  const result = await extractJobSpecification(input);
} catch (error) {
  if (error instanceof DomainError) {
    console.error(`Extraction failed: ${error.message}`);
    console.error(`Code: ${error.code}`);
    console.error(`Details:`, error.details);
  }
}
```

Common error scenarios:
- **Invalid input**: Validation errors from Zod
- **Ollama connection failure**: Network or server errors
- **Model not found**: Specified model not available
- **Parsing failure**: LLM output doesn't match expected schema

## Testing

### Unit Tests

```typescript
import { describe, it, expect } from "vitest";
import { extractJobSpecification } from "./extractJobSpecification.js";

describe("extractJobSpecification", () => {
  it("should extract job title and skills", async () => {
    const result = await extractJobSpecification({
      jobDescription: "Senior Developer needed. Must know React and Node.js.",
    });
    
    expect(result.jobTitle).toContain("Developer");
    expect(result.requiredSkills).toContain("React");
    expect(result.requiredSkills).toContain("Node.js");
  });
  
  it("should handle multilingual input", async () => {
    const result = await extractJobSpecification({
      jobDescription: "Tuyển lập trình viên...",
      sourceLanguage: "vn",
      targetLanguage: "en",
    });
    
    expect(result.jobTitle).toBeDefined();
  });
});
```

### Integration Tests

Test the complete flow including Ollama integration (requires running Ollama instance).

## Monitoring & Observability

### Metrics to Track

1. **Extraction Success Rate**: Percentage of successful extractions
2. **Average Response Time**: Time from input to output
3. **Field Coverage**: Average number of fields extracted per job
4. **Confidence Scores**: Distribution of confidence scores across fields
5. **Error Rate**: Frequency and types of errors

### Logging

The system logs key events:
- Input received
- LLM invocation started
- Parsing completed
- Normalization applied
- Confidence scores generated
- Final output returned

## Best Practices

1. **Input Quality**: Provide clean, well-formatted job descriptions for best results
2. **Model Selection**: Choose appropriate Ollama models based on accuracy vs. speed requirements
3. **Prompt Engineering**: Customize prompts for specific industries or job types
4. **Validation**: Always validate extracted data before using in production systems
5. **Monitoring**: Track confidence scores to identify low-quality extractions

## Troubleshooting

### Common Issues

**Issue**: "Connection refused to Ollama"
- **Solution**: Ensure Ollama is running: `ollama serve`

**Issue**: Low confidence scores
- **Solution**: Try a more powerful model or improve input quality

**Issue**: Missing fields
- **Solution**: Check if information exists in job description; adjust prompt template

**Issue**: Incorrect extraction
- **Solution**: Review and refine prompt instructions; consider model fine-tuning

## References

- [LangChain Documentation](https://js.langchain.com/)
- [Ollama Documentation](https://ollama.ai/docs)
- [Zod Validation](https://zod.dev/)
- [Hono Framework](https://hono.dev/)

## License

This implementation is part of the hono-skeleton project and follows the same license.

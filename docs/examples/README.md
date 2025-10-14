# Examples

This directory contains practical examples demonstrating how to use the features implemented in the hono-skeleton project.

## Available Examples

### Job Extraction Example

**File**: `job-extraction-example.ts`

Demonstrates the Dynamic AI Pipeline for Automated Job Specification Extraction.

**Prerequisites**:
1. Install and run Ollama: https://ollama.ai
2. Pull a model: `ollama pull llama3.2`
3. Start Ollama server: `ollama serve` (usually runs on port 11434)

**Running the example**:

```bash
# Compile TypeScript first
npm run build

# Run the example
node dist/docs/examples/job-extraction-example.js
```

**What it demonstrates**:
- Basic job description extraction
- Minimal job description handling
- Multilingual support (Vietnamese to English)
- Custom Ollama configuration
- Confidence score analysis

## Adding New Examples

When adding new examples:

1. Create a new TypeScript file in this directory
2. Follow the naming convention: `<feature>-example.ts`
3. Include comprehensive comments explaining the example
4. Export functions for modular usage
5. Update this README with usage instructions

/**
 * Example usage of the Job Specification Extraction Pipeline
 * 
 * This file demonstrates how to use the extractJobSpecification use case
 * with various scenarios and configurations.
 */

import { extractJobSpecification } from "../../src/app/jobs/usecase/extractJobSpecification.js";

/**
 * Example 1: Basic Job Description Extraction
 */
async function basicExample() {
  console.log("=== Example 1: Basic Job Description Extraction ===\n");

  const jobDescription = `
Senior Full-Stack Developer

We are looking for an experienced Full-Stack Developer to join our dynamic team at TechCorp Inc.

Location: San Francisco, CA (Hybrid)
Employment Type: Full-time
Salary: $120,000 - $150,000 per year

Requirements:
- 5+ years of experience with React and Node.js
- Strong understanding of TypeScript
- Experience with cloud platforms (AWS, Azure, or GCP)
- Bachelor's degree in Computer Science or related field
- Excellent problem-solving and communication skills

Responsibilities:
- Design and implement scalable web applications
- Collaborate with cross-functional teams including designers and product managers
- Mentor junior developers and conduct code reviews
- Participate in architectural decisions
- Maintain high code quality and best practices

Benefits:
- Competitive salary with annual bonus
- Comprehensive health, dental, and vision insurance
- 401(k) with company match
- Flexible work schedule and remote work options
- Professional development budget
- Unlimited PTO

Application Deadline: December 31, 2025

Apply now and join our innovative team!
`;

  try {
    const result = await extractJobSpecification({
      jobDescription,
      sourceLanguage: "en",
      targetLanguage: "en",
    });

    console.log("Extracted Job Specification:");
    console.log(JSON.stringify(result, null, 2));
    console.log("\n");
  } catch (error) {
    console.error("Error:", error);
  }
}

/**
 * Example 2: Minimal Job Description
 */
async function minimalExample() {
  console.log("=== Example 2: Minimal Job Description ===\n");

  const jobDescription = `
Junior Developer position. Must know JavaScript and React. 
Remote work available. Send resume to jobs@example.com.
`;

  try {
    const result = await extractJobSpecification({
      jobDescription,
    });

    console.log("Extracted Job Specification:");
    console.log(JSON.stringify(result, null, 2));
    console.log("\n");
  } catch (error) {
    console.error("Error:", error);
  }
}

/**
 * Example 3: Vietnamese Job Description (requires translation)
 */
async function multilingualExample() {
  console.log("=== Example 3: Vietnamese Job Description ===\n");

  const jobDescription = `
Tuyển Lập Trình Viên Full-Stack Cấp Cao

Chúng tôi đang tìm kiếm một Lập trình viên Full-Stack có kinh nghiệm để gia nhập đội ngũ năng động của chúng tôi.

Yêu cầu:
- Có ít nhất 5 năm kinh nghiệm với React và Node.js
- Hiểu biết vững về TypeScript
- Kinh nghiệm với các nền tảng đám mây (AWS, Azure)
- Bằng cử nhân Khoa học Máy tính hoặc lĩnh vực liên quan

Trách nhiệm:
- Thiết kế và triển khai các ứng dụng web có khả năng mở rộng
- Cộng tác với các nhóm liên chức năng
- Hướng dẫn các lập trình viên mới

Lợi ích:
- Lương cạnh tranh ($120,000 - $150,000)
- Bảo hiểm y tế
- Làm việc từ xa
`;

  try {
    const result = await extractJobSpecification({
      jobDescription,
      sourceLanguage: "vn",
      targetLanguage: "en", // Extract in English
    });

    console.log("Extracted Job Specification (translated to English):");
    console.log(JSON.stringify(result, null, 2));
    console.log("\n");
  } catch (error) {
    console.error("Error:", error);
  }
}

/**
 * Example 4: Custom Ollama Configuration
 */
async function customConfigExample() {
  console.log("=== Example 4: Custom Ollama Configuration ===\n");

  const jobDescription = `
DevOps Engineer needed. 
Experience with Kubernetes, Docker, and CI/CD pipelines required.
Competitive salary and benefits.
`;

  try {
    const result = await extractJobSpecification({
      jobDescription,
      ollamaModel: "llama3.2", // Specify model
      ollamaBaseUrl: "http://localhost:11434", // Specify Ollama server
    });

    console.log("Extracted Job Specification:");
    console.log(JSON.stringify(result, null, 2));
    console.log("\n");
  } catch (error) {
    console.error("Error:", error);
  }
}

/**
 * Example 5: Confidence Score Analysis
 */
async function confidenceAnalysisExample() {
  console.log("=== Example 5: Confidence Score Analysis ===\n");

  const jobDescription = `
Software Engineer
Must have: Python, Django, PostgreSQL
Nice to have: AWS, Docker
`;

  try {
    const result = await extractJobSpecification({
      jobDescription,
    });

    console.log("Extracted Job Specification:");
    console.log(JSON.stringify(result, null, 2));
    
    if (result.confidenceScores) {
      console.log("\nConfidence Score Analysis:");
      Object.entries(result.confidenceScores).forEach(([field, score]) => {
        const confidence = score >= 0.8 ? "HIGH" : score >= 0.6 ? "MEDIUM" : "LOW";
        console.log(`  ${field}: ${(score * 100).toFixed(0)}% (${confidence})`);
      });
    }
    console.log("\n");
  } catch (error) {
    console.error("Error:", error);
  }
}

/**
 * Main function to run all examples
 */
async function runExamples() {
  console.log("Job Specification Extraction - Example Scenarios\n");
  console.log("=".repeat(60));
  console.log("\n");

  // Note: These examples require a running Ollama instance
  // Start Ollama with: ollama serve
  // Pull a model with: ollama pull llama3.2

  try {
    await basicExample();
    await minimalExample();
    await multilingualExample();
    await customConfigExample();
    await confidenceAnalysisExample();
    
    console.log("All examples completed successfully!");
  } catch (error) {
    console.error("Error running examples:", error);
    console.log("\nMake sure Ollama is running and you have pulled the required model:");
    console.log("  1. Install Ollama: https://ollama.ai");
    console.log("  2. Start Ollama: ollama serve");
    console.log("  3. Pull model: ollama pull llama3.2");
  }
}

// Run examples if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runExamples();
}

export {
  basicExample,
  minimalExample,
  multilingualExample,
  customConfigExample,
  confidenceAnalysisExample,
};

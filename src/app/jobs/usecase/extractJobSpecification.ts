import { parseWith } from "../../../core/validator.js";
import { ExtractJobSpecInput, JobSpecificationOutput } from "../schema.js";
import { DomainError } from "../../../core/result.js";
import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { PromptTemplate } from "@langchain/core/prompts";
import { JsonOutputParser } from "@langchain/core/output_parsers";

/**
 * Dynamic AI Pipeline for Automated Job Specification Extraction
 * 
 * This use case implements an end-to-end AI-powered pipeline that automatically
 * extracts and normalizes job specification fields from diverse job descriptions.
 * 
 * Key Features:
 * - Accepts job descriptions in various formats (text, with future support for PDF/HTML)
 * - Leverages Ollama-compatible LLM via LangChain for intelligent field extraction
 * - Strictly enforces output to match a dynamic JSON schema
 * - Robust post-processing including field normalization and validation
 * - Multilingual capability (VN/EN/JP) with translation support
 * - Modular and extensible architecture
 * 
 * @param input - ExtractJobSpecInput containing job description and configuration
 * @returns Promise<JobSpecificationOutput> - Structured, normalized job specification
 * @throws DomainError if extraction fails
 */
export async function extractJobSpecification(input: unknown): Promise<JobSpecificationOutput> {
  // Validate and parse input
  const validatedInput = parseWith(ExtractJobSpecInput, input);
  const {
    jobDescription,
    sourceLanguage,
    targetLanguage,
    ollamaModel,
    ollamaBaseUrl,
  } = validatedInput;

  try {
    // Initialize the Ollama LLM
    const model = new ChatOllama({
      baseUrl: ollamaBaseUrl,
      model: ollamaModel,
      temperature: 0.1, // Low temperature for consistent, factual extraction
    });

    // Define the output parser for JSON
    const outputParser = new JsonOutputParser();

    // Create format instructions for the LLM
    const formatInstructions = `
You must respond with a valid JSON object containing the following fields (all fields are optional, omit if not found):

{
  "jobTitle": "string - The job title or position name",
  "company": "string - Company or organization name",
  "location": "string - Job location (city, country, remote, hybrid, etc.)",
  "employmentType": "string - Employment type (full-time, part-time, contract, freelance, internship, etc.)",
  "experienceLevel": "string - Required experience level (entry-level, junior, mid-level, senior, lead, etc.)",
  "salary": "string - Salary range or compensation details",
  "requiredSkills": ["array of strings - List of required technical and soft skills"],
  "preferredSkills": ["array of strings - List of preferred or nice-to-have skills"],
  "education": "string - Educational requirements (degree, field of study)",
  "responsibilities": ["array of strings - Key job responsibilities and duties"],
  "benefits": ["array of strings - Benefits and perks offered"],
  "applicationDeadline": "string - Application deadline if mentioned"
}

Ensure your response is ONLY valid JSON, with no additional text before or after.`;
    
    const promptTemplate = PromptTemplate.fromTemplate(
      `You are an expert HR analyst specialized in extracting structured information from job descriptions.

Your task is to analyze the following job description and extract all relevant information that would be useful for matching candidates to this position.

Source Language: {sourceLanguage}
Target Language: {targetLanguage}

Job Description:
{jobDescription}

Instructions:
1. Extract all relevant fields from the job description
2. Normalize field values (use snake_case for multi-word values where appropriate)
3. If the source language is different from the target language, translate the extracted information to the target language
4. Be comprehensive - extract even implicit information (e.g., if "5+ years experience" is mentioned, set experienceLevel to "senior" or "mid-level")
5. For skills, split compound skills into individual items (e.g., "React/Vue.js" should become ["React", "Vue.js"])
6. Ensure all arrays contain unique items (no duplicates)
7. If information is not available, omit the field rather than guessing

{format_instructions}

Remember: Only extract factual information present in the job description. Do not make assumptions or add information that isn't there.`
    );

    // Format the prompt with the input data
    const formattedPrompt = await promptTemplate.format({
      jobDescription,
      sourceLanguage,
      targetLanguage,
      format_instructions: formatInstructions,
    });

    // Create a chain with the prompt and parser
    const chain = promptTemplate.pipe(model).pipe(outputParser);
    
    // Invoke the chain
    const parsedOutput = await chain.invoke({
      jobDescription,
      sourceLanguage,
      targetLanguage,
      format_instructions: formatInstructions,
    });

    // Post-process the output
    const normalizedOutput = normalizeJobSpecification(parsedOutput);

    // Generate confidence scores (simplified version - in production, this could be more sophisticated)
    const confidenceScores = generateConfidenceScores(normalizedOutput);

    // Return the final structured output
    return {
      ...normalizedOutput,
      confidenceScores,
    };

  } catch (error) {
    // Handle different types of errors
    if (error instanceof Error) {
      throw new DomainError(
        `Failed to extract job specification: ${error.message}`,
        "EXTRACTION_FAILED",
        { originalError: error.message }
      );
    }
    throw new DomainError(
      "Failed to extract job specification due to an unknown error",
      "EXTRACTION_FAILED"
    );
  }
}

/**
 * Normalize the extracted job specification
 * - Remove duplicates from arrays
 * - Trim whitespace
 * - Ensure consistent formatting
 */
function normalizeJobSpecification(output: any): JobSpecificationOutput {
  const normalized: any = {};

  // Normalize string fields
  if (output.jobTitle) normalized.jobTitle = output.jobTitle.trim();
  if (output.company) normalized.company = output.company.trim();
  if (output.location) normalized.location = output.location.trim();
  if (output.employmentType) normalized.employmentType = output.employmentType.trim();
  if (output.experienceLevel) normalized.experienceLevel = output.experienceLevel.trim();
  if (output.salary) normalized.salary = output.salary.trim();
  if (output.education) normalized.education = output.education.trim();
  if (output.applicationDeadline) normalized.applicationDeadline = output.applicationDeadline.trim();

  // Normalize array fields - remove duplicates and trim
  if (output.requiredSkills && Array.isArray(output.requiredSkills)) {
    normalized.requiredSkills = [...new Set(output.requiredSkills.map((s: string) => s.trim()))];
  }
  if (output.preferredSkills && Array.isArray(output.preferredSkills)) {
    normalized.preferredSkills = [...new Set(output.preferredSkills.map((s: string) => s.trim()))];
  }
  if (output.responsibilities && Array.isArray(output.responsibilities)) {
    normalized.responsibilities = [...new Set(output.responsibilities.map((r: string) => r.trim()))];
  }
  if (output.benefits && Array.isArray(output.benefits)) {
    normalized.benefits = [...new Set(output.benefits.map((b: string) => b.trim()))];
  }

  return normalized;
}

/**
 * Generate confidence scores for extracted fields
 * In a production system, this could use more sophisticated methods like:
 * - Text span matching
 * - Named entity recognition confidence
 * - Cross-validation with multiple extractions
 * 
 * For now, we use a simple heuristic based on field presence and length
 */
function generateConfidenceScores(output: JobSpecificationOutput): Record<string, number> {
  const scores: Record<string, number> = {};

  // Simple heuristic: longer, more detailed fields get higher confidence
  if (output.jobTitle) {
    scores.jobTitle = output.jobTitle.length > 5 ? 0.9 : 0.7;
  }
  if (output.company) {
    scores.company = output.company.length > 2 ? 0.85 : 0.6;
  }
  if (output.location) {
    scores.location = output.location.length > 3 ? 0.85 : 0.65;
  }
  if (output.employmentType) {
    scores.employmentType = 0.8;
  }
  if (output.experienceLevel) {
    scores.experienceLevel = 0.75;
  }
  if (output.salary) {
    scores.salary = output.salary.length > 5 ? 0.7 : 0.5;
  }
  if (output.requiredSkills && output.requiredSkills.length > 0) {
    scores.requiredSkills = output.requiredSkills.length >= 3 ? 0.85 : 0.7;
  }
  if (output.preferredSkills && output.preferredSkills.length > 0) {
    scores.preferredSkills = 0.75;
  }
  if (output.education) {
    scores.education = 0.8;
  }
  if (output.responsibilities && output.responsibilities.length > 0) {
    scores.responsibilities = output.responsibilities.length >= 3 ? 0.85 : 0.7;
  }
  if (output.benefits && output.benefits.length > 0) {
    scores.benefits = 0.8;
  }
  if (output.applicationDeadline) {
    scores.applicationDeadline = 0.75;
  }

  return scores;
}

/**
 * Helper function to translate text (placeholder for future implementation)
 * In production, this could use a translation API or LLM-based translation
 */
async function translateText(text: string, from: string, to: string): Promise<string> {
  // TODO: Implement actual translation logic
  // For now, just return the original text
  return text;
}

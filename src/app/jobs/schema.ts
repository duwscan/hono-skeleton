import { z } from "zod";

/**
 * Input schema for job specification extraction
 * Accepts job descriptions in various formats
 */
export const ExtractJobSpecInput = z.object({
  /** Raw job description text */
  jobDescription: z.string().min(1, "Job description is required"),
  
  /** Source language (optional, for translation support) */
  sourceLanguage: z.enum(["en", "vn", "jp"]).optional().default("en"),
  
  /** Target language for output (optional) */
  targetLanguage: z.enum(["en", "vn", "jp"]).optional().default("en"),
  
  /** Ollama model to use (optional, defaults to llama3.2) */
  ollamaModel: z.string().optional().default("llama3.2"),
  
  /** Ollama base URL (optional, defaults to http://localhost:11434) */
  ollamaBaseUrl: z.string().url().optional().default("http://localhost:11434"),
});

export type ExtractJobSpecInput = z.infer<typeof ExtractJobSpecInput>;

/**
 * Output schema representing extracted job specification
 * Dynamic fields extracted from job description
 */
export const JobSpecificationOutput = z.object({
  /** Extracted job title */
  jobTitle: z.string().optional(),
  
  /** Company name if mentioned */
  company: z.string().optional(),
  
  /** Job location (city, country, remote, etc.) */
  location: z.string().optional(),
  
  /** Employment type (full-time, part-time, contract, etc.) */
  employmentType: z.string().optional(),
  
  /** Experience level required */
  experienceLevel: z.string().optional(),
  
  /** Salary range or compensation details */
  salary: z.string().optional(),
  
  /** Required skills (array of skill names) */
  requiredSkills: z.array(z.string()).optional(),
  
  /** Preferred/nice-to-have skills */
  preferredSkills: z.array(z.string()).optional(),
  
  /** Educational requirements */
  education: z.string().optional(),
  
  /** Job responsibilities/duties */
  responsibilities: z.array(z.string()).optional(),
  
  /** Benefits offered */
  benefits: z.array(z.string()).optional(),
  
  /** Application deadline if specified */
  applicationDeadline: z.string().optional(),
  
  /** Any other dynamically extracted fields */
  additionalFields: z.record(z.string(), z.any()).optional(),
  
  /** Confidence scores for each extracted field (0-1) */
  confidenceScores: z.record(z.string(), z.number().min(0).max(1)).optional(),
});

export type JobSpecificationOutput = z.infer<typeof JobSpecificationOutput>;

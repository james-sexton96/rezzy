import {CoverLetterResponse, CoverLetterSchema} from "../schemas.ts";
import {createJsonTranslator, createLanguageModel} from "typechat";
import {createZodJsonValidator} from "typechat/zod";
import {ResumeSchema} from "@kurone-kito/jsonresume-types";
import { checkOpenAIEnv } from "../utils/openai_utils.ts";

export async function fetchAiCoverLetter(
  jobDescription: string,
  resume: ResumeSchema,
  prompt?: string,
  // Optional parameters for dependency injection in tests
  languageModelFn = createLanguageModel,
  validatorFn = createZodJsonValidator,
  translatorFn = createJsonTranslator
): Promise<CoverLetterSchema> {
  // Check if OpenAI environment variables are valid
  checkOpenAIEnv();

  const model = languageModelFn(Deno.env.toObject());
  const validator = validatorFn(
    { CoverLetterResponse },
    "CoverLetterResponse",
  );
  const translator = translatorFn(model, validator);

  const request = [
    'Your job\n\n',
    'You are an experienced resume cover letter writer.\n\n' +
    'Your task is to write a clear, tailored cover letter based on two inputs:\n' +
    '1. A JSON resume that contains the candidate\'s background, including work experience, education, skills, and achievements.\n' +
    '2. A job description that outlines the role, responsibilities, and qualifications required for the position.\n\n' +
    'Instructions:\n' +
    '• Carefully read the job description and identify key responsibilities and qualifications.\n' +
    '• Analyze the resume and find the most relevant experience, skills, and accomplishments that align with the job.\n' +
    '• Write a concise, customized cover letter (no more than one page) that:\n' +
    '  • Feels natural, confident, and professional—avoid overly formal or clichéd language.\n' +
    '  • Shows genuine interest in the role and organization.\n' +
    '  • Highlights how the candidate\'s experience connects to the job’s goals.\n' +
    '  • Includes specific examples and value the candidate brings to the position.\n' +
    '• Avoid repeating the resume. Instead, provide context and connect past work to the new opportunity.\n\n' +
    'Tone: Honest, human, and articulate. Avoid phrases like "esteemed company" or "I am writing to express..." unless they are truly warranted.\n\n',
    `Important: If any required information like company address or contact name is missing,\n` +
    `use placeholder text like [COMPANY ADDRESS] or [HIRING MANAGER NAME].\n\n`,
    prompt ? `Also: ${prompt}` : "\n",
    `My resume in JSON format:\n`,
    JSON.stringify(resume, null, 2),
    `\n\nThis is the job description:\n`,
    jobDescription
  ].join("\n\n");

  try {
    const response = await translator.translate(request);
    if (!response.success) {
      // Check if it's a 403 Forbidden error
      if (response.message.includes("403: Forbidden")) {
        throw new Error(
          "OpenAI API returned a 403 Forbidden error. This usually means:\n" +
          "1. Your API key is invalid or expired\n" +
          "2. Your API key doesn't have permission to use the specified model\n" +
          "3. The model specified in OPENAI_MODEL environment variable is not available\n\n" +
          "Please check your OPENAI_API_KEY and OPENAI_MODEL environment variables.\n" +
          "Original error: " + response.message
        );
      }
      throw new Error(response.message);
    }
    return response.data;
  } catch (error) {
    // If it's already our enhanced error, just rethrow it
    if (error instanceof Error && error.message.includes("OpenAI API returned a 403 Forbidden error")) {
      throw error;
    }

    // Check if it's a 403 error from a different source
    if (error instanceof Error && 
        (error.message.includes("403: Forbidden") || error.message.includes("REST API error 403"))) {
      throw new Error(
        "OpenAI API returned a 403 Forbidden error. This usually means:\n" +
        "1. Your API key is invalid or expired\n" +
        "2. Your API key doesn't have permission to use the specified model\n" +
        "3. The model specified in OPENAI_MODEL environment variable is not available\n\n" +
        "Please check your OPENAI_API_KEY and OPENAI_MODEL environment variables.\n" +
        "Original error: " + error.message
      );
    }

    // For other errors, just rethrow
    throw error;
  }
}

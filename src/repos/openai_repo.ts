import {CoverLetterResponse, CoverLetterSchema} from "../schemas.ts";
import {createJsonTranslator, createLanguageModel} from "typechat";
import {createZodJsonValidator} from "typechat/zod";
import {ResumeSchema} from "@kurone-kito/jsonresume-types";
import { checkOpenAIEnv } from "../utils/openai_utils.ts";

export async function fetchAiCoverLetter(
  jobDescription: string,
  resume: ResumeSchema,
  prompt?: string,
): Promise<CoverLetterSchema> {
  // Check if OpenAI environment variables are valid
  checkOpenAIEnv();

  const model = createLanguageModel(Deno.env.toObject());
  const validator = createZodJsonValidator(
    { CoverLetterResponse },
    "CoverLetterResponse",
  );
  const translator = createJsonTranslator(model, validator);

  const request = [
    `Build a job application cover letter tailored for my resume:`,
    prompt ? `Also: ${prompt}` : "",
    `My resume is here in JSON format: `,
    JSON.stringify(resume, null, 2),
    `This is the job description: `,
    jobDescription,
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
    if (error.message.includes("OpenAI API returned a 403 Forbidden error")) {
      throw error;
    }

    // Check if it's a 403 error from a different source
    if (error.message.includes("403: Forbidden") || error.message.includes("REST API error 403")) {
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

import {CoverLetterResponse, CoverLetterSchema} from "../schemas.ts";
import {createJsonTranslator, createLanguageModel} from "typechat";
import {createZodJsonValidator} from "typechat/zod";
import {ResumeSchema} from "@kurone-kito/jsonresume-types";

export async function fetchAiCoverLetter(
  jobDescription: string,
  resume: ResumeSchema,
  prompt?: string,
): Promise<CoverLetterSchema> {
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

  const response = await translator.translate(request);
  if (!response.success) throw new Error(response.message);

  return response.data;
}

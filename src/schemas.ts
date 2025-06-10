import { z } from "zod";

export const CoverLetterResponse = z.object({
  firstName: z.string().describe("The first name of the applicant"),
  letterBody: z.string().describe("The body of the cover letter"),
});

export type CoverLetter = z.infer<typeof CoverLetterResponse>;

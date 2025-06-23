import { z } from "zod";

export const CoverLetterResponse = z.object({
  greeting: z.string().describe(
    "The first line of the letter to greet the hiring manager or team",
  ),
  companyStreetAddress: z.string().describe("The comapny street address"),
  companyCity: z.string().describe("The comapny city"),
  companyState: z.string().describe("The company state"),
  companyZipCode: z.string().describe("The company zip code"),
  letterBody: z.string().describe("The body of the cover letter"),
});

export type CoverLetterSchema = z.infer<typeof CoverLetterResponse>;

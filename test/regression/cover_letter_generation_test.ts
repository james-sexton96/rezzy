import { assertEquals } from "@std/assert";
import { Rezzy } from "../../src/rezzy.ts";
import { ResumeSchema } from "@kurone-kito/jsonresume-types";
import { CoverLetterSchema } from "../../src/schemas.ts";

// Sample resume data for testing
const sampleResume: ResumeSchema = {
  basics: {
    name: "John Doe",
    label: "Software Developer",
    email: "john@example.com",
    phone: "123-456-7890",
    url: "https://johndoe.com",
    location: {
      city: "San Francisco",
      region: "CA",
    },
  },
};

// Sample cover letter data for testing
const sampleCoverLetter: CoverLetterSchema = {
  greeting: "Dear Hiring Manager,",
  companyStreetAddress: "123 Main St",
  companyCity: "San Francisco",
  companyState: "CA",
  companyZipCode: "94105",
  letterBody:
    "I am writing to apply for the Software Developer position. With my experience in TypeScript and Deno, I believe I would be a great fit for your team.",
};

/**
 * Regression test for cover letter generation
 *
 * This test verifies that the application can correctly generate a cover letter
 * using a resume and cover letter data.
 */
Deno.test({
  name: "Regression: Cover letter generation",
  fn: () => {
    // Create a Rezzy instance with the sample resume and cover letter
    const rezzy = new Rezzy(sampleResume, sampleCoverLetter);

    // Generate the resume and cover letter
    const result = rezzy.buildRezzyResult();

    // Verify that the cover letter was generated
    assertEquals(
      result.latexCoverLetter !== undefined,
      true,
      "Cover letter should be generated",
    );

    // Convert the LaTeX array to a string for easier testing
    const latexString = result.latexCoverLetter!.join("\n");

    // Verify that the LaTeX contains expected elements
    assertEquals(
      latexString.includes("JOHN DOE"),
      true,
      "Cover letter should contain the name",
    );
    assertEquals(
      latexString.includes("123-456-7890"),
      true,
      "Cover letter should contain the phone number",
    );
    assertEquals(
      latexString.includes("San Francisco, CA"),
      true,
      "Cover letter should contain the location",
    );
    assertEquals(
      latexString.includes("john@example.com"),
      true,
      "Cover letter should contain the email",
    );
    assertEquals(
      latexString.includes("Dear Hiring Manager,"),
      true,
      "Cover letter should contain the greeting",
    );
    assertEquals(
      latexString.includes("123 Main St"),
      true,
      "Cover letter should contain the company street address",
    );
    assertEquals(
      latexString.includes("San Francisco, CA 94105"),
      true,
      "Cover letter should contain the company location",
    );
    assertEquals(
      latexString.includes("I am writing to apply"),
      true,
      "Cover letter should contain the letter body",
    );

    // Verify that the LaTeX structure is correct
    assertEquals(
      latexString.includes("\\documentclass"),
      true,
      "Cover letter should start with documentclass",
    );
    assertEquals(
      latexString.includes("\\begin{document}"),
      true,
      "Cover letter should have begin document",
    );
    assertEquals(
      latexString.includes("\\end{document}"),
      true,
      "Cover letter should have end document",
    );
  },
});

/**
 * Regression test for resume and cover letter integration
 *
 * This test verifies that the application can correctly generate both a resume and cover letter,
 * and that they share consistent information from the resume data.
 */
Deno.test({
  name: "Regression: Resume and cover letter integration",
  fn: () => {
    // Create a Rezzy instance with the sample resume and cover letter
    const rezzy = new Rezzy(sampleResume, sampleCoverLetter);

    // Generate the resume and cover letter
    const result = rezzy.buildRezzyResult();

    // Verify that both resume and cover letter were generated
    assertEquals(
      result.latexResume.length > 0,
      true,
      "Resume should be generated",
    );
    assertEquals(
      result.latexCoverLetter !== undefined,
      true,
      "Cover letter should be generated",
    );
    assertEquals(
      result.latexCoverLetter!.length > 0,
      true,
      "Cover letter should not be empty",
    );

    // Convert the LaTeX arrays to strings for easier testing
    const resumeLatex = result.latexResume.join("\n");
    const coverLetterLatex = result.latexCoverLetter!.join("\n");

    // Verify that both documents contain consistent information from the resume
    assertEquals(
      resumeLatex.includes("John Doe"),
      true,
      "Resume should contain the name",
    );
    assertEquals(
      coverLetterLatex.includes("JOHN DOE"),
      true,
      "Cover letter should contain the name",
    );

    assertEquals(
      resumeLatex.includes("john@example.com"),
      true,
      "Resume should contain the email",
    );
    assertEquals(
      coverLetterLatex.includes("john@example.com"),
      true,
      "Cover letter should contain the email",
    );

    assertEquals(
      resumeLatex.includes("123-456-7890"),
      true,
      "Resume should contain the phone number",
    );
    assertEquals(
      coverLetterLatex.includes("123-456-7890"),
      true,
      "Cover letter should contain the phone number",
    );

    // Verify that both documents have correct LaTeX structure
    assertEquals(
      resumeLatex.includes("\\documentclass"),
      true,
      "Resume should start with documentclass",
    );
    assertEquals(
      coverLetterLatex.includes("\\documentclass"),
      true,
      "Cover letter should start with documentclass",
    );

    assertEquals(
      resumeLatex.includes("\\begin{document}"),
      true,
      "Resume should have begin document",
    );
    assertEquals(
      coverLetterLatex.includes("\\begin{document}"),
      true,
      "Cover letter should have begin document",
    );

    assertEquals(
      resumeLatex.includes("\\end{document}"),
      true,
      "Resume should have end document",
    );
    assertEquals(
      coverLetterLatex.includes("\\end{document}"),
      true,
      "Cover letter should have end document",
    );
  },
});

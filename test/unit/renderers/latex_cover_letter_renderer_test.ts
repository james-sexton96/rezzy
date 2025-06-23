import { assertEquals } from "@std/assert";
import { LatexCoverLetterRenderer } from "../../../src/renderers/latex_cover_letter_renderer.ts";
import { CoverLetterSchema } from "../../../src/schemas.ts";
import { ResumeSchema } from "@kurone-kito/jsonresume-types";

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
    profiles: [
      {
        network: "LinkedIn",
        username: "johndoe",
        url: "https://linkedin.com/in/johndoe",
      },
    ],
  },
};

// Sample cover letter data for testing
const sampleCoverLetter: CoverLetterSchema = {
  greeting: "Dear Hiring Manager,",
  companyStreetAddress: "123 Main St",
  companyCity: "San Francisco",
  companyState: "CA",
  companyZipCode: "94105",
  letterBody: "I am writing to apply for the Software Developer position.",
};

Deno.test("LatexCoverLetterRenderer - renders complete cover letter", () => {
  const renderer = new LatexCoverLetterRenderer(
    sampleResume,
    sampleCoverLetter,
  );
  const result = renderer.render();

  // Test that the result is an array of strings
  assertEquals(Array.isArray(result), true);

  // Test that the result contains the expected LaTeX commands and content
  const resultString = result.join("\n");

  // Check for preamble elements
  assertEquals(
    resultString.includes("\\documentclass[12pt,letterpaper]{article}"),
    true,
  );
  assertEquals(resultString.includes("\\begin{document}"), true);

  // Check for header elements
  assertEquals(resultString.includes("JOHN DOE"), true);
  assertEquals(resultString.includes("123-456-7890"), true);
  assertEquals(resultString.includes("San Francisco, CA"), true);
  assertEquals(resultString.includes("john@example.com"), true);
  assertEquals(resultString.includes("https://johndoe.com"), true);
  assertEquals(resultString.includes("https://linkedin.com/in/johndoe"), true);

  // Check for body elements
  assertEquals(resultString.includes("123 Main St"), true);
  assertEquals(resultString.includes("San Francisco, CA 94105"), true);
  assertEquals(resultString.includes("Dear Hiring Manager,"), true);
  assertEquals(
    resultString.includes(
      "I am writing to apply for the Software Developer position.",
    ),
    true,
  );

  // Check for footer elements
  assertEquals(resultString.includes("\\end{document}"), true);
});

Deno.test("LatexCoverLetterRenderer - handles missing resume basics", () => {
  // Create a resume with missing basics
  const incompleteResume: ResumeSchema = {};

  const renderer = new LatexCoverLetterRenderer(
    incompleteResume,
    sampleCoverLetter,
  );
  const result = renderer.render();

  // Test that the result is an array of strings
  assertEquals(Array.isArray(result), true);

  // Test that the result still contains the essential LaTeX structure
  const resultString = result.join("\n");

  // Check for preamble and document structure
  assertEquals(
    resultString.includes("\\documentclass[12pt,letterpaper]{article}"),
    true,
  );
  assertEquals(resultString.includes("\\begin{document}"), true);
  assertEquals(resultString.includes("\\end{document}"), true);

  // Check that it handles missing name gracefully
  assertEquals(resultString.includes("UNDEFINED"), false);

  // Check that the cover letter content is still present
  assertEquals(resultString.includes("123 Main St"), true);
  assertEquals(resultString.includes("San Francisco, CA 94105"), true);
  assertEquals(resultString.includes("Dear Hiring Manager,"), true);
  assertEquals(
    resultString.includes(
      "I am writing to apply for the Software Developer position.",
    ),
    true,
  );
});

Deno.test("LatexCoverLetterRenderer - handles missing location in resume", () => {
  // Create a resume with missing location
  const resumeWithoutLocation: ResumeSchema = {
    basics: {
      name: "John Doe",
      email: "john@example.com",
      phone: "123-456-7890",
      url: "https://johndoe.com",
      profiles: [],
    },
  };

  const renderer = new LatexCoverLetterRenderer(
    resumeWithoutLocation,
    sampleCoverLetter,
  );
  const result = renderer.render();

  // Test that the result is an array of strings
  assertEquals(Array.isArray(result), true);

  // Test that the result still contains the essential LaTeX structure
  const resultString = result.join("\n");

  // Check for preamble and document structure
  assertEquals(
    resultString.includes("\\documentclass[12pt,letterpaper]{article}"),
    true,
  );
  assertEquals(resultString.includes("\\begin{document}"), true);
  assertEquals(resultString.includes("\\end{document}"), true);

  // Check that it includes the name and contact info that is available
  assertEquals(resultString.includes("JOHN DOE"), true);
  assertEquals(resultString.includes("123-456-7890"), true);
  assertEquals(resultString.includes("john@example.com"), true);

  // Check that the cover letter content is still present
  assertEquals(resultString.includes("123 Main St"), true);
  assertEquals(resultString.includes("San Francisco, CA 94105"), true);
  assertEquals(resultString.includes("Dear Hiring Manager,"), true);
  assertEquals(
    resultString.includes(
      "I am writing to apply for the Software Developer position.",
    ),
    true,
  );
});

Deno.test("LatexCoverLetterRenderer - handles empty profiles array", () => {
  // Create a resume with empty profiles array
  const resumeWithEmptyProfiles: ResumeSchema = {
    basics: {
      name: "John Doe",
      email: "john@example.com",
      phone: "123-456-7890",
      url: "https://johndoe.com",
      location: {
        city: "San Francisco",
        region: "CA",
      },
      profiles: [],
    },
  };

  const renderer = new LatexCoverLetterRenderer(
    resumeWithEmptyProfiles,
    sampleCoverLetter,
  );
  const result = renderer.render();

  // Test that the result is an array of strings
  assertEquals(Array.isArray(result), true);

  // Test that the result still contains the expected content
  const resultString = result.join("\n");

  // Check that it includes the name and contact info
  assertEquals(resultString.includes("JOHN DOE"), true);
  assertEquals(resultString.includes("123-456-7890"), true);
  assertEquals(resultString.includes("San Francisco, CA"), true);
  assertEquals(resultString.includes("john@example.com"), true);

  // Check that no profile URLs are included
  assertEquals(resultString.includes("linkedin.com"), false);
});

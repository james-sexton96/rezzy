import { assertEquals } from "@std/assert";
import { Rezzy } from "../../src/rezzy.ts";
import { ResumeSchema } from "@kurone-kito/jsonresume-types";

// Sample resume data for testing
const sampleResume: ResumeSchema = {
  basics: {
    name: "John Doe",
    label: "Software Developer",
    email: "john@example.com",
    phone: "123-456-7890",
    url: "https://johndoe.com",
    summary: "Experienced software developer with a passion for creating elegant solutions.",
    location: {
      city: "San Francisco",
      region: "CA"
    },
    profiles: [
      {
        network: "LinkedIn",
        username: "johndoe",
        url: "https://linkedin.com/in/johndoe"
      }
    ]
  },
  work: [
    {
      name: "Tech Company",
      position: "Senior Developer",
      startDate: "2020-01-01",
      endDate: "Present",
      summary: "Lead developer for a major project.",
      highlights: [
        "Implemented new features",
        "Improved performance by 50%",
        "Mentored junior developers"
      ]
    }
  ],
  education: [
    {
      institution: "University",
      area: "Computer Science",
      studyType: "Bachelor",
      startDate: "2012-09-01",
      endDate: "2016-06-01"
    }
  ],
  skills: [
    {
      name: "Programming",
      keywords: ["JavaScript", "TypeScript", "Python"]
    }
  ],
  interests: [
    {
      name: "Areas of Expertise",
      keywords: ["Web Development", "Backend Systems", "Cloud Architecture"]
    }
  ]
};

/**
 * Regression test for resume generation
 * 
 * This test verifies that the application can correctly generate a resume from a JSON object.
 * It checks that the generated LaTeX contains expected elements from the resume.
 */
Deno.test({
  name: "Regression: Resume generation from JSON",
  fn: () => {
    // Create a Rezzy instance with the sample resume
    const rezzy = new Rezzy(sampleResume);

    // Generate the resume
    const result = rezzy.buildRezzyResult();

    // Convert the LaTeX array to a string for easier testing
    const latexString = result.latexResume.join("\n");

    // Verify that the LaTeX contains expected elements
    assertEquals(latexString.includes("John Doe"), true, "Resume should contain the name");
    assertEquals(latexString.includes("john@example.com"), true, "Resume should contain the email");
    assertEquals(latexString.includes("123-456-7890"), true, "Resume should contain the phone number");
    assertEquals(latexString.includes("San Francisco, CA"), true, "Resume should contain the location");
    assertEquals(latexString.includes("Tech Company"), true, "Resume should contain the company name");
    assertEquals(latexString.includes("University"), true, "Resume should contain the education institution");
    assertEquals(latexString.includes("Computer Science"), true, "Resume should contain the education area");
    assertEquals(latexString.includes("JavaScript"), true, "Resume should contain the skills");
    assertEquals(latexString.includes("Areas of Expertise"), true, "Resume should contain the interests section");

    // Verify that the LaTeX structure is correct
    assertEquals(latexString.includes("\\documentclass"), true, "Resume should start with documentclass");
    assertEquals(latexString.includes("\\begin{document}"), true, "Resume should have begin document");
    assertEquals(latexString.includes("\\end{document}"), true, "Resume should have end document");
  }
});

/**
 * Regression test for resume generation with minimal data
 * 
 * This test verifies that the application can correctly generate a resume from a minimal JSON object.
 * It checks that the generated LaTeX contains expected elements and doesn't crash with minimal data.
 */
Deno.test({
  name: "Regression: Resume generation with minimal data",
  fn: () => {
    // Create a minimal resume with only required fields
    const minimalResume: ResumeSchema = {
      basics: {
        name: "Jane Smith",
        label: "Developer",
        email: "jane@example.com"
      }
    };

    // Create a Rezzy instance with the minimal resume
    const rezzy = new Rezzy(minimalResume);

    // Generate the resume
    const result = rezzy.buildRezzyResult();

    // Convert the LaTeX array to a string for easier testing
    const latexString = result.latexResume.join("\n");

    // Verify that the LaTeX contains expected elements
    assertEquals(latexString.includes("Jane Smith"), true, "Resume should contain the name");
    assertEquals(latexString.includes("jane@example.com"), true, "Resume should contain the email");

    // Verify that the LaTeX structure is correct
    assertEquals(latexString.includes("\\documentclass"), true, "Resume should start with documentclass");
    assertEquals(latexString.includes("\\begin{document}"), true, "Resume should have begin document");
    assertEquals(latexString.includes("\\end{document}"), true, "Resume should have end document");
  }
});

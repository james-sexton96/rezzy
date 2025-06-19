import { assertEquals } from "@std/assert";
import { processDocumentWithOpenAI } from "../../src/repos/document_repo.ts";
import { ResumeSchema } from "@kurone-kito/jsonresume-types";

/**
 * END-TO-END TEST: Document Processing with OpenAI
 * 
 * IMPORTANT: This test makes actual API calls to OpenAI and will incur charges.
 * It requires valid API keys with appropriate permissions.
 * 
 * To run this test:
 * 1. Set up the necessary environment variables:
 *    - OPENAI_API_KEY: Your OpenAI API key
 *    - OPENAI_MODEL: A valid OpenAI model (e.g., gpt-4-turbo)
 *    - OPENAI_VISION_MODEL: A valid OpenAI vision model (e.g., gpt-4o)
 * 
 * 2. Ensure you have a test PDF resume file available
 * 
 * 3. Run the test with:
 *    deno test --allow-env --allow-read --allow-write --allow-net test/end_to_end/document_processing_e2e_test.ts
 * 
 * This test should be run manually and infrequently, such as before major releases
 * or when significant changes are made to the OpenAI integration code.
 */

// Path to a test PDF resume file
// Replace this with the path to an actual PDF resume file on your system
const TEST_PDF_PATH = "./resume.pdf";

// This test is ignored by default to prevent accidental API calls
// Remove the ignore property to run the test
Deno.test({
  // ignore: true, // Set to false to run the test
  name: "E2E: Process document with actual OpenAI API call",
  fn: async () => {
    // Check if environment variables are set
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    const model = Deno.env.get("OPENAI_MODEL");
    const visionModel = Deno.env.get("OPENAI_VISION_MODEL");

    if (!apiKey || !model || !visionModel) {
      console.warn("Skipping E2E test: Required environment variables not set");
      return;
    }

    // Check if the test PDF file exists
    try {
      await Deno.stat(TEST_PDF_PATH);
    } catch (error) {
      console.warn(`Skipping E2E test: Test PDF file not found at ${TEST_PDF_PATH}`);
      return;
    }

    console.log("Starting E2E test with OpenAI API...");
    console.log(`Using model: ${model}`);
    console.log(`Using vision model: ${visionModel}`);
    console.log(`Processing document: ${TEST_PDF_PATH}`);

    try {
      // Make the actual API call to OpenAI
      const resume = await processDocumentWithOpenAI(TEST_PDF_PATH) || {} as ResumeSchema;

      console.log("Document processed successfully!");

      // Verify that the resume has the expected structure
      assertEquals(typeof resume, "object", "Resume should be an object");
      assertEquals(resume.basics !== undefined, true, "Resume should have basics section");

      // Check that basic information was extracted
      if (resume.basics) {
        assertEquals(typeof resume.basics.name, "string", "Name should be a string");
        assertEquals(resume.basics.name.length > 0, true, "Name should not be empty");

        if (resume.basics.email) {
          assertEquals(typeof resume.basics.email, "string", "Email should be a string");
          assertEquals(resume.basics.email.includes("@"), true, "Email should be valid");
        }

        if (resume.basics.summary) {
          assertEquals(typeof resume.basics.summary, "string", "Summary should be a string");
          assertEquals(resume.basics.summary.length > 0, true, "Summary should not be empty");
        }
      }

      // Check that work experience was extracted (if present in the PDF)
      if (resume.work && resume.work.length > 0) {
        const workEntry = resume.work[0];
        assertEquals(typeof workEntry.name, "string", "Company name should be a string");
        assertEquals(workEntry.name.length > 0, true, "Company name should not be empty");

        if (workEntry.position) {
          assertEquals(typeof workEntry.position, "string", "Position should be a string");
          assertEquals(workEntry.position.length > 0, true, "Position should not be empty");
        }
      }

      // Check that education was extracted (if present in the PDF)
      if (resume.education && resume.education.length > 0) {
        const educationEntry = resume.education[0];
        assertEquals(typeof educationEntry.institution, "string", "Institution should be a string");
        assertEquals(educationEntry.institution.length > 0, true, "Institution should not be empty");
      }

      // Check that skills were extracted (if present in the PDF)
      if (resume.skills && resume.skills.length > 0) {
        const skillEntry = resume.skills[0];
        assertEquals(typeof skillEntry.name, "string", "Skill name should be a string");
        assertEquals(skillEntry.name.length > 0, true, "Skill name should not be empty");
      }

      console.log("E2E test passed successfully!");
      console.log("Extracted resume data:", JSON.stringify(resume, null, 2));
    } catch (error) {
      console.error("E2E test failed:", error);
      throw error;
    }
  }
});

/**
 * This test demonstrates how to make actual API calls to OpenAI for end-to-end testing
 * of the document processing functionality.
 * 
 * Benefits of E2E testing:
 * - Tests the actual integration with OpenAI's vision capabilities
 * - Verifies that PDF processing works correctly with real documents
 * - Ensures that the extracted information is structured according to the JSON Resume schema
 * 
 * Considerations:
 * - Cost: OpenAI API calls are not free, and vision API calls can be more expensive
 * - Rate limits: You may hit rate limits if running many tests
 * - API keys: You need valid API keys with appropriate permissions
 * - Reliability: Tests may fail due to service disruptions
 * - Document quality: The quality of extraction depends on the clarity of the PDF
 * 
 * Best practices:
 * - Run E2E tests manually and infrequently
 * - Use a representative but anonymized test document
 * - Keep tests separate from your regular test suite
 * - Use meaningful assertions to verify the results
 * - Handle errors gracefully
 */
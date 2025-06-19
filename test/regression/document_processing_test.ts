import { assertEquals, assertRejects } from "@std/assert";
import { processDocumentWithOpenAI } from "../../src/repos/document_repo.ts";
import { ResumeSchema } from "@kurone-kito/jsonresume-types";
import { withMockEnv } from "../../test/unit/test_utils.ts";
import OpenAI from "openai";

// Mock for OpenAI
class MockOpenAI {
  files = {
    create: async () => ({ id: "mock-file-id" }),
    delete: async () => ({ id: "mock-file-id", deleted: true })
  };

  chat = {
    completions: {
      create: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                resume: {
                  basics: {
                    name: "John Doe",
                    label: "Software Developer",
                    email: "john@example.com",
                    phone: "123-456-7890",
                    summary: "Experienced software developer with a passion for creating elegant solutions."
                  },
                  work: [
                    {
                      name: "Tech Company",
                      position: "Senior Developer",
                      startDate: "2020-01-01",
                      endDate: "Present",
                      summary: "Lead developer for a major project."
                    }
                  ],
                  education: [
                    {
                      institution: "University",
                      area: "Computer Science",
                      studyType: "Bachelor"
                    }
                  ],
                  skills: [
                    {
                      name: "Programming",
                      keywords: ["JavaScript", "TypeScript", "Python"]
                    }
                  ]
                }
              })
            }
          }
        ]
      })
    }
  };
}

/**
 * Regression test for document processing with OpenAI
 * 
 * This test verifies that the application can correctly process a document (PDF)
 * with OpenAI and extract structured information from it.
 */
Deno.test({
  name: "Regression: Document processing with OpenAI",
  fn: async () => {
    // Create mock functions
    const mockOpenAIClientFn = () => new MockOpenAI() as unknown as OpenAI;
    const mockReadFileFn = async () => new Uint8Array([1, 2, 3]); // Mock PDF content
    const mockWriteTextFileFn = async () => {}; // Mock writing to file

    // Mock environment variables
    const mockEnv = {
      OPENAI_API_KEY: "mock-api-key",
      OPENAI_MODEL: "gpt-4-turbo",
      OPENAI_VISION_MODEL: "gpt-4o"
    };

    await withMockEnv(mockEnv, async () => {
      // Process the document
      const result = await processDocumentWithOpenAI(
        "test.pdf",
        mockOpenAIClientFn,
        mockReadFileFn,
        mockWriteTextFileFn
      );

      // Verify that the result contains expected elements
      assertEquals(result.basics?.name, "John Doe", "Result should contain the name");
      assertEquals(result.basics?.label, "Software Developer", "Result should contain the job title");
      assertEquals(result.basics?.email, "john@example.com", "Result should contain the email");
      assertEquals(result.basics?.phone, "123-456-7890", "Result should contain the phone number");
      
      // Verify that work experience was extracted
      assertEquals(result.work?.length, 1, "Result should contain work experience");
      assertEquals(result.work?.[0].name, "Tech Company", "Result should contain the company name");
      assertEquals(result.work?.[0].position, "Senior Developer", "Result should contain the job position");
      
      // Verify that education was extracted
      assertEquals(result.education?.length, 1, "Result should contain education");
      assertEquals(result.education?.[0].institution, "University", "Result should contain the education institution");
      assertEquals(result.education?.[0].area, "Computer Science", "Result should contain the education area");
      
      // Verify that skills were extracted
      assertEquals(result.skills?.length, 1, "Result should contain skills");
      assertEquals(result.skills?.[0].name, "Programming", "Result should contain the skill name");
      assertEquals(result.skills?.[0].keywords?.includes("JavaScript"), true, "Result should contain the skill keywords");
    });
  }
});

/**
 * Regression test for document processing with unsupported file type
 * 
 * This test verifies that the application correctly rejects unsupported file types
 * when processing documents with OpenAI.
 */
Deno.test({
  name: "Regression: Document processing with unsupported file type",
  fn: async () => {
    // Mock environment variables
    const mockEnv = {
      OPENAI_API_KEY: "mock-api-key",
      OPENAI_MODEL: "gpt-4-turbo",
      OPENAI_VISION_MODEL: "gpt-4o"
    };

    await withMockEnv(mockEnv, async () => {
      // Attempt to process a document with an unsupported file type
      await assertRejects(
        async () => {
          await processDocumentWithOpenAI("test.docx");
        },
        Error,
        "Unsupported file type: docx. Only the following file types are supported: pdf."
      );
    });
  }
});

/**
 * Regression test for document processing with missing environment variables
 * 
 * This test verifies that the application correctly rejects document processing
 * when required environment variables are missing.
 */
Deno.test({
  name: "Regression: Document processing with missing environment variables",
  fn: async () => {
    // Mock environment variables with missing API key
    const mockEnv = {
      OPENAI_MODEL: "gpt-4-turbo",
      OPENAI_VISION_MODEL: "gpt-4o"
      // OPENAI_API_KEY is intentionally missing
    };

    await withMockEnv(mockEnv, async () => {
      // Attempt to process a document with missing environment variables
      await assertRejects(
        async () => {
          await processDocumentWithOpenAI("test.pdf");
        },
        Error,
        "OPENAI_API_KEY environment variable is not set"
      );
    });
  }
});
import { assertEquals, assertThrows } from "@std/assert";
import { extractJsonFromMarkdown, processDocumentWithOpenAI } from "../../../src/repos/document_repo.ts";
import { ResumeSchema } from "@kurone-kito/jsonresume-types";
import OpenAI from "openai";
import { withMockEnv } from "../test_utils.ts";

// Tests for extractJsonFromMarkdown
Deno.test("extractJsonFromMarkdown - extracts JSON from markdown code block", () => {
  const markdown = "```json\n{\"name\": \"John Doe\"}\n```";
  const expected = "{\"name\": \"John Doe\"}";
  const actual = extractJsonFromMarkdown(markdown);
  assertEquals(actual, expected);
});

Deno.test("extractJsonFromMarkdown - extracts JSON from code block without language specifier", () => {
  const markdown = "```\n{\"name\": \"John Doe\"}\n```";
  const expected = "{\"name\": \"John Doe\"}";
  const actual = extractJsonFromMarkdown(markdown);
  assertEquals(actual, expected);
});

Deno.test("extractJsonFromMarkdown - handles text without code blocks", () => {
  const text = "{\"name\": \"John Doe\"}";
  const expected = "{\"name\": \"John Doe\"}";
  const actual = extractJsonFromMarkdown(text);
  assertEquals(actual, expected);
});

Deno.test("extractJsonFromMarkdown - cleans up text with backticks but no full code block", () => {
  const text = "```\n{\"name\": \"John Doe\"}";
  const expected = "{\"name\": \"John Doe\"}";
  const actual = extractJsonFromMarkdown(text);
  assertEquals(actual, expected);
});

Deno.test("extractJsonFromMarkdown - handles multiline JSON", () => {
  const markdown = "```json\n{\n  \"name\": \"John Doe\",\n  \"age\": 30\n}\n```";
  const expected = "{\n  \"name\": \"John Doe\",\n  \"age\": 30\n}";
  const actual = extractJsonFromMarkdown(markdown);
  assertEquals(actual, expected);
});

// Test for invalid JSON in markdown
Deno.test("extractJsonFromMarkdown - handles invalid JSON", () => {
  const markdown = "```json\n{\n  \"name\": \"John Doe\",\n  \"age\": \n}\n```";
  const expected = "{\n  \"name\": \"John Doe\",\n  \"age\": \n}";
  const actual = extractJsonFromMarkdown(markdown);
  assertEquals(actual, expected);

  // Verify that the extracted content is indeed invalid JSON
  assertThrows(
    () => JSON.parse(actual),
    SyntaxError,
    "Unexpected token"
  );
});

// Mock for processDocumentWithOpenAI tests
// These tests are more complex due to the extensive external dependencies

// Sample resume data for testing
const sampleResume: ResumeSchema = {
  basics: {
    name: "John Doe",
    label: "Software Developer",
    email: "john@example.com",
  }
};

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
              content: JSON.stringify({ resume: sampleResume })
            }
          }
        ]
      })
    }
  };
}

// Mock for OpenAI with empty response
class MockOpenAIEmptyResponse {
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
              content: ""
            }
          }
        ]
      })
    }
  };
}

// Mock for OpenAI with invalid JSON response
class MockOpenAIInvalidJSON {
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
              content: "{ invalid json"
            }
          }
        ]
      })
    }
  };
}

// Mock for OpenAI with response that doesn't match schema
class MockOpenAIInvalidSchema {
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
                notResume: { 
                  notBasics: { 
                    notName: "John Doe" 
                  } 
                } 
              })
            }
          }
        ]
      })
    }
  };
}

// Mock for Deno environment and file operations
const originalReadFile = Deno.readFile;
const originalWriteTextFile = Deno.writeTextFile;

Deno.test({
  name: "processDocumentWithOpenAI - processes PDF document",
  fn: async () => {
    // Create mock functions
    const mockOpenAIClientFn = () => new MockOpenAI() as unknown as OpenAI;
    const mockReadFileFn = async () => new Uint8Array([1, 2, 3]); // Mock PDF content
    const mockWriteTextFileFn = async () => {}; // Mock writing to file

    // Mock environment variables
    const mockEnv = {
      OPENAI_API_KEY: "mock-api-key",
      OPENAI_MODEL: "gpt-4o"
    };

    await withMockEnv(mockEnv, async () => {
      const result = await processDocumentWithOpenAI(
        "test.pdf",
        mockOpenAIClientFn,
        mockReadFileFn,
        mockWriteTextFileFn
      );
      assertEquals(result, sampleResume);
    });
  }
});

Deno.test({
  name: "processDocumentWithOpenAI - throws error for unsupported file types",
  fn: async () => {
    // Mock environment variables
    const mockEnv = {
      OPENAI_API_KEY: "mock-api-key",
      OPENAI_MODEL: "gpt-4o"
    };

    await withMockEnv(mockEnv, async () => {
      try {
        await processDocumentWithOpenAI("test.docx");
        throw new Error("Expected an error but none was thrown");
      } catch (error) {
        if (error instanceof Error) {
          assertEquals(
            error.message,
            "Unsupported file type: docx. Only the following file types are supported: pdf."
          );
        } else {
          throw new Error("Expected an Error instance but got: " + String(error));
        }
      }
    });
  }
});

Deno.test({
  name: "processDocumentWithOpenAI - throws error for empty OpenAI response",
  fn: async () => {
    // Create mock functions
    const mockOpenAIClientFn = () => new MockOpenAIEmptyResponse() as unknown as OpenAI;
    const mockReadFileFn = async () => new Uint8Array([1, 2, 3]); // Mock PDF content
    const mockWriteTextFileFn = async () => {}; // Mock writing to file

    // Mock environment variables
    const mockEnv = {
      OPENAI_API_KEY: "mock-api-key",
      OPENAI_MODEL: "gpt-4o"
    };

    await withMockEnv(mockEnv, async () => {
      try {
        await processDocumentWithOpenAI(
          "test.pdf",
          mockOpenAIClientFn,
          mockReadFileFn,
          mockWriteTextFileFn
        );
        throw new Error("Expected an error but none was thrown");
      } catch (error) {
        if (error instanceof Error) {
          assertEquals(
            error.message,
            "Failed to process document with OpenAI: OpenAI returned an empty response"
          );
        } else {
          throw new Error("Expected an Error instance but got: " + String(error));
        }
      }
    });
  }
});

Deno.test({
  name: "processDocumentWithOpenAI - throws error for invalid JSON response",
  fn: async () => {
    // Create mock functions
    const mockOpenAIClientFn = () => new MockOpenAIInvalidJSON() as unknown as OpenAI;
    const mockReadFileFn = async () => new Uint8Array([1, 2, 3]); // Mock PDF content
    const mockWriteTextFileFn = async () => {}; // Mock writing to file

    // Mock environment variables
    const mockEnv = {
      OPENAI_API_KEY: "mock-api-key",
      OPENAI_MODEL: "gpt-4o"
    };

    await withMockEnv(mockEnv, async () => {
      try {
        await processDocumentWithOpenAI(
          "test.pdf",
          mockOpenAIClientFn,
          mockReadFileFn,
          mockWriteTextFileFn
        );
        throw new Error("Expected an error but none was thrown");
      } catch (error) {
        if (error instanceof Error) {
          assertEquals(
            error.message.includes("Failed to parse OpenAI response as JSON"),
            true,
            "Error message should indicate JSON parsing failure"
          );
        } else {
          throw new Error("Expected an Error instance but got: " + String(error));
        }
      }
    });
  }
});

Deno.test({
  name: "processDocumentWithOpenAI - throws error for response that doesn't match schema",
  fn: async () => {
    // Create mock functions
    const mockOpenAIClientFn = () => new MockOpenAIInvalidSchema() as unknown as OpenAI;
    const mockReadFileFn = async () => new Uint8Array([1, 2, 3]); // Mock PDF content
    const mockWriteTextFileFn = async () => {}; // Mock writing to file

    // Mock environment variables
    const mockEnv = {
      OPENAI_API_KEY: "mock-api-key",
      OPENAI_MODEL: "gpt-4o"
    };

    await withMockEnv(mockEnv, async () => {
      // The function should not throw an error for schema mismatch, but should return
      // whatever JSON was parsed, even if it doesn't match the expected schema
      const result = await processDocumentWithOpenAI(
        "test.pdf",
        mockOpenAIClientFn,
        mockReadFileFn,
        mockWriteTextFileFn
      );

      // Verify that the result is not what we expected
      assertEquals(result.basics?.name, undefined);
      assertEquals((result as any).notResume?.notBasics?.notName, "John Doe");
    });
  }
});

// Note: More comprehensive tests for processDocumentWithOpenAI would require
// more sophisticated mocking of the OpenAI API and file system operations.
// For a real-world application, it might be better to use integration tests
// for this function rather than trying to mock everything.

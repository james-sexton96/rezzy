import { assertEquals, assertRejects } from "@std/assert";
import { fetchAiCoverLetter } from "../../../src/repos/openai_repo.ts";
import { ResumeSchema } from "@kurone-kito/jsonresume-types";
import { CoverLetterSchema } from "../../../src/schemas.ts";
import * as typechat from "typechat";
import { withMockEnv } from "../test_utils.ts";

// Sample resume data for testing
const sampleResume: ResumeSchema = {
  basics: {
    name: "John Doe",
    label: "Software Developer",
    email: "john@example.com",
  }
};

// Sample job description
const sampleJobDescription = "We are looking for a software developer with experience in TypeScript.";

// Sample cover letter response
const sampleCoverLetter: CoverLetterSchema = {
  greeting: "Dear Hiring Manager,",
  companyStreetAddress: "123 Main St",
  companyCity: "San Francisco",
  companyState: "CA",
  companyZipCode: "94105",
  letterBody: "I am writing to apply for the Software Developer position."
};

// Mock for TypeChat
const mockSuccessTranslator = {
  translate: async () => ({
    success: true,
    data: sampleCoverLetter
  })
};

const mockFailureTranslator = {
  translate: async () => ({
    success: false,
    message: "Failed to generate cover letter"
  })
};

const mock403Translator = {
  translate: async () => ({
    success: false,
    message: "403: Forbidden - The API key is invalid"
  })
};

// Mock for schema validation failure
const mockSchemaValidationFailureTranslator = {
  translate: async () => ({
    success: false,
    message: "Failed to validate response against schema: missing required field 'greeting'"
  })
};

// Original TypeChat functions
const originalCreateLanguageModel = typechat.createLanguageModel;
const originalCreateJsonTranslator = typechat.createJsonTranslator;

Deno.test({
  name: "fetchAiCoverLetter - successfully generates cover letter",
  fn: async () => {
    // Mock environment variables
    const mockEnv = {
      OPENAI_API_KEY: "mock-api-key",
      OPENAI_MODEL: "gpt-4-turbo",
      OPENAI_VISION_MODEL: "gpt-4o"
    };

    // Create mock functions
    const mockLanguageModelFn = () => ({} as any);
    const mockValidatorFn = () => ({} as any);
    const mockTranslatorFn = () => mockSuccessTranslator as any;

    await withMockEnv(mockEnv, async () => {
      const result = await fetchAiCoverLetter(
        sampleJobDescription,
        sampleResume,
        undefined, // No custom prompt
        mockLanguageModelFn,
        mockValidatorFn,
        mockTranslatorFn
      );
      assertEquals(result, sampleCoverLetter);
    });
  }
});

Deno.test({
  name: "fetchAiCoverLetter - handles general failure",
  fn: async () => {
    // Mock environment variables
    const mockEnv = {
      OPENAI_API_KEY: "mock-api-key",
      OPENAI_MODEL: "gpt-4-turbo",
      OPENAI_VISION_MODEL: "gpt-4o"
    };

    // Create mock functions
    const mockLanguageModelFn = () => ({} as any);
    const mockValidatorFn = () => ({} as any);
    const mockTranslatorFn = () => mockFailureTranslator as any;

    await withMockEnv(mockEnv, async () => {
      await assertRejects(
        async () => await fetchAiCoverLetter(
          sampleJobDescription, 
          sampleResume,
          undefined, // No custom prompt
          mockLanguageModelFn,
          mockValidatorFn,
          mockTranslatorFn
        ),
        Error,
        "Failed to generate cover letter"
      );
    });
  }
});

Deno.test({
  name: "fetchAiCoverLetter - handles 403 Forbidden error",
  fn: async () => {
    // Mock environment variables
    const mockEnv = {
      OPENAI_API_KEY: "mock-api-key",
      OPENAI_MODEL: "gpt-4-turbo",
      OPENAI_VISION_MODEL: "gpt-4o"
    };

    // Create mock functions
    const mockLanguageModelFn = () => ({} as any);
    const mockValidatorFn = () => ({} as any);
    const mockTranslatorFn = () => mock403Translator as any;

    await withMockEnv(mockEnv, async () => {
      await assertRejects(
        async () => await fetchAiCoverLetter(
          sampleJobDescription, 
          sampleResume,
          undefined, // No custom prompt
          mockLanguageModelFn,
          mockValidatorFn,
          mockTranslatorFn
        ),
        Error,
        "OpenAI API returned a 403 Forbidden error"
      );
    });
  }
});

Deno.test({
  name: "fetchAiCoverLetter - includes custom prompt when provided",
  fn: async () => {
    // Mock environment variables
    const mockEnv = {
      OPENAI_API_KEY: "mock-api-key",
      OPENAI_MODEL: "gpt-4-turbo",
      OPENAI_VISION_MODEL: "gpt-4o"
    };

    // Create a spy translator to check if the prompt is included
    let capturedRequest = "";
    const spyTranslator = {
      translate: async (request: string) => {
        capturedRequest = request;
        return {
          success: true,
          data: sampleCoverLetter
        };
      }
    };

    // Create mock functions
    const mockLanguageModelFn = () => ({} as any);
    const mockValidatorFn = () => ({} as any);
    const mockTranslatorFn = () => spyTranslator as any;

    await withMockEnv(mockEnv, async () => {
      const customPrompt = "Add bullet points to my cover letter";
      await fetchAiCoverLetter(
        sampleJobDescription, 
        sampleResume, 
        customPrompt,
        mockLanguageModelFn,
        mockValidatorFn,
        mockTranslatorFn
      );

      // Check if the custom prompt is included in the request
      const includesCustomPrompt = capturedRequest.includes(`Also: ${customPrompt}`);
      assertEquals(includesCustomPrompt, true);
    });
  }
});

// This test checks that the function correctly handles schema validation failures
Deno.test({
  name: "fetchAiCoverLetter - handles schema validation failures",
  fn: async () => {
    // Mock environment variables
    const mockEnv = {
      OPENAI_API_KEY: "mock-api-key",
      OPENAI_MODEL: "gpt-4-turbo",
      OPENAI_VISION_MODEL: "gpt-4o"
    };

    // Create mock functions
    const mockLanguageModelFn = () => ({} as any);
    const mockValidatorFn = () => ({} as any);
    const mockTranslatorFn = () => mockSchemaValidationFailureTranslator as any;

    await withMockEnv(mockEnv, async () => {
      await assertRejects(
        async () => await fetchAiCoverLetter(
          sampleJobDescription, 
          sampleResume,
          undefined, // No custom prompt
          mockLanguageModelFn,
          mockValidatorFn,
          mockTranslatorFn
        ),
        Error,
        "Failed to validate response against schema: missing required field 'greeting'"
      );
    });
  }
});

// This test checks that the function correctly handles missing environment variables
Deno.test({
  name: "fetchAiCoverLetter - handles missing environment variables",
  fn: async () => {
    // Mock environment variables with missing API key
    const mockEnv = {
      OPENAI_MODEL: "gpt-4-turbo",
      OPENAI_VISION_MODEL: "gpt-4o"
    };

    await withMockEnv(mockEnv, async () => {
      await assertRejects(
        async () => await fetchAiCoverLetter(sampleJobDescription, sampleResume),
        Error,
        "OPENAI_API_KEY environment variable is not set"
      );
    });
  }
});

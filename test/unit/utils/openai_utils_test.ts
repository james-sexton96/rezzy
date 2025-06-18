import { assertEquals, assertThrows } from "@std/assert";
import { validateOpenAIEnv, checkOpenAIEnv } from "../../../src/utils/openai_utils.ts";
import { withMockEnv } from "../test_utils.ts";

Deno.test("validateOpenAIEnv - returns valid when all environment variables are set correctly", async () => {
  // Mock environment variables
  const mockEnv = {
    OPENAI_API_KEY: "mock-api-key",
    OPENAI_MODEL: "gpt-4-turbo",
    OPENAI_VISION_MODEL: "gpt-4o"
  };

  await withMockEnv(mockEnv, async () => {
    const result = validateOpenAIEnv();
    assertEquals(result.isValid, true);
    assertEquals(result.message, undefined);
  });
});

Deno.test("validateOpenAIEnv - returns invalid when API key is missing", async () => {
  // Mock environment variables with missing API key
  const mockEnv = {
    OPENAI_MODEL: "gpt-4-turbo",
    OPENAI_VISION_MODEL: "gpt-4o"
  };

  await withMockEnv(mockEnv, async () => {
    const result = validateOpenAIEnv();
    assertEquals(result.isValid, false);
    assertEquals(
      result.message,
      "OPENAI_API_KEY environment variable is not set. Please set it to your OpenAI API key."
    );
  });
});

Deno.test("validateOpenAIEnv - returns invalid when model is missing", async () => {
  // Mock environment variables with missing model
  const mockEnv = {
    OPENAI_API_KEY: "mock-api-key",
    OPENAI_VISION_MODEL: "gpt-4o"
  };

  await withMockEnv(mockEnv, async () => {
    const result = validateOpenAIEnv();
    assertEquals(result.isValid, false);
    assertEquals(
      result.message,
      "OPENAI_MODEL environment variable is not set. Please set it to a valid OpenAI model name (e.g., gpt-4-turbo)."
    );
  });
});

Deno.test("validateOpenAIEnv - returns invalid when vision model is missing", async () => {
  // Mock environment variables with missing vision model
  const mockEnv = {
    OPENAI_API_KEY: "mock-api-key",
    OPENAI_MODEL: "gpt-4-turbo"
  };

  await withMockEnv(mockEnv, async () => {
    const result = validateOpenAIEnv();
    assertEquals(result.isValid, false);
    assertEquals(
      result.message,
      "OPENAI_VISION_MODEL environment variable is not set. Please set it to a valid OpenAI vision model name (e.g., gpt-4o-vision-preview)."
    );
  });
});

Deno.test("validateOpenAIEnv - returns invalid when model is not in the list of valid models", async () => {
  // Mock environment variables with invalid model
  const mockEnv = {
    OPENAI_API_KEY: "mock-api-key",
    OPENAI_MODEL: "invalid-model",
    OPENAI_VISION_MODEL: "gpt-4o"
  };

  await withMockEnv(mockEnv, async () => {
    const result = validateOpenAIEnv();
    assertEquals(result.isValid, false);
    assertEquals(
      result.message?.includes("The specified model 'invalid-model' may not be valid or available"),
      true
    );
  });
});

Deno.test("validateOpenAIEnv - returns invalid when vision model is not in the list of valid vision models", async () => {
  // Mock environment variables with invalid vision model
  const mockEnv = {
    OPENAI_API_KEY: "mock-api-key",
    OPENAI_MODEL: "gpt-4-turbo",
    OPENAI_VISION_MODEL: "invalid-vision-model"
  };

  await withMockEnv(mockEnv, async () => {
    const result = validateOpenAIEnv();
    assertEquals(result.isValid, false);
    assertEquals(
      result.message?.includes("The specified vision model 'invalid-vision-model' may not be valid or available"),
      true
    );
  });
});

Deno.test("checkOpenAIEnv - does not throw when environment variables are valid", async () => {
  // Mock environment variables
  const mockEnv = {
    OPENAI_API_KEY: "mock-api-key",
    OPENAI_MODEL: "gpt-4-turbo",
    OPENAI_VISION_MODEL: "gpt-4o"
  };

  await withMockEnv(mockEnv, async () => {
    // This should not throw
    checkOpenAIEnv();
  });
});

Deno.test("checkOpenAIEnv - throws when environment variables are invalid", async () => {
  // Mock environment variables with missing API key
  const mockEnv = {
    OPENAI_MODEL: "gpt-4-turbo",
    OPENAI_VISION_MODEL: "gpt-4o"
  };

  await withMockEnv(mockEnv, async () => {
    assertThrows(
      () => checkOpenAIEnv(),
      Error,
      "OPENAI_API_KEY environment variable is not set"
    );
  });
});
# Plan: Integrating Ollama as an LLM Provider in Rezzy

This document outlines the step-by-step plan to refactor the `rezzy` tool to support multiple Large Language Model (LLM) providers, with a specific focus on implementing Ollama.

## Phase 1: Core Refactoring for Abstraction

The goal of this phase is to decouple the existing OpenAI-specific logic from the main application flow by introducing a generic interface. This will make it easier to add new providers in the future.

### Step 1.1: Define a Generic LLM Interface

* Create a new file `src/interfaces.ts` or a more specific `src/repos/llm_interface.ts`.
* Define a TypeScript interface, let's call it `LlmProvider`, that outlines the core functionalities required from an LLM.

```typescript
// In a new interface file
import { ResumeSchema } from "@kurone-kito/jsonresume-types";
import { CoverLetterSchema } from "./schemas.ts";

export interface LlmProvider {
  generateCoverLetter(
    jobDescription: string,
    resume: ResumeSchema,
    prompt?: string
  ): Promise<CoverLetterSchema>;

  processDocument(
    filePath: string
  ): Promise<ResumeSchema>;
}
```

### Step 1.2: Create a Unified Configuration System

* Create a new file `src/config.ts`.
* This file will be responsible for managing configuration from both environment variables and CLI arguments.
* It will define types for different provider configurations (OpenAI, Ollama).
* It will parse and validate the required settings for the selected provider.

### Step 1.3: Refactor OpenAI Logic into a Provider

* Rename `src/repos/openai_repo.ts` to `src/repos/openai_provider.ts`.
* Rename `src/utils/openai_utils.ts` to `src/utils/provider_utils.ts` or merge it into the new `config.ts`.
* Create a class `OpenAIProvider` within `src/repos/openai_provider.ts` that implements the new `LlmProvider` interface.
* Move the logic from `fetchAiCoverLetter` (from the old `openai_repo.ts`) into the `generateCoverLetter` method of the `OpenAIProvider` class.
* Move the logic from `processDocumentWithOpenAI` (from `src/repos/document_repo.ts`) into the `processDocument` method of the `OpenAIProvider` class.
* The `document_repo.ts` file may become redundant or could be used for other document-related utilities that are not LLM-specific.

### Step 1.4: Update `main.ts`

* Modify `main.ts` to use the new provider model.
* It will import and use the configuration system from `src/config.ts`.
* Based on the configuration, it will instantiate the `OpenAIProvider`.
* It will then call the methods (`generateCoverLetter`, `processDocument`) on the provider instance instead of the old standalone functions.

### **BREAKPOINT 1: Testing**

* **Goal:** Ensure the application works exactly as before with OpenAI.
* **Actions:**
    1.  Update unit tests in `test/unit/repos/` to reflect the new `OpenAIProvider` class structure.
    2.  Run all existing regression tests in `test/regression/`. They should all pass without modification to the test logic itself, only to the setup.
    3.  Run the end-to-end tests for OpenAI in `test/end_to_end/` to confirm the refactoring did not break the real-world integration.

---

## Phase 2: Implementing the Ollama Provider

Now that the foundation is laid, we will add the Ollama implementation.

### Step 2.1: Update CLI and Configuration

* In `main.ts`, add a new CLI flag: `--provider` (or `--llm-provider`) which accepts `openai` or `ollama`, defaulting to `openai`.
* In `src/config.ts`, add logic to handle Ollama-specific environment variables (`OLLAMA_HOST`, `OLLAMA_MODEL`) and any new related CLI flags.
* Update the environment validation to check for Ollama settings when it is the selected provider.

### Step 2.2: Create the Ollama Provider File

* Create a new file: `src/repos/ollama_provider.ts`.
* Inside this file, create a class `OllamaProvider` that implements the `LlmProvider` interface.

### Step 2.3: Implement `generateCoverLetter` for Ollama

* Implement the `generateCoverLetter` method within the `OllamaProvider` class.
* This method will use Deno's native `fetch` API to make a POST request to the Ollama API's chat or generation endpoint (e.g., `http://<OLLAMA_HOST>/api/chat`).
* The prompt will be constructed similarly to the OpenAI version.
* You must ensure the Ollama model you are using can handle JSON output reliably. You may need to adjust the prompt to explicitly ask for a JSON object and handle cases where it returns markdown-wrapped JSON. The existing `extractJsonFromMarkdown` utility will be useful here.

### Step 2.4: Implement `processDocument` for Ollama

* Implement the `processDocument` method. This requires a multimodal Ollama model (like LLaVA).
* The method will:
    1.  Read the PDF file into a buffer.
    2.  Base64-encode the buffer.
    3.  Use the `fetch` API to send a request to the Ollama API, including the base64 image data in the payload, along with the prompt asking for JSON Resume extraction.
* The response will need to be parsed to extract the JSON Resume data.

### Step 2.5: Update the Provider Factory

* In `main.ts`, update the logic that instantiates the provider. It should now be a factory function or a switch statement that creates either an `OpenAIProvider` or an `OllamaProvider` instance based on the `--provider` flag.

### **BREAKPOINT 2: Testing**

* **Goal:** Verify that the Ollama provider works for both cover letter generation and document processing.
* **Actions:**
    1.  Create new unit tests in `test/unit/repos/ollama_provider_test.ts`. These tests should mock the `fetch` API to simulate responses from the Ollama server.
    2.  Manually test the full flow using a locally running Ollama instance. Start with cover letter generation, as it is simpler. Then, test document processing with a multimodal model.

---

## Phase 3: Final Integration, Testing, and Documentation

This final phase ensures the new functionality is robust, well-tested, and documented.

### Step 3.1: Update Integration Tests

* Modify the regression tests in `test/regression/` to be provider-agnostic. They could be parameterized to run once for each provider (OpenAI and Ollama), ensuring consistent behavior across different LLMs.

### Step 3.2: Create Ollama End-to-End Tests

* Create new end-to-end test files in `test/end_to_end/`:
    * `cover_letter_generation_ollama_e2e_test.ts`
    * `document_processing_ollama_e2e_test.ts`
* These tests will make real calls to an Ollama service. They should be set to `ignore: true` by default, just like the existing OpenAI e2e tests.

### Step 3.3: Update Documentation

* Edit `README.md` to include:
    * Information about the new `--provider` flag.
    * Instructions on how to configure and use the Ollama provider.
    * The new environment variables required for Ollama (`OLLAMA_HOST`, `OLLAMA_MODEL`).
    * A note on which Ollama models are recommended (especially multimodal ones for document processing).

### **BREAKPOINT 3: Final Testing**

* **Goal:** Confirm the entire application is stable and ready for use with both providers.
* **Actions:**
    1.  Run the entire test suite: `deno task unit_test` and `deno task regression_test`.
    2.  Manually enable and run the end-to-end tests for both OpenAI and Ollama to ensure both integrations are fully working.
    3.  Perform a final user-acceptance test of the CLI tool with various combinations of flags for both providers.

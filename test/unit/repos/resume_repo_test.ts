import { assertEquals, assertRejects } from "@std/assert";
import { fetchResume } from "../../../src/repos/resume_repo.ts";
import { ResumeSchema } from "npm:@kurone-kito/jsonresume-types@0.4.0";

// Sample resume data for testing
const sampleResume: ResumeSchema = {
  basics: {
    name: "John Doe",
    label: "Software Developer",
    email: "john@example.com",
  }
};

// Mock for global fetch
const originalFetch = globalThis.fetch;
const mockFetch = async (url: string | URL | Request, init?: RequestInit): Promise<Response> => {
  if (url.toString() === "http://example.com/resume.json") {
    return new Response(JSON.stringify(sampleResume), { status: 200 });
  } else if (url.toString() === "http://example.com/not-found.json") {
    return new Response("Not Found", { status: 404, statusText: "Not Found" });
  } else {
    return new Response("Server Error", { status: 500, statusText: "Server Error" });
  }
};

// Mock for Deno.readTextFile
const originalReadTextFile = Deno.readTextFile;
const mockReadTextFile = async (path: string | URL): Promise<string> => {
  if (path.toString() === "valid-resume.json") {
    return JSON.stringify(sampleResume);
  } else if (path.toString() === "invalid-json.json") {
    return "{ invalid json";
  } else if (path.toString() === "invalid-schema.json") {
    // Valid JSON but doesn't match ResumeSchema (missing required fields)
    return JSON.stringify({
      notBasics: {
        notName: "John Doe"
      }
    });
  } else {
    throw new Deno.errors.NotFound(`File not found: ${path}`);
  }
};

Deno.test({
  name: "fetchResume - fetches resume from URL",
  fn: async () => {
    // Replace global fetch with mock
    globalThis.fetch = mockFetch;

    try {
      const resume = await fetchResume("http://example.com/resume.json");
      assertEquals(resume, sampleResume);
    } finally {
      // Restore original fetch
      globalThis.fetch = originalFetch;
    }
  }
});

Deno.test({
  name: "fetchResume - handles URL fetch errors",
  fn: async () => {
    // Replace global fetch with mock
    globalThis.fetch = mockFetch;

    try {
      await assertRejects(
        async () => await fetchResume("http://example.com/not-found.json"),
        Error,
        "Not Found"
      );
    } finally {
      // Restore original fetch
      globalThis.fetch = originalFetch;
    }
  }
});

Deno.test({
  name: "fetchResume - reads resume from file",
  fn: async () => {
    // Replace Deno.readTextFile with mock
    Deno.readTextFile = mockReadTextFile;

    try {
      const resume = await fetchResume("valid-resume.json");
      assertEquals(resume, sampleResume);
    } finally {
      // Restore original readTextFile
      Deno.readTextFile = originalReadTextFile;
    }
  }
});

Deno.test({
  name: "fetchResume - handles file not found",
  fn: async () => {
    // Replace Deno.readTextFile with mock
    Deno.readTextFile = mockReadTextFile;

    try {
      await assertRejects(
        async () => await fetchResume("non-existent-file.json"),
        Deno.errors.NotFound,
        "File not found"
      );
    } finally {
      // Restore original readTextFile
      Deno.readTextFile = originalReadTextFile;
    }
  }
});

Deno.test({
  name: "fetchResume - handles invalid JSON",
  fn: async () => {
    // Replace Deno.readTextFile with mock
    Deno.readTextFile = mockReadTextFile;

    try {
      await assertRejects(
        async () => await fetchResume("invalid-json.json"),
        SyntaxError
      );
    } finally {
      // Restore original readTextFile
      Deno.readTextFile = originalReadTextFile;
    }
  }
});

Deno.test({
  name: "fetchResume - handles JSON that doesn't match ResumeSchema",
  fn: async () => {
    // Replace Deno.readTextFile with mock
    Deno.readTextFile = mockReadTextFile;

    try {
      // The function should not throw an error for schema mismatch at runtime,
      // but the returned object won't have the expected structure
      const result = await fetchResume("invalid-schema.json");

      // Verify that the result doesn't have the expected structure
      assertEquals(result.basics, undefined);

      // Verify that it has the structure we provided instead
      assertEquals((result as any).notBasics?.notName, "John Doe");
    } finally {
      // Restore original readTextFile
      Deno.readTextFile = originalReadTextFile;
    }
  }
});

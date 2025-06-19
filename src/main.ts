import { Rezzy } from "./rezzy.ts";
import dotenv from "dotenv";
import * as path from "path";
import { parseArgs } from "jsr:@std/cli/parse-args";
import { assert } from "@std/assert";
import { logTempFile } from "./logger.ts";
import { fetchAiCoverLetter } from "./repos/openai_repo.ts";
import { fetchResume } from "./repos/resume_repo.ts";
import { ResumeSchema } from "@kurone-kito/jsonresume-types";

// Load environment variables.
// const __dirname = new URL('.', import.meta.url).pathname;
// dotenv.config({path: path.join(__dirname, "../.env")});

const flags = parseArgs(Deno.args, {
  string: ["resume", "jd", "prompt", "document"],
});

// Either resume or document must be provided
console.log(`flags.resume is ${flags.resume}`);
console.log(`flags.document is ${flags.document}`);
assert(flags.resume || flags.document, `Either --resume or --document is required`);
// Both resume and document cannot be provided at the same time
assert(!(flags.resume && flags.document), `Cannot provide both --resume and --document at the same time`);

let resumeJson: ResumeSchema;

if (flags.resume) {
  // Traditional flow: fetch resume from JSON file or URL
  resumeJson = await fetchResume(flags.resume);
} else {
  // New flow: process document directly with OpenAI
  try {
    // Import the processDocumentWithOpenAI function
    const { processDocumentWithOpenAI } = await import("./repos/document_repo.ts");

    // Process the document directly with OpenAI
    resumeJson = await processDocumentWithOpenAI(flags.document);

    // Optionally save the converted JSON for reference
    const jsonPath = flags.document.replace(/\.(pdf)$/i, '.json');
    await Deno.writeTextFile(jsonPath, JSON.stringify(resumeJson, null, 2));
    console.log(`Converted document saved as JSON: ${jsonPath}`);
  } catch (error) {
    console.error("Error processing document with OpenAI:", error);
    throw new Error("Failed to process document with OpenAI.");
  }
}

const jobDescription = flags.jd ? Deno.readTextFileSync(flags.jd) : undefined;
const letter = jobDescription
  ? await fetchAiCoverLetter(jobDescription, resumeJson, flags.prompt)
  : undefined;
const rezzy = new Rezzy(resumeJson, letter);
const result = rezzy.buildRezzyResult();
const logPath = logTempFile(
  "rezzy",
  JSON.stringify(
    {
      input: { flags },
      resume: result.latexResume.join("\n"),
      letter: result.latexCoverLetter?.join("\n"),
    },
    null,
    2,
  ),
);
const lines = result.latexCoverLetter
  ? result.latexCoverLetter
  : result.latexResume;

console.log(lines.join("\n"));
console.log("\n\n");
console.log(`Data dump: ${logPath}`);

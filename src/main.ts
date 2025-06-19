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
const __dirname = new URL('.', import.meta.url).pathname;
dotenv.config({
    path: `${__dirname}../.env`,
    override: false // Use environment variables as default
});

if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_MODEL) {
    console.log(`
Environment variables not found. Please set the following:

Required for OpenAI integration:
export OPENAI_API_KEY=your_api_key_here 
export OPENAI_MODEL=gpt-4o  # Or another compatible model

Supported OpenAI models:
- gpt-4-turbo
- gpt-4-turbo-preview  
- gpt-4
- gpt-4-32k
- gpt-3.5-turbo
- gpt-3.5-turbo-16k
- gpt-4o
- gpt-4o-mini
    `);
    Deno.exit(1);
}

// Define help text
const helpText = `
Usage: deno task rezzy [OPTIONS]... 

Description:
  rezzy - an AI powered resume and cover letter generator.

Options:
  --resume          JSON Resume file path or URL
  --document        PDF document file path (alternative to --resume)
  --jd              Job description path to .txt file
  --prompt          Optional AI prompt for cover letter generation
  -o, --output      Base output path for LaTeX files (default: based on input filename)
  --help            Display this help message

Examples:
  deno task rezzy --resume ../resume.json
  deno task rezzy --document ../resume.pdf
  deno task rezzy --resume ../resume.json --jd ../jobs/job-desc.txt
  deno task rezzy --resume ../resume.json -o my_output

Note:
  Output files will be named with suffixes:
  - Resume: <base>_resume.tex
  - Cover letter: <base>_cover.tex (when job description is provided)
`;

// TODO: Rename the 'resume' CLI flag to 'json' to better indicate that it accepts JSON Resume input.
//       Keep 'document' flag name as is since it will eventually support multiple document formats 
//       beyond PDF. Once document support is complete, we can deprecate the 'json' flag entirely.
const flags = parseArgs(Deno.args, {
  string: ["resume", "jd", "prompt", "document", "output", "o"],
  alias: { o: "output", h: "help" },
  boolean: ["help"],
});

// Display help if requested or if no arguments provided
if (flags.help || Deno.args.length === 0) {
  console.log(helpText);
  Deno.exit(0);
}

// Either resume or document must be provided
console.log(`Input: ${flags.resume || flags.document}`);
try {
  assert(flags.resume || flags.document, `Either --resume or --document is required`);
  // Both resume and document cannot be provided at the same time
  assert(!(flags.resume && flags.document), `Cannot provide both --resume and --document at the same time`);
} catch (error) {
  console.error(`Error: ${error.message}`);
  console.log(helpText);
  Deno.exit(1);
}

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
// Determine base output file path
let baseOutputPath = flags.output;
if (!baseOutputPath) {
  // Default output file name based on input file
  if (flags.resume) {
    baseOutputPath = flags.resume.replace(/\.(json)$/i, '');
  } else if (flags.document) {
    baseOutputPath = flags.document.replace(/\.(pdf)$/i, '');
  }
}

// Create specific output paths for resume and cover letter
const resumeOutputPath = `${baseOutputPath}_resume.tex`;
const coverLetterOutputPath = `${baseOutputPath}_cover.tex`;

// Write the resume LaTeX content to the resume output file
await Deno.writeTextFile(resumeOutputPath, result.latexResume.join("\n"));
console.log(`Resume LaTeX file successfully written to: ${resumeOutputPath}`);

// Write the cover letter LaTeX content to the cover letter output file if available
if (result.latexCoverLetter) {
  await Deno.writeTextFile(coverLetterOutputPath, result.latexCoverLetter.join("\n"));
  console.log(`Cover letter LaTeX file successfully written to: ${coverLetterOutputPath}`);
}

// Log debug information to a temp file
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
console.log(`Debug information: ${logPath}`);

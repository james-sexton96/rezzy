import { Rezzy } from "./rezzy.ts";
import { parseArgs } from "jsr:@std/cli/parse-args";
import { assert } from "@std/assert";
import { logTempFile } from "./logger.ts";
import { fetchAiCoverLetter } from "./repos/openai_repo.ts";
import { fetchResume } from "./repos/resume_repo.ts";

const flags = parseArgs(Deno.args, {
  string: ["resume", "jd", "prompt"],
});

assert(flags.resume, `--resume is required`);

const resumeJson = await fetchResume(flags.resume);
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

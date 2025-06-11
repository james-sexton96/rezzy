import {Rezzy} from "./rezzy.ts";
import {RezzyCover} from "./rezzy_cover.ts";
import {parseArgs} from "jsr:@std/cli/parse-args";
import {assert} from "@std/assert";
import {logTempFile} from './logger.ts';

const cmdStr = Deno.args[0];

const flags = parseArgs(Deno.args, {
  string: ["jd", "source"],
});

assert(cmdStr, `Command required: rezzy or cover`);
assert(flags.source, `--source is required`);

const resumeJson = await Rezzy.fetchResume(flags.source);

const CMD_MAP: Record<string, () => Promise<string[]>> = {
  rezzy: () => {
    const rezzy = new Rezzy(resumeJson);
    return Promise.resolve(rezzy.buildRezzy());
  },
  cover: () => {
    assert(flags.jd, "--jd is required for cover");
    const cover = new RezzyCover(resumeJson);
    return cover.buildCover(flags.jd);
  },
};

const command = CMD_MAP[cmdStr];

assert(command, `Command not recognized: ${cmdStr}`);

const lines = (await command()).join("\n");
logTempFile(cmdStr, lines);

console.log(lines);

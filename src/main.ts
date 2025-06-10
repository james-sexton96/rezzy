import { Rezzy } from "./rezzy.ts";
import { Cover } from "./cover.ts";
import { parseArgs } from "jsr:@std/cli/parse-args";
import { assert } from "@std/assert";

const cmdStr = Deno.args[0];

const flags = parseArgs(Deno.args, {
  string: ["url"],
});

if (!cmdStr) throw new Error(`Command required: rezzy or cover`);

const jsonData = JSON.parse(await Deno.readTextFile("../resume/resume.json"));
const rezzy = new Rezzy(jsonData);
const cover = new Cover(jsonData);

const CMD_MAP: Record<string, () => Promise<string[]>> = {
  rezzy: () => rezzy.buildRezzy(),
  cover: () => {
    assert(flags.url, "Url is required for cover");
    return cover.buildCover(flags.url);
  },
};

const command = CMD_MAP[cmdStr];

assert(command(), `Command not recognized: ${cmdStr}`);

// if (!command) throw new Error(`Command not recognized: ${cmdStr}`);

console.log((await command()).join("\n"));

import { LATEX_ENVIRONMENTS } from "./constants.ts";

export function latexCommand(
  command: string,
  args: Array<string | undefined> = [],
  options?: string,
): string {
  const opt = options ? `[${options}]` : ``;
  const nonEmptyArgs = args.filter((it) => it);
  const argStr = nonEmptyArgs.length ? `{${nonEmptyArgs.join("}{")}}` : ``;
  return LATEX_ENVIRONMENTS.some((it) => nonEmptyArgs.includes(it))
    ? `\\${command}${argStr}${opt}`
    : `\\${command}${opt}${argStr}`;
}

export function latexNewCommand(
  name: string,
  numArgs = 0,
  body: string,
  defaultValue?: string,
) {
  const argCount = numArgs > 0 ? `[${numArgs}]` : "";
  const defaultArg = defaultValue !== undefined ? `[${defaultValue}]` : "";
  return `\\newcommand{\\${name}}${defaultArg || argCount}{${body}}`;
}

export function latexSection(sectionName: string, lines: string[]): string[] {
  if (lines.length === 0) return [];
  return [
    ...latexBannerComment("Section: " + sectionName),
    latexCommand("begin", ["rSection", sectionName]),
    ...lines,
    latexCommand("end", ["rSection"]),
  ];
}

export function latexBannerComment(comment: string | undefined): string[] {
  if (!comment) return [];

  return [
    ...latexEmptySpace(),
    `%----------------------------------------------------------------------------------------`,
    `% ${comment.toUpperCase()}`,
    `%----------------------------------------------------------------------------------------`,
    ...latexEmptySpace(),
  ];
}

function latexEmptySpace(): string[] {
  return [""];
}

export function latexList(lines: string[]): string[] {
  if (!lines.length) return [];

  return [
    latexCommand("begin", ["itemize"]),
    latexCommand("setlength", [latexCommand("itemsep"), "-3pt"]),
    ...lines.map((it) => latexCommand("item", [it])),
    latexCommand("end", ["itemize"]),
  ];
}

export function latexEscapeCharsInObject<T extends Record<string, any>>(
  obj: T,
  charsToEscape: string[],
): T {
  const escapeCharMap = new Set(charsToEscape);

  const escapeString = (value: string): string => {
    return value.replace(/./g, (char) => {
      return escapeCharMap.has(char) ? `\\${char}` : char;
    });
  };

  const recurse = (input: any): any => {
    if (typeof input === "string") return escapeString(input);
    if (Array.isArray(input)) return input.map((item) => recurse(item));

    if (input && typeof input === "object") {
      const result: Record<string, any> = {};
      for (const key in input) {
        if (input.hasOwnProperty(key)) result[key] = recurse(input[key]);
      }
      return result;
    }

    return input;
  };

  return recurse(obj);
}

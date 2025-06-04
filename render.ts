import { ResumeSchema } from "@kurone-kito/jsonresume-types";

type LatexCommand =
  | "address"
  | "documentclass"
  | "begin"
  | "end"
  | "name"
  | "href"
  | "usepackage";

type ArrayItem<T> = T extends Array<infer U> ? U : never;
type Skill = ArrayItem<ResumeSchema["skills"]>;
type Work = ArrayItem<ResumeSchema["work"]>;

export function buildRezzy(resume: ResumeSchema): string[] {
  const escapedResume = latexEscapeCharsInObject(resume, ["&", "#"]);
  return [
    ...buildPreamble(escapedResume),
    ...buildObjective(escapedResume),
    ...buildAreasOfExpertise(escapedResume),
    ...buildSkills(escapedResume),
    ...buildExperience(escapedResume),
    ...buildEducation(escapedResume),
    ...buildCerts(escapedResume),
    ...buildFooter(escapedResume),
  ];
}

function latexCommand(
  command: LatexCommand,
  args: string[] = [],
  options?: string,
): string {
  const opt = options ? `[${options}]` : ``;
  return `\\${command}${opt}{${args.join("}{")}}`;
}

function latexNewCommand(
  name: string,
  numArgs = 0,
  body: string,
  defaultValue?: string,
) {
  const argCount = numArgs > 0 ? `[${numArgs}]` : "";
  const defaultArg = defaultValue !== undefined ? `[${defaultValue}]` : "";
  return `\\newcommand{\\${name}}${defaultArg || argCount}{${body}}`;
}

function latexSection(sectionName: string, lines: string[]): string[] {
  if (lines.length === 0) return [];
  return [
    latexCommand("begin", ["rSection", sectionName]),
    ...lines,
    latexCommand("end", ["rSection"]),
  ];
}

function latexList(lines: string[]): string[] {
  if (!lines.length) return [];

  // `\\item ${it}`
  return [
    " \\begin{itemize}",
    "    \\itemsep -3pt {}",
    ...lines.map((it) => `\\item ${it}`),
    " \\end{itemize}",
  ];

  // if (lines.length === 0) return [];
  // return [
  //   latexCommand("begin", ["rSection", sectionName]),
  //   ...lines,
  //   latexCommand("end", ["rSection"]),
  // ];
}

function buildPreamble(resume: ResumeSchema): string[] {
  const { name, phone, email } = resume.basics ?? {};
  const { region, city } = resume.basics?.location ?? {};

  const hrefs = [
      `\\href{mailto:${email}}{${email}}`,
    ...resume.basics?.profiles?.map((it) => {
      return `\\href{${it.url}}{${it.url}}`;
    }) ?? []
  ];

  return [
    latexCommand("documentclass", ["resume"]),
    latexCommand(
      "usepackage",
      ["geometry"],
      "left=0.4 in,top=0.4in,right=0.4 in,bottom=0.4in",
    ),
    latexCommand("usepackage", ["tabularx"]),
    latexNewCommand("itab", 1, "\\hspace{0em}\\rlap{#1}", "1"),
    latexCommand("name", [name ?? ""]),
    latexCommand("address", [`${phone ?? ""} \\\\ ${city}, ${region}`]),
    `\\address{${hrefs.map(it => it).join(' \\\\ ')}}`,
    latexCommand("begin", ["document"]),
  ];
}

function buildObjective(resume: ResumeSchema): string[] {
  return latexSection("OBJECTIVE", [`{${resume.basics?.summary}}`]);
}

function buildEducation(resume: ResumeSchema): string[] {
  const lines: string[] =
    resume.education?.map((it) =>
      `{\\bf ${it.area}}, ${it.institution} \\hfill {${it.startDate} - ${it.endDate}} \\\\`
    ) ?? [];
  return latexSection("Education", lines);
}

function buildCerts(resume: ResumeSchema): string[] {
  const lines: string[] =
    resume.certificates?.map((it) =>
      `{\\bf ${it.name}}, ${it.issuer} \\hfill {${it.date}} \\\\`
    ) ?? [];
  return latexSection("Certifications", lines);
}

function buildAreasOfExpertise(resume: ResumeSchema): string[] {
  if (!resume.interests?.length) return [];

  // const x = resume.interests.map((it, i) => `${it.name} ${(i + 1) % 3 === 0 ? '\\\\' : '&'}`);

  const lines = [
    "\\begin{table}[h]",
    "\\centering",
    "\\begin{tabularx}{\\textwidth}{XXX}",
    ...resume.interests.map((it, i) =>
      `${it.name} ${(i + 1) % 3 === 0 ? "\\\\" : "&"}`
    ),
    // ...split[0].map((it) => `{${it.name} &} \\\\`) ?? [],
    // ...split[1].map((it) => `{${it.name} &} \\\\`) ?? [],
    // ...split[2].map((it) => `{${it.name} &} \\\\`) ?? [],
    // ...resume.interests?.map((it) => `{${it.name} \\&} \\\\`) ?? [],
    // ...resume.interests?.map((it) => `{${it.name} \\&} \\\\`) ?? [],
    // 'Longer text that wraps & More content here & Final column \\\\',
    "\\end{tabularx}",
    "\\end{table}",
  ];
  /**
   * \begin{table}[h]
   * \centering
   * \begin{tabularx}{\textwidth}{XXX}
   * Longer text that wraps & More content here & Final column \\
   * \end{tabularx}
   * \end{table}
   */

  // const lines: string[] = resume.interests?.map((it) => `{${it.name}} \\\\`) ??
  //   [];
  return latexSection("Areas of Expertise", lines);
}

function buildSkills(resume: ResumeSchema): string[] {
  if (resume.skills?.length === 0) return [];

  const lines = resume.skills?.map((it) => {
    if (it.keywords?.length === 0) return "";

    return [
      ...buildSkill(it),
    ].join("\n");
  }) ?? [];

  /**
   * \begin{table}[h]
   * \centering
   * \begin{tabularx}{\textwidth}{lX}
   * skill name & items \\
   * \end{tabularx}
   * \end{table}
   */

  return latexSection("Skills", [
    // `\\begin{tabular}{ @{} >{\\bfseries}l @{\\hspace{6ex}} l }`,
    // ...lines,
    // `\\end{tabular}`,
    "\\begin{table}[h]",
    "\\centering",
    "\\begin{tabularx}{\\textwidth}{lX}",
    ...lines,
    // 'skill name & items \\\\',
    "\\end{tabularx}",
    "\\end{table}",
  ]);
}

function buildSkill(skill: Skill): string[] {
  if (!skill.name) return [];
  return [
    `\\textbf{${skill.name}} & ${
      skill.keywords?.map((it) => it).join(", ")
    } \\\\`,
  ];
}

function buildExperience(resume: ResumeSchema): string[] {
  if (!resume.work?.length) return [];
  return latexSection(
    "EXPERIENCE",
    resume.work.map((it) => buildWork(it)).flat(),
  );
}

function buildWork(work: Work): string[] {
  if (!work.name) return [];
  if (!work.position) return [];

  // const highlights = work.highlights?.map((it) => `\\item ${it}`) ?? [];

  // const itemList = work.highlights?.length ?? 0 > 0
  //   ? [
  //     " \\begin{itemize}",
  //     "    \\itemsep -3pt {}",
  //     ...highlights,
  //     " \\end{itemize}",
  //   ]
  //   : [];

  const list = latexList(work.highlights ?? []);

  return [
    `\\textbf{${work.position}} \\hfill ${work.startDate} - ${work.startDate}\\\\`,
    `${work.name} \\hfill \\textit{${work.location}}\\\\`,
    `{${work.summary}}`,
    ...list,
  ];
}

function buildFooter(resume: ResumeSchema): string[] {
  return [
    `\\end{document}`,
  ];
}

function latexEscapeCharsInObject<T extends Record<string, any>>(
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
    if (typeof input === "string") {
      return escapeString(input);
    }

    if (Array.isArray(input)) {
      return input.map((item) => recurse(item));
    }

    if (input && typeof input === "object") {
      const result: Record<string, any> = {};
      for (const key in input) {
        if (input.hasOwnProperty(key)) {
          result[key] = recurse(input[key]);
        }
      }
      return result;
    }

    return input;
  };

  return recurse(obj);
}

function splitIntoParts<T>(arr: T[], numParts: number): T[][] {
  const result: T[][] = [];
  const len = arr.length;
  const baseSize = Math.floor(len / numParts);
  let remainder = len % numParts;
  let start = 0;

  for (let i = 0; i < numParts; i++) {
    let size = baseSize + (remainder > 0 ? 1 : 0);
    result.push(arr.slice(start, start + size));
    start += size;
    remainder--;
  }

  return result;
}

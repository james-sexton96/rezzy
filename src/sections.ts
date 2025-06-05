import {ResumeSchema} from "@kurone-kito/jsonresume-types";
import {latexBannerComment, latex, latexList, latexNewCommand, latexSection} from './latex.ts';

import {Education, Skill, Work} from './types.ts';

export function sections(resume: ResumeSchema): string[] {
  const { name, phone, email, url, profiles = [] } = resume.basics ?? {};
  const { region, city } = resume.basics?.location ?? {};
  const hspace = latex("hspace", ["0em"]);
  const rlap = latex("rlap", ["#1"]);

  const hrefs = [
    latex("href", [`mailto:${email}`, email]),
    latex("href", [url, url]),
    ...profiles.map((it) => latex("href", [it.url, it.url])),
  ];

  return [
    latex("documentclass", ["resume"]),
    latex(
      "usepackage",
      ["geometry"],
      "left=0.4 in,top=0.4in,right=0.4 in,bottom=0.4in",
    ),
    latex("usepackage", ["tabularx"]),
    latexNewCommand("itab", 1, `${hspace}${rlap}`, "1"),
    latex("name", [name ?? ""]),
    latex("address", [`${phone ?? ""} \\\\ ${city}, ${region}`]),
    latex("address", [hrefs.map((it) => it).join(" \\\\ ")]),
    latex("begin", ["document"]),
  ];
}

export function buildObjective(resume: ResumeSchema): string[] {
  return latexSection("OBJECTIVE", [`{${resume.basics?.summary}}`]);
}

export function buildEducationSection(resume: ResumeSchema): string[] {
  return latexSection(
    "Education",
    resume.education?.map(buildEducationLine) ?? [],
  );
}

function buildEducationLine(ed: Education): string {
  return [
    latex("textbf", [ed.area]),
    `, ${ed.institution}`,
    latex("hfill", [ed.startDate + " - " + ed.endDate]),
    `\\\\`,
  ].join(' ');
}

export function buildCertificationsSection(resume: ResumeSchema): string[] {
  const lines: string[] =
    resume.certificates?.map((it) =>
      `{\\bf ${it.name}}, ${it.issuer} \\hfill {${it.date}} \\\\`
    ) ?? [];
  return latexSection("Certifications", lines);
}

export function buildAreasOfExpertiseSection(resume: ResumeSchema): string[] {
  if (!resume.interests?.length) return [];

  const lines = [
    "\\begin{table}[h]",
    "\\centering",
    "\\begin{tabularx}{\\textwidth}{XXX}",
    ...resume.interests.map((it, i) =>
      `${it.name} ${(i + 1) % 3 === 0 ? "\\\\" : "&"}`
    ),
    "\\end{tabularx}",
    "\\end{table}",
  ];
  return latexSection("Areas of Expertise", lines);
}

export function buildSkills(resume: ResumeSchema): string[] {
  if (resume.skills?.length === 0) return [];

  const lines = resume.skills?.map((it) => {
    if (it.keywords?.length === 0) return "";

    return [
      ...buildSkill(it),
    ].join("\n");
  }) ?? [];

  return latexSection("Skills", [
    "\\begin{table}[h]",
    "\\centering",
    "\\begin{tabularx}{\\textwidth}{lX}",
    ...lines,
    "\\end{tabularx}",
    "\\end{table}",
  ]);
}

function buildSkill(skill: Skill): string[] {
  if (!skill.name) return [];
  return [
    `\\textbf{${skill.name}} & ${
      skill.keywords?.map((it) => it).join(", ")
    } \\\\\\\\`,
  ];
}

export function buildExperience(resume: ResumeSchema): string[] {
  if (!resume.work?.length) return [];
  return latexSection(
    "EXPERIENCE",
    resume.work.map((it) => buildWork(it)).flat(),
  );
}

function buildWork(work: Work): string[] {
  if (!work.name) return [];
  if (!work.position) return [];

  return [
    ...latexBannerComment(`Experience: ${work.name} - ${work.position}`),
    `\\textbf{${work.position}} \\hfill ${work.startDate} - ${work.endDate}\\\\`,
    `${work.name} \\hfill \\textit{${work.location}}\\\\`,
    `{${work.summary}}`,
    ...latexList(work.highlights ?? []),
  ];
}

export function buildFooter(resume: ResumeSchema): string[] {
  return [
    `\\end{document}`,
  ];
}

import { ResumeSchema } from "@kurone-kito/jsonresume-types";
import {
  latexBannerComment,
  latexCommand,
  latexList,
  latexNewCommand,
  latexSection,
} from "./latex.ts";

import { Certificate, Education, Interest, Skill, Work } from "./types.ts";

export function buildPreamble(resume: ResumeSchema): string[] {
  const { name, phone, email, url, profiles = [] } = resume.basics ?? {};
  const { region, city } = resume.basics?.location ?? {};
  const hspace = latexCommand("hspace", ["0em"]);
  const rlap = latexCommand("rlap", ["#1"]);

  // Prevent duplicate links by checking if url is already in profiles
  const profileUrls = profiles.map(profile => profile.url);
  const uniqueLinks = [
    email ? latexCommand("href", [`mailto:${email}`, email]) : null,
    // Only include the url if it's defined and not already in profiles
    url && !profileUrls.includes(url) ? latexCommand("href", [url, url]) : null,
    ...profiles.map((it) => it.url ? latexCommand("href", [it.url, it.url]) : null),
  ].filter(Boolean).join(" \\\\ ");

  // Format address parts only if they're defined
  const formatAddress = () => {
    const parts = [];
    if (phone) parts.push(phone);

    const locationParts = [];
    if (city) locationParts.push(city);
    if (region) locationParts.push(region);

    const locationStr = locationParts.join(", ");
    if (locationStr) parts.push(locationStr);

    return parts.join(" \\\\ ");
  };

  return [
    latexCommand("documentclass", ["resume"]),
    latexCommand(
      "usepackage",
      ["geometry"],
      "left=0.4 in,top=0.4in,right=0.4 in,bottom=0.4in",
    ),
    latexCommand("usepackage", ["tabularx"]),
    latexNewCommand("itab", 1, `${hspace}${rlap}`, "1"),
    latexCommand("name", [name]),
    ...(formatAddress() ? [latexCommand("address", [formatAddress()])] : []),
    ...(uniqueLinks ? [latexCommand("address", [uniqueLinks])] : []),
    latexCommand("begin", ["document"]),
  ];
}

export function buildObjectiveSection(resume: ResumeSchema): string[] {
  return latexSection("OBJECTIVE", [`{${resume.basics?.summary}}`]);
}

export function buildEducationSection(resume: ResumeSchema): string[] {
  return latexSection(
    "Education",
    resume.education?.map(buildEducationLine) ?? [],
  );
}

function buildEducationLine(ed: Education): string {
  const area = latexCommand("textbf", [ed.area]);
  const date = latexCommand("hfill", [`${ed.startDate} - ${ed.endDate}`]);
  return`${area}, ${ed.institution} ${date} \\\\`;
}

export function buildCertificationsSection(resume: ResumeSchema): string[] {
  if (!resume.certificates?.length) return [];
  const { certificates } = resume;
  return latexSection("Certifications", certificates.map(buildCertificateLine));
}

export function buildCertificateLine(cert: Certificate): string {
  const hfill = latexCommand("hfill");
  const certName = latexCommand("textbf", [cert.name]);
  return `${certName}, ${cert.issuer} ${hfill} {${cert.date}} \\\\`;
}

export function buildInterestsSection(resume: ResumeSchema): string[] {
  if (!resume.interests?.length) return [];
  const { interests } = resume;
  const textwidth = latexCommand("textwidth");

  const lines = [
    latexCommand("begin", ["table"], "h"),
    latexCommand("centering"),
    latexCommand("begin", ["tabularx", textwidth, "XXX"]),
    ...buildInterestLines(interests, 3),
    latexCommand("end", ["tabularx"]),
    latexCommand("end", ["table"]),
  ];

  return latexSection("Areas of Expertise", lines);
}

function buildInterestLines(
  interests: Interest[],
  numColumns: number,
): string[] {
  const delim = (i: number) => (i + 1) % numColumns === 0 ? `\\\\` : `&`;
  return interests.map((it, i) => `${it.name} ${delim(i)}`);
}

export function buildSkillsSection(resume: ResumeSchema): string[] {
  if (!resume.skills?.length) return [];

  return latexSection("Skills", [
    latexCommand("begin", ["table"], "h"),
    latexCommand("centering"),
    latexCommand("begin", ["tabularx", latexCommand("textwidth"), "lX"]),
    ...resume.skills.map(buildSkill),
    latexCommand("end", ["tabularx"]),
    latexCommand("end", ["table"]),
  ]);
}

function buildSkill(skill: Skill): string {
  if (!skill.name) return "";
  if (!skill.keywords?.length) return "";

  const skillsStr = skill.keywords?.map((it) => it).join(", ");
  return `${latexCommand("textbf", [skill.name])} & ${skillsStr} \\\\`;
}

export function buildExperienceSection(resume: ResumeSchema): string[] {
  if (!resume.work?.length) return [];
  return latexSection("EXPERIENCE", resume.work.map(buildWork).flat());
}

function buildWork(work: Work): string[] {
  if (!work.name) return [];
  if (!work.position) return [];

  const position = latexCommand("textbf", [work.position]);
  const date = latexCommand("hfill", [`${work.startDate} - ${work.endDate}`]);
  const location = latexCommand("textit", [work.location]);

  return [
    ...latexBannerComment(`Experience: ${work.name} - ${work.position}`),
    `${position} ${date} \\\\`,
    `${latexCommand('textit', [work.name])} ${latexCommand("hfill")} ${location} \\\\`,
    `{${work.summary}}`,
    ...latexList(work.highlights ?? []),
  ];
}

export function buildFooter(_resume: ResumeSchema): string[] {
  return [
    latexCommand("end", ["document"]),
  ];
}

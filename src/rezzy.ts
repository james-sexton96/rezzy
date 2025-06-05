import { ResumeSchema } from "@kurone-kito/jsonresume-types";
import { latexEscapeCharsInObject } from "./latex.ts";
import {
  buildAreasOfExpertiseSection,
  buildCertificationsSection,
  buildEducationSection,
  buildExperience,
  buildFooter,
  buildObjective,
  buildSkills,
  sections,
} from "./sections.ts";
import { LATEX_CHARS } from "./constants.ts";

export function buildRezzy(resume: ResumeSchema): string[] {
  const escapedResume = latexEscapeCharsInObject(resume, LATEX_CHARS);
  return [
    ...sections(escapedResume),
    ...buildObjective(escapedResume),
    ...buildAreasOfExpertiseSection(escapedResume),
    ...buildSkills(escapedResume),
    ...buildExperience(escapedResume),
    ...buildEducationSection(escapedResume),
    ...buildCertificationsSection(escapedResume),
    ...buildFooter(escapedResume),
  ];
}

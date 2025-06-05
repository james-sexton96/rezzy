import { ResumeSchema } from "@kurone-kito/jsonresume-types";
import { latexEscapeCharsInObject } from "./latex.ts";
import {
  buildInterestsSection,
  buildCertificationsSection,
  buildEducationSection,
  buildExperienceSection,
  buildFooter,
  buildObjectiveSection,
  buildSkillsSection,
  buildPreamble,
} from "./sections.ts";
import { LATEX_CHARS } from "./constants.ts";

export function buildRezzy(resume: ResumeSchema): string[] {
  const escapedResume = latexEscapeCharsInObject(resume, LATEX_CHARS);
  return [
    ...buildPreamble(escapedResume),
    ...buildObjectiveSection(escapedResume),
    ...buildInterestsSection(escapedResume),
    ...buildSkillsSection(escapedResume),
    ...buildExperienceSection(escapedResume),
    ...buildEducationSection(escapedResume),
    ...buildCertificationsSection(escapedResume),
    ...buildFooter(escapedResume),
  ];
}

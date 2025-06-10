import { ResumeSchema } from "@kurone-kito/jsonresume-types";
import { latexEscapeCharsInObject } from "./latex.ts";
import {
  buildCertificationsSection,
  buildEducationSection,
  buildExperienceSection,
  buildFooter,
  buildInterestsSection,
  buildObjectiveSection,
  buildPreamble,
  buildSkillsSection,
} from "./sections.ts";
import { LATEX_CHARS } from "./constants.ts";

export class Rezzy {
  constructor(private resume: ResumeSchema) {}

  async buildRezzy(): Promise<string[]> {
    const escapedResume = latexEscapeCharsInObject(this.resume, LATEX_CHARS);
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
}

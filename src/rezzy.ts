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
import { CoverLetterSchema } from "./schemas.ts";
import { LatexCoverLetterRenderer } from "./renderers/latex_cover_letter_renderer.ts";

export interface RezzyResult {
  latexResume: string[];
  latexCoverLetter?: string[];
}

export class Rezzy {
  constructor(
    private resume: ResumeSchema,
    private letter?: CoverLetterSchema,
  ) {}

  buildRezzyResult(): RezzyResult {
    return {
      latexResume: this.buildResume(),
      latexCoverLetter: this.letter
        ? new LatexCoverLetterRenderer(this.resume, this.letter).render()
        : undefined,
    };
  }

  buildResume(): string[] {
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

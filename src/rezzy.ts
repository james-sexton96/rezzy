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

  buildRezzy(): string[] {
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

  static async fetchResume(source: string): Promise<ResumeSchema> {
    if (source.startsWith("http")) {
      const response = await fetch(source);
      if (!response.ok) throw new Error(response.statusText);
      return response.json();
    } else {
      return JSON.parse(await Deno.readTextFile(source));
    }
  }
}

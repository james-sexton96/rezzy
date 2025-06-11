import { createJsonTranslator, createLanguageModel } from "typechat";
import { createZodJsonValidator } from "typechat/zod";
import { CoverLetterResponse, CoverLetterSchema } from "./schemas.ts";
import { ResumeSchema } from "@kurone-kito/jsonresume-types";
import { latexCommand } from "./latex.ts";
import { logTempFile } from "./logger.ts";

export class RezzyCover {
  constructor(private resume: ResumeSchema) {}

  async buildCover(url: string): Promise<string[]> {
    const letter = await this.fetchAiGeneratedCoverLetter(url);

    return [
      ...this.buildPreamble(letter),
      ...this.buildHeader(letter),
      ...this.buildBody(letter),
      ...this.buildFooter(letter),
    ];
  }

  async fetchAiGeneratedCoverLetter(url: string): Promise<CoverLetterSchema> {
    const model = createLanguageModel(Deno.env.toObject());
    const validator = createZodJsonValidator(
      { CoverLetterResponse },
      "CoverLetterResponse",
    );
    const translator = createJsonTranslator(model, validator);

    const request = [
      `Build a cover letter for the job description at this url: ${url}`,
      `My resume is here in JSON format: `,
      JSON.stringify(this.resume, null, 2),
    ].join("\n\n");

    const response = await translator.translate(request);
    if (!response.success) throw new Error(response.message);

    logTempFile("openai", JSON.stringify(response.data, null, 2));

    return response.data;
  }

  buildPreamble(cover: CoverLetterSchema): string[] {
    return [
      `\\documentclass[12pt,letterpaper]{article}`,
      `\\usepackage[left=0.75in,right=0.75in,top=0.75in,bottom=0.75in]{geometry}`,
      `\\usepackage{enumitem}`,
      `\\usepackage{xcolor}`,
      `\\usepackage{setspace}`,
      `\\usepackage[colorlinks=true, linkcolor=blue, urlcolor=blue]{hyperref}`,
      `\\definecolor{blackcolor}{RGB}{0,0,0}`,
      `\\setlength{\\parskip}{1em}`,
      `\\pagenumbering{gobble}`,
      `\\setlength{\\parindent}{0pt}`,
      `\\setlist[itemize]{leftmargin=2em, itemsep=0.5em, parsep=0pt}`,
      `\\begin{document}`,
    ];
  }

  buildHeader(cover: CoverLetterSchema): string[] {
    const fullName = String(this.resume.basics?.name ?? "").toUpperCase();
    const { phone, email, url, profiles = [] } = this.resume.basics ?? {};
    const { city, region } = this.resume.basics?.location ?? {};

    return [
      `\\begin{center}`,
      `{\\LARGE\\bfseries\\color{blackcolor} ${fullName}} \\\\[-0.2em]`,
      `\\vspace{.75em}`,
      `{${phone}} $\\diamond$ ${city}, ${region}  \\\\`,
      `\\vspace{.5em}`,
      `\\href{mailto:${email}}{${email}} $\\diamond$`,
      `\\href{${url}}{${url}} $\\diamond$`,
      ...profiles.map((it) => latexCommand("href", [it.url, it.url])),
      `\\noindent\\rule{\\textwidth}{.75pt}`,
      `\\end{center}`,
    ];
  }

  buildBody(cover: CoverLetterSchema): string[] {
    const { companyCity, companyState, companyZipCode, letterBody } = cover;
    const cityStateZip = `${companyCity}, ${companyState} ${companyZipCode}`;
    const addressLine = `${cover.companyStreetAddress} \\\\ ${cityStateZip}`;

    return [
      `\\vspace{0.5em}`,
      `{\\fontsize{12}{14}\\selectfont ${new Date().toDateString()}}`,
      `\\vspace{1em}`,
      `{\\fontsize{12}{14}\\selectfont \\\\ ${addressLine} \\\\ \\\\}`,
      `\\vspace{1em}`,
      `{\\fontsize{12}{14}\\selectfont ${cover.greeting} \\\\ ${letterBody}}`,
    ];
  }

  buildFooter(cover: CoverLetterSchema): string[] {
    return [
      `\\end{document}`,
    ];
  }
}

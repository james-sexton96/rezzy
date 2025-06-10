import { createJsonTranslator, createLanguageModel } from "typechat";
import { createZodJsonValidator } from "typechat/zod";
import { CoverLetter, CoverLetterResponse } from "./schemas.ts";
import { ResumeSchema } from "@kurone-kito/jsonresume-types";

export class Cover {
  constructor(private resume: ResumeSchema) {}

  async buildCover(url: string): Promise<string[]> {
    const letter = await this.fetchLetter(url);

    return [
      ...this.buildPreamble(letter),
      ...this.buildHeader(letter),
      ...this.buildBody(letter),
      ...this.buildFooter(letter),
    ];
  }

  async fetchLetter(url: string): Promise<CoverLetter> {
    const model = createLanguageModel(Deno.env.toObject());
    const validator = createZodJsonValidator(
      { CoverLetterResponse },
      "CoverLetterResponse",
    );
    const translator = createJsonTranslator(model, validator);

    const request = [
      `Build a cover letter for the job description at this url ${url} for my resume presented here in JSON format: `,
      JSON.stringify(this.resume, null, 2),
    ].join("\n");

    const response = await translator.translate(request);
    if (!response.success) throw new Error(response.message);

    return response.data;
  }

  buildPreamble(cover: CoverLetter): string[] {
    return [
      `\\documentclass[12pt,letterpaper]{article}`,
      `\\usepackage[left=0.75in,right=0.75in,top=0.75in,bottom=0.75in]{geometry}`,
      `\\usepackage{enumitem}`,
      `\\usepackage{xcolor}`,
      `\\usepackage{setspace}`,
      `\\usepackage[colorlinks=true, linkcolor=blue, urlcolor=blue]{hyperref}`,
      ``,
      `% Define black color for this template`,
      `\\definecolor{blackcolor}{RGB}{0,0,0}`,
      ``,
      `% Set paragraph spacing`,
      `\\setlength{\\parskip}{1em}`,
      ``,
      `% Remove page numbers`,
      `\\pagenumbering{gobble}`,
      ``,
      `% Remove default indentation`,
      `\\setlength{\\parindent}{0pt}`,
      ``,
      `% Custom list formatting`,
      `\\setlist[itemize]{leftmargin=2em, itemsep=0.5em, parsep=0pt}`,
      ``,
      `\\begin{document}`,
    ];
  }

  buildHeader(cover: CoverLetter): string[] {
    return [
      ``,
      `% Centered Header with no extra space`,
      `\\begin{center}`,
      `    {\\LARGE\\bfseries\\color{blackcolor} NATHAN BIRKES} \\\\[-0.2em] % Negative spacing to reduce space`,
      `    \\vspace{.75em}`,
      `    {+1(254) 644-7382} $\\diamond$ Waco, TX  \\\\`,
      `    \\vspace{.5em}`,
      `    \\href{mailto:nbirkes@icloud.com}{nbirkes@icloud.com} $\\diamond$`,
      `    \\href{https://birk.es/}{https://birk.es/} $\\diamond$`,
      `    \\href{https://www.linkedin.com/in/nbirkes/}{https://www.linkedin.com/in/nbirkes/}`,
      ``,
      `    \\noindent\\rule{\\textwidth}{.75pt} % Full-width thick line`,
      `\\end{center}`,
    ];
  }

  buildBody(cover: CoverLetter): string[] {
    return [
      ``,
      `\\vspace{0.5em} % Reduced space below the line`,
      ``,
      `% Date`,
      `{\\fontsize{12}{14}\\selectfont`,
      `[Today’s Date]`,
      `}`,
      ``,
      `\\vspace{1em}`,
      ``,
      `% Address Block`,
      `{\\fontsize{12}{14}\\selectfont`,
      `[Hiring Manager’s Name] \\\\`,
      `123 Company Address \\\\`,
      `Company’s City, State Zip Code \\\\`,
      `(xxx) xxx-xxxx \\\\`,
      `hiring.manager@gmail.com`,
      `}`,
      ``,
      `\\vspace{1em}`,
      ``,
      `% Body of the letter`,
      `{\\fontsize{12}{14}\\selectfont`,
      `Dear [Mr./Ms./Mx.] [Hiring Manager’s Last Name],`,
      ``,
      cover.letterBody,
      `}`,
      ``,
      `\\vspace{1em}`,
      ``,
      `% Sign-off`,
      `{\\fontsize{12}{14}\\selectfont`,
      `Sincerely,`,
      `}`,
      ``,
      `\\vspace{2em}`,
      ``,
      `% Signature`,
      `{\\fontsize{12}{14}\\selectfont`,
      `Richard Williams`,
      `}`,
      ``,
    ];
  }

  buildFooter(cover: CoverLetter): string[] {
    return [
      `\\vspace{2em}`,
      ``,
      `% Full-width line above the contact information`,
      `\\noindent\\rule{\\textwidth}{.75pt}`,
      ``,
      `% Footer with contact information`,
      `\\begin{center}`,
      `{\\fontsize{12}{14}\\selectfont`,
      `3665 Margaret Street, Houston, TX 47587 • RichardWilliams@gmail.com • (770) 625-9669`,
      `}`,
      `\\end{center}`,
      ``,
      `\\end{document}`,
    ];
  }
}

import { CoverLetterSchema } from "../schemas.ts";
import { ResumeSchema } from "@kurone-kito/jsonresume-types";
import { latexCommand } from "../latex.ts";
import { RezzyRenderer } from "../interfaces.ts";

export class LatexCoverLetterRenderer implements RezzyRenderer {
  constructor(
    private resume: ResumeSchema,
    private letter: CoverLetterSchema,
  ) {}

  render(): string[] {
    return [
      ...this.buildPreamble(),
      ...this.buildHeader(),
      ...this.buildBody(),
      ...this.buildFooter(),
    ];
  }

  private buildPreamble(): string[] {
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

  private buildHeader(): string[] {
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

  private buildBody(): string[] {
    const { companyCity, companyState, companyZipCode, letterBody } =
      this.letter;
    const cityStateZip = `${companyCity}, ${companyState} ${companyZipCode}`;
    const addressLine =
      `${this.letter.companyStreetAddress} \\\\ ${cityStateZip}`;

    return [
      `\\vspace{0.5em}`,
      `{\\fontsize{12}{14}\\selectfont ${new Date().toLocaleDateString()}}`,
      `\\vspace{1em}`,
      `{\\fontsize{12}{14}\\selectfont \\\\ ${addressLine} \\\\ \\\\}`,
      `\\vspace{1em}`,
      `{\\fontsize{12}{14}\\selectfont ${this.letter.greeting} \\\\ ${letterBody}}`,
    ];
  }

  private buildFooter(): string[] {
    return [
      `\\end{document}`,
    ];
  }
}

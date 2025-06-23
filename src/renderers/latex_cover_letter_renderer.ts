import { CoverLetterSchema } from "../schemas.ts";
import { ResumeSchema } from "@kurone-kito/jsonresume-types";
import { latexCommand, latexEscapeCharsInObject } from "../latex.ts";
import { RezzyRenderer } from "../interfaces.ts";
import { LATEX_CHARS } from "../constants.ts";

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

    // Format location only if city or region is defined
    const formatLocation = () => {
      const locationParts = [];
      if (city) locationParts.push(city);
      if (region) locationParts.push(region);
      return locationParts.join(", ");
    };

    const location = formatLocation();

    // Format contact line with phone and location
    const contactLine = () => {
      const parts = [];
      if (phone) parts.push(`{${phone}}`);
      if (location) parts.push(location);
      return parts.length > 0 ? parts.join(" $\\diamond$ ") + " \\\\" : "";
    };

    // Prevent duplicate links by checking if url is already in profiles
    const profileUrls = profiles.map((profile) => profile.url);

    // Build links array with email, url (if not in profiles), and profiles
    const links = [];
    if (email) links.push(`\\href{mailto:${email}}{${email}}`);
    if (url && !profileUrls.includes(url)) links.push(`\\href{${url}}{${url}}`);

    // Add profile links
    const profileLinks = profiles
      .filter((profile) => profile.url)
      .map((profile) => latexCommand("href", [profile.url, profile.url]));

    // Join all links with diamond separator
    const linksLine = [...links, ...profileLinks].join(" $\\diamond$ ");

    return [
      `\\begin{center}`,
      `{\\LARGE\\bfseries\\color{blackcolor} ${fullName}} \\\\[-0.2em]`,
      `\\vspace{.75em}`,
      contactLine(),
      `\\vspace{.5em}`,
      linksLine,
      `\\noindent\\rule{\\textwidth}{.75pt}`,
      `\\end{center}`,
    ];
  }

  private buildBody(): string[] {
    // Get the raw letter data without escaping
    const {
      companyCity,
      companyState,
      companyZipCode,
      letterBody,
      greeting,
      companyStreetAddress,
    } = this.letter;

    // Escape special LaTeX characters in the letter data, but not square brackets
    const escapedGreeting =
      latexEscapeCharsInObject({ text: greeting }, LATEX_CHARS).text;
    const escapedLetterBody =
      latexEscapeCharsInObject({ text: letterBody }, LATEX_CHARS).text;

    // Protect square brackets in address fields by enclosing them in curly braces
    const protectBrackets = (text: string): string => {
      if (!text) return "";
      return text.replace(/\[([^\]]+)\]/g, "{[}$1{]}");
    };

    const protectedCompanyAddress = protectBrackets(companyStreetAddress);
    const protectedCompanyCity = protectBrackets(companyCity);
    const protectedCompanyState = protectBrackets(companyState);
    const protectedCompanyZipCode = protectBrackets(companyZipCode);

    // Format the city, state, zip only if they're defined
    const formatCityStateZip = () => {
      const parts = [];

      // Add city and state if defined
      if (protectedCompanyCity) {
        parts.push(protectedCompanyCity);
        if (protectedCompanyState) {
          parts[parts.length - 1] += `, ${protectedCompanyState}`;
        }
      } else if (protectedCompanyState) {
        parts.push(protectedCompanyState);
      }

      // Add zip code if defined
      if (protectedCompanyZipCode) {
        parts.push(protectedCompanyZipCode);
      }

      return parts.join(" ");
    };

    // Format the complete address
    const formatAddress = () => {
      const parts = [];

      if (protectedCompanyAddress) {
        parts.push(protectedCompanyAddress);
      }

      const cityStateZip = formatCityStateZip();
      if (cityStateZip) {
        parts.push(cityStateZip);
      }

      return parts.join(" \\\\ ");
    };

    const addressLine = formatAddress();

    return [
      `\\vspace{0.5em}`,
      `{\\fontsize{12}{14}\\selectfont ${new Date().toLocaleDateString()}}`,
      `\\vspace{1em}`,
      addressLine
        ? `{\\fontsize{12}{14}\\selectfont \\\\ ${addressLine} \\\\ \\\\}`
        : "",
      `\\vspace{1em}`,
      `{\\fontsize{12}{14}\\selectfont ${escapedGreeting} \\\\ ${escapedLetterBody}}`,
    ].filter(Boolean);
  }

  private buildFooter(): string[] {
    return [
      `\\end{document}`,
    ];
  }
}

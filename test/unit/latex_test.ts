import { assertEquals } from "@std/assert";
import {
  latexBannerComment,
  latexEscapeCharsInObject,
  latexList,
  latexNewCommand,
  latexSection,
} from "../../src/latex.ts";
import { LATEX_CHARS } from "../../src/constants.ts";

// Tests for latexNewCommand
Deno.test("latexNewCommand - basic command", function () {
  const expected = "\\newcommand{\\cmd}{body}";
  const actual = latexNewCommand("cmd", 0, "body");
  assertEquals(actual, expected);
});

Deno.test("latexNewCommand - with arguments", function () {
  const expected = "\\newcommand{\\cmd}[2]{body}";
  const actual = latexNewCommand("cmd", 2, "body");
  assertEquals(actual, expected);
});

Deno.test("latexNewCommand - with default value", function () {
  const expected = "\\newcommand{\\cmd}[default]{body}";
  const actual = latexNewCommand("cmd", 0, "body", "default");
  assertEquals(actual, expected);
});

// Tests for latexSection
Deno.test("latexSection - with content", function () {
  const expected = [
    "",
    "%----------------------------------------------------------------------------------------",
    "% SECTION: TEST SECTION",
    "%----------------------------------------------------------------------------------------",
    "",
    "\\begin{rSection}{Test Section}",
    "Line 1",
    "Line 2",
    "\\end{rSection}",
  ];
  const actual = latexSection("Test Section", ["Line 1", "Line 2"]);
  assertEquals(actual, expected);
});

Deno.test("latexSection - empty content", function () {
  const expected: string[] = [];
  const actual = latexSection("Test Section", []);
  assertEquals(actual, expected);
});

// Tests for latexBannerComment
Deno.test("latexBannerComment - with comment", function () {
  const expected = [
    "",
    "%----------------------------------------------------------------------------------------",
    "% TEST COMMENT",
    "%----------------------------------------------------------------------------------------",
    "",
  ];
  const actual = latexBannerComment("Test Comment");
  assertEquals(actual, expected);
});

Deno.test("latexBannerComment - empty comment", function () {
  const expected: string[] = [];
  const actual = latexBannerComment(undefined);
  assertEquals(actual, expected);
});

// Tests for latexList
Deno.test("latexList - with items", function () {
  const expected = [
    "\\begin{itemize}",
    "\\setlength{\\itemsep}{-3pt}",
    "\\item{Item 1}",
    "\\item{Item 2}",
    "\\item{Item 3}",
    "\\end{itemize}",
  ];
  const actual = latexList(["Item 1", "Item 2", "Item 3"]);
  assertEquals(actual, expected);
});

Deno.test("latexList - empty list", function () {
  const expected: string[] = [];
  const actual = latexList([]);
  assertEquals(actual, expected);
});

// Tests for latexEscapeCharsInObject
Deno.test("latexEscapeCharsInObject - escapes special characters in strings", function () {
  const input = { text: "This has special chars: & % $ # _ { } ~ ^ \\" };
  const expected = {
    text: "This has special chars: \\& \\% \\$ \\# \\_ \\{ \\} \\~ \\^ \\\\",
  };
  const actual = latexEscapeCharsInObject(input, LATEX_CHARS);
  assertEquals(actual, expected);
});

Deno.test("latexEscapeCharsInObject - handles nested objects", function () {
  const input = {
    text: "Outer &",
    nested: {
      text: "Inner %",
    },
  };
  const expected = {
    text: "Outer \\&",
    nested: {
      text: "Inner \\%",
    },
  };
  const actual = latexEscapeCharsInObject(input, LATEX_CHARS);
  assertEquals(actual, expected);
});

Deno.test("latexEscapeCharsInObject - handles arrays", function () {
  const input = {
    items: ["Item &", "Item %"],
  };
  const expected = {
    items: ["Item \\&", "Item \\%"],
  };
  const actual = latexEscapeCharsInObject(input, LATEX_CHARS);
  assertEquals(actual, expected);
});

Deno.test("latexEscapeCharsInObject - preserves non-string values", function () {
  const input = {
    text: "Text &",
    number: 42,
    boolean: true,
    nullValue: null,
    undefinedValue: undefined,
  };
  const expected = {
    text: "Text \\&",
    number: 42,
    boolean: true,
    nullValue: null,
    undefinedValue: undefined,
  };
  const actual = latexEscapeCharsInObject(input, LATEX_CHARS);
  assertEquals(actual, expected);
});

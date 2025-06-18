# rezzy

AI powered resume and cover letter generator that works with JSON Resume and PDF documents.

## Resume Generation
Converts JSON Resume or PDF documents to LaTeX and optionally uses OpenAI to build a LaTeX cover letter using your resume and the supplied job description text file.

```
Usage: deno task rezzy [OPTIONS]... 

Description:
  rezzy - an AI powered resume and cover letter generator.

Options:
  --resume          JSON Resume file path or URL
  --document        PDF document file path (alternative to --resume)
  --jd              Job description path to .txt file
  --prompt          Optional AI prompt for cover letter generation 

Examples:
  deno task rezzy --resume ../resume.json
  deno task rezzy --document ../resume.pdf
  deno task rezzy --resume ../resume.json --jd ../jobs/job-desc.txt 
  deno task rezzy --document ../resume.pdf --jd ../jobs/job-desc.txt 
  deno task rezzy --resume https://www.example.com/resume.json --jd ../jobs/job-desc.txt 
  deno task rezzy --resume ../resume.json --jd ../jobs/job-desc.txt --prompt "Add bullet points to my cover letter describing why I am a good candidate for this job description"
```
> ⚠️ **Note**: rezzy currently renders JSON Resume `interests` array items as the `Areas of Expertise` section.

## Document Conversion
When using the `--document` option with a PDF document, rezzy will:
1. Upload the PDF document directly to OpenAI
2. Use OpenAI's vision capabilities to extract and structure information
3. Process the extracted information according to the JSON Resume schema
4. Save the converted JSON alongside the original document
5. Generate the LaTeX resume from the converted JSON

> ⚠️ **Note**: Currently, only PDF files are supported for document processing with OpenAI.

The conversion process uses OpenAI to intelligently extract and structure information from the document text, according to the JSON Resume schema. This approach provides accurate results while avoiding compatibility issues with different document formats.

### Error Handling
The document processing system includes error handling with detailed logging:

1. If the OpenAI processing fails, an error is thrown with information about the failure
2. Detailed logging is provided throughout the process to help diagnose any issues
3. The intermediate JSON representation is saved to a file with a timestamp for reference

## Environment Setup

To use rezzy, you need to set up the following environment variables:

```bash
# Required for OpenAI integration
export OPENAI_API_KEY=your_api_key_here
export OPENAI_MODEL=gpt-4-turbo  # Or another compatible model
```

### Supported OpenAI Models

The following OpenAI models are known to work with rezzy:
- gpt-4-turbo
- gpt-4-turbo-preview
- gpt-4
- gpt-4-32k
- gpt-3.5-turbo
- gpt-3.5-turbo-16k
- gpt-4o
- gpt-4o-mini

If you encounter a "403 Forbidden" error, it may be because:
1. Your API key is invalid or expired
2. Your API key doesn't have permission to use the specified model
3. The model specified in OPENAI_MODEL environment variable is not available

## Testing

Tests are organized in a dedicated `test/` directory that mirrors the structure of the `src/` directory:

```
test/
├── latex_test.ts
├── main_test.ts
├── test_utils.ts
├── renderers/
│   └── latex_cover_letter_renderer_test.ts
├── repos/
│   ├── document_repo_test.ts
│   ├── openai_repo_test.ts
│   └── resume_repo_test.ts
└── utils/
    └── openai_utils_test.ts
```

### Running Tests

To run all tests:

```bash
deno task test
```

This will run all tests in the `test/` directory with the necessary permissions.

### Writing Tests

When adding new functionality, please add corresponding tests in the appropriate location in the `test/` directory. Tests should be named with the `_test.ts` suffix and should import the functions they're testing from the `src/` directory.

For example, to test a function in `src/utils/example.ts`, create a file `test/utils/example_test.ts` with the following structure:

```typescript
import { assertEquals } from "@std/assert";
import { functionToTest } from "../../src/utils/example.ts";

Deno.test("functionToTest - description of test case", () => {
  const result = functionToTest(input);
  assertEquals(result, expectedOutput);
});
```

## Dependencies
 - OpenAI - https://openai.com/
 - TypeChat - https://microsoft.github.io/TypeChat/
 - deno - https://deno.com/
 - Zod - https://zod.dev
 - JSON Resume - https://jsonresume.org/
 - PDF.js - https://mozilla.github.io/pdf.js/ (for PDF parsing)
 - Overleaf - https://www.overleaf.com/ (or bring your own other LaTeX compiler)

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
  -o, --output      Output file path for LaTeX (default: based on input filename)
  --help            Display this help message

Examples:
  deno task rezzy --resume ../resume.json
  deno task rezzy --document ../resume.pdf
  deno task rezzy --resume ../resume.json --jd ../jobs/job-desc.txt 
  deno task rezzy --document ../resume.pdf --jd ../jobs/job-desc.txt 
  deno task rezzy --resume https://www.example.com/resume.json --jd ../jobs/job-desc.txt 
  deno task rezzy --resume ../resume.json --jd ../jobs/job-desc.txt --prompt "Add bullet points to my cover letter describing why I am a good candidate for this job description"
  deno task rezzy --resume ../resume.json -o my_custom_output
```
> ⚠️ **Note**: rezzy currently renders JSON Resume `interests` array items as the `Areas of Expertise` section.

## Output Options

Rezzy generates two separate output files:
1. A resume file with the suffix `_resume.tex`
2. A cover letter file with the suffix `_cover.tex` (when a job description is provided)

By default, the base filename is derived from the input file. For example:
- If you use `--resume my_resume.json`, the outputs will be `my_resume_resume.tex` and `my_resume_cover.tex`
- If you use `--document my_resume.pdf`, the outputs will be `my_resume_resume.tex` and `my_resume_cover.tex`

You can specify a custom base output path using the `-o` or `--output` option:
```bash
deno task rezzy --resume my_resume.json -o custom_output
```

This will generate `custom_output_resume.tex` and `custom_output_cover.tex` (if a cover letter is generated).

The application only writes informational logging messages to the console, while the actual LaTeX content is written to the output files.

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
├── unit/                  # Unit tests for individual components
│   ├── latex_test.ts
│   ├── main_test.ts
│   ├── test_utils.ts
│   ├── renderers/
│   │   └── latex_cover_letter_renderer_test.ts
│   ├── repos/
│   │   ├── document_repo_test.ts
│   │   ├── openai_repo_test.ts
│   │   └── resume_repo_test.ts
│   └── utils/
│       └── openai_utils_test.ts
└── regression/            # Regression tests for end-to-end workflows
    ├── resume_generation_test.ts
    ├── cover_letter_generation_test.ts
    ├── document_processing_test.ts
    └── environment_validation_test.ts
```

### Running Tests

To run all tests:

```bash
deno task test
```

### Test Types

The project includes two types of tests:

1. **Unit Tests**: Located in the `test/unit/` directory, these tests verify the behavior of individual components in isolation. They use mocks and stubs to avoid dependencies on external services.

2. **Regression Tests**: Located in the `test/regression/` directory, these tests verify workflows and ensure that previously fixed bugs don't reappear. They test the integration between components and ensure the application handles edge cases correctly. These tests use mocks for external services like OpenAI to make them fast, reliable, and free to run.

The regression tests cover the following areas:
- Resume generation from JSON data
- Cover letter generation and integration with resume data
- Document processing with OpenAI (using mocks)
- Environment variable validation

### End-to-End Testing

While the regression tests provide good coverage of the application's functionality, they don't test the actual integration with external services like OpenAI. For true end-to-end testing, you would need to make actual API calls to OpenAI, which has some considerations:

- **Cost**: OpenAI API calls are not free and will incur charges
- **Rate Limits**: You may hit rate limits if running many tests
- **API Keys**: You need valid API keys with appropriate permissions
- **Reliability**: Tests may fail due to service disruptions or changes in the API

If you want to perform end-to-end testing with real OpenAI API calls, you can create custom test scripts that:

1. Set up the necessary environment variables (API keys, models, etc.)
2. Make actual API calls to OpenAI
3. Verify the results

These tests should be run manually and infrequently, such as before major releases or when significant changes are made to the OpenAI integration code.

The project includes example end-to-end tests in the `test/end_to_end/` directory:

- `cover_letter_generation_e2e_test.ts`: Tests the cover letter generation with real OpenAI API calls
- `document_processing_e2e_test.ts`: Tests the document processing with real OpenAI API calls

These tests are ignored by default to prevent accidental API calls. To run them:

```bash
# Set up environment variables
export OPENAI_API_KEY=your_actual_api_key
export OPENAI_MODEL=gpt-4-turbo
export OPENAI_VISION_MODEL=gpt-4o

# For cover letter generation test
deno test --allow-env --allow-net test/end_to_end/cover_letter_generation_e2e_test.ts

# For document processing test (requires a test PDF file)
deno test --allow-env --allow-read --allow-write --allow-net test/end_to_end/document_processing_e2e_test.ts
```

You'll need to edit the test files to:
1. Set `ignore: false` to enable the test
2. For document processing, update the `TEST_PDF_PATH` to point to a real PDF resume

To run all tests in the `test/` directory with the necessary permissions:

```bash
deno task test
```

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

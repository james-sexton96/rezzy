# rezzy

AI powered JSON Resume to LaTeX resume and cover letter generator.

## Resume Generation
Converts JSON Resume to LaTeX and optionally uses OpanAI to build LaTeX cover letter using your JSON Resume and the supplied job description text file

```
Usage: deno task rezzy [OPTIONS]... 

Description:
  rezzy - an AI powered JSON Resume to LaTeX resume and cover letter generator.

Options:
  --resume          Json Resume file path or url
  --jd              Job description path to .txt file
  --prompt          Optional AI prompt for cover letter generation 

Examples:
  deno task rezzy --resume ../resume.json
  deno task rezzy --resume ../resume.json --jd ../jobs/job-desc.txt 
  deno task rezzy --resume https://www.example.com/resume.json --jd ../jobs/job-desc.txt 
  deno task rezzy --resume ../resume.json --jd ../jobs/job-desc.txt --prompt "Add bullet points to my cover letter describing why I am a good candidate for this job description"
```
> ⚠️ **Note**: rezzy currently renders JSON Resume `interests` array items as the `Areas of Expertise` section.

## Dependencies
 - OpenAI - https://openai.com/
 - TypeChat - https://microsoft.github.io/TypeChat/
 - deno - https://deno.com/
 - Zod - https://zod.dev
 - JSON Resume - https://jsonresume.org/
 - Overleaf - https://www.overleaf.com/ (or bring your own other LaTeX compiler)

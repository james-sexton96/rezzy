# rezzy

AI powered JSON Resume to LaTeX resume and cover letter generator.

https://jsonresume.org/ - JSON Resume Schema

https://www.overleaf.com/ - Compatible LaTeX pdf generator


## Resume Generation
Converts JSON Resume to LaTeX

```
deno task rezzy --source <JSON Resume path or url>
```
> ⚠️ **Note**: rezzy currently renders JSON Resume `interests` array items as the `Areas of Expertise` section.

## Cover Letter Generation
Uses OpanAI to build LaTeX cover letter using your JSON Resume and the supplied job description url

```
deno task cover  --source <JSON Resume path or url> --jd <job description url>
```

## Dependencies
 - OpenAI - https://openai.com/
 - TypeChat - https://microsoft.github.io/TypeChat/
 - deno - https://deno.com/
 - Zod - https://zod.dev
 - JSON Resume - https://jsonresume.org/
 - Overleaf - https://www.overleaf.com/ (or bring your own other LaTeX compiler)

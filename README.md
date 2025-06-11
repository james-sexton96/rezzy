# rezzy

AI powered JSON Resume to LaTeX resume and cover letter generator.

## Resume Generation
Converts JSON Resume to LaTeX

```
deno task rezzy --source <JSON Resume path or url>
```


## Cover Letter Generation
Uses OpanAI to build LaTeX cover letter using your JSON Resume and the supplied job description url

```
deno task cover  --source <JSON Resume path or url> --jd <job description url>
```

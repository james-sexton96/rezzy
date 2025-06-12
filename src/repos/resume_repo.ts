import { ResumeSchema } from "npm:@kurone-kito/jsonresume-types@0.4.0";

export async function fetchResume(source: string): Promise<ResumeSchema> {
  if (source.startsWith("http")) {
    const response = await fetch(source);
    if (!response.ok) throw new Error(response.statusText);
    return response.json();
  } else {
    return JSON.parse(await Deno.readTextFile(source));
  }
}

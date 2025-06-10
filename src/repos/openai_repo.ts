import OpenAI from "openai";
const client = new OpenAI();

export function getResponse(input: string): Promise<string> {
  return client.responses.create({ input, model: "gpt-4.1" }).then((resp) =>
    resp.output_text
  );
}

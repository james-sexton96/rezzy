
export function logTempFile(prefix: string, data: string): void {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  Deno.writeTextFileSync(`/tmp/${prefix}_${timestamp}.txt`, data);
}

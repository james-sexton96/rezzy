
export function logTempFile(prefix: string, data: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const path = `/tmp/${prefix}_${timestamp}.txt`
  Deno.writeTextFileSync(path, data);
  return path;
}

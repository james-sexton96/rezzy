/**
 * Utility functions for testing
 */

/**
 * Mocks environment variables for testing
 * @param envVars The environment variables to mock
 * @param testFn The test function to run with the mocked environment variables
 * @returns A promise that resolves when the test function completes
 */
export async function withMockEnv<T>(
  envVars: Record<string, string>,
  testFn: () => Promise<T>,
): Promise<T> {
  // Save original methods
  const originalGet = Deno.env.get;
  const originalToObject = Deno.env.toObject;

  // Mock methods
  // @ts-ignore - We're monkey patching Deno.env methods
  Deno.env.get = (key: string) => envVars[key];
  // @ts-ignore - We're monkey patching Deno.env methods
  Deno.env.toObject = () => ({ ...envVars });

  try {
    // Run the test function with mocked environment
    return await testFn();
  } finally {
    // Restore original methods
    // @ts-ignore - We're restoring the original methods
    Deno.env.get = originalGet;
    // @ts-ignore - We're restoring the original methods
    Deno.env.toObject = originalToObject;
  }
}

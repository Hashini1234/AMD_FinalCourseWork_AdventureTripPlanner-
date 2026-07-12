// Simulates real network latency so loading states (skeletons, spinners) are
// visible during the viva demo, matching the coursework's requirement for
// "efficient asynchronous handling (loading/error)".
export function networkDelay(ms = 450): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MockApiError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.code = code;
  }
}

import { z } from 'zod';

export const MSW_SCENARIO_HEADER = 'x-msw-scenario';

const mockScenarioSchema = z.enum([
  'success',
  'delay',
  'empty',
  'empty-products',
  'server-error',
  'network-error',
  'invalid-response',
  'conflict',
  'changed-price',
  'changed-availability',
  'facets',
]);

export type MockScenario = z.infer<typeof mockScenarioSchema>;

export function getMockScenario(request: Request): MockScenario {
  const result = mockScenarioSchema.safeParse(
    request.headers.get(MSW_SCENARIO_HEADER) ?? 'success',
  );

  return result.success ? result.data : 'success';
}

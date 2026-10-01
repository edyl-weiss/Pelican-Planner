import { z } from 'zod';
import { runSchema, type RunState } from './state';
export const savedRecordSchema = z.object({
  state: runSchema,
  backup: runSchema.nullable(),
  revision: z.number().int().min(1).max(2_000_000_000),
  updated: z.string().datetime(),
});
export type SavedRecord = z.infer<typeof savedRecordSchema>;
export function nextSavedRecord(current: SavedRecord | null, state: RunState, expectedRevision: number): SavedRecord {
  if ((current?.revision ?? 0) !== expectedRevision) throw new Error('Save revision conflict.');
  return savedRecordSchema.parse({ state, backup: current?.state ?? null, revision: expectedRevision + 1, updated: new Date().toISOString() });
}

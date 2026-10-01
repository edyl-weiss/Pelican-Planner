import {z} from 'zod';
import {runSchema,type RunState} from './state';

export const preferencesSchema=z.object({locale:z.enum(['en','zh-CN']),effects:z.boolean(),taskLimit:z.union([z.literal(3),z.literal(5),z.literal(99)])});
export type JournalPreferences=z.infer<typeof preferencesSchema>;
export const backupSchema=z.object({app:z.literal('stardew-farm-journal'),backupVersion:z.literal(1),exportedAt:z.string().datetime(),run:runSchema,preferences:preferencesSchema});
export function createJournalBackup(run:RunState,preferences:JournalPreferences){
 return backupSchema.parse({app:'stardew-farm-journal',backupVersion:1,exportedAt:new Date().toISOString(),run,preferences});
}
export function readJournalBackup(text:string):{run:RunState;preferences?:JournalPreferences;exportedAt?:string}{
 if(text.length>20000000)throw new Error('Choose a save smaller than 20 MB.');
 let value:unknown;try{value=JSON.parse(text);}catch{throw new Error('That file could not be read. Choose a journal JSON backup and try again.');}
 if(value&&typeof value==='object'&&('app' in value||'backupVersion' in value)){
  const envelope=value as Record<string,unknown>;
  if(envelope.app!=='stardew-farm-journal')throw new Error('That backup belongs to a different app. Choose a Farm Journal backup.');
  if(envelope.backupVersion!==1)throw new Error('This backup needs a newer version of the journal. Update the site, then try again.');
  const backup=backupSchema.parse(value);return {run:backup.run,preferences:backup.preferences,exportedAt:backup.exportedAt};
 }
 // Backups downloaded before portable preferences were added remain supported.
 return {run:runSchema.parse(value)};
}

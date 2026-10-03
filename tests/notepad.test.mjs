import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const component=readFileSync(new URL('../app/planner-notepad.tsx',import.meta.url),'utf8');
const journal=readFileSync(new URL('../app/farm-journal.tsx',import.meta.url),'utf8');
const css=readFileSync(new URL('../app/valley-theme.css',import.meta.url),'utf8');

assert.match(component,/pelican-planner-notepad-chunks-v2/,'chunked notes use a dedicated localStorage key');
assert.match(component,/LEGACY_NOTES_KEY/,'legacy freeform notes are migrated');
assert.match(component,/JSON\.stringify\(next\)/,'note chunks persist locally');
assert.match(component,/contextmenu/,'selected text supports a right-click action');
assert.match(component,/Save to Notepad/,'context action is clearly labelled');
assert.match(component,/addChunk\(text,'selection'\)/,'highlighted text is stored as its own selection chunk');
assert.match(component,/event\.key==='Enter'&&!event\.shiftKey/,'Enter saves a manual note chunk');
assert.match(component,/event\.shiftKey/,'Shift+Enter remains available for a line break');
assert.match(component,/notepad-instructions/,'concise notepad instructions are shown');
assert.match(component,/notepad-chunk-delete/,'every chunk has an independent delete control');
assert.match(component,/removeChunk/,'individual chunks can be removed');
assert.match(journal,/PlannerNotepad/,'notepad is mounted in the planner shell');
assert.match(journal,/planner-workspace/,'planner has a desktop sidebar workspace');
assert.match(css,/grid-template-columns:250px minmax\(0,1240px\)/,'desktop notes sit to the left of the planner');
assert.match(css,/notepad-mobile-toggle/,'smaller screens get a non-crushing notes drawer control');
assert.match(css,/\.planner-notepad\{[\s\S]*?backdrop-filter:blur\((?:[6-9]|1\d)px\)/,'notepad uses a soft translucent blur');
assert.match(css,/Softer translucent panels/,'planner panels have a desktop transparency pass');

assert.match(component,/HIDDEN_KEY/,'notepad hidden state is stored locally');
assert.match(component,/ChevronLeft/,'desktop notepad uses an arrow hide control');
assert.match(css,/true ruled-paper lines/,'notepad uses lined-paper styling');
assert.match(css,/overflow-y:auto/,'long notepad content scrolls vertically inside the panel');
assert.match(css,/height:min\(760px,calc\(100vh - 28px\)\)/,'desktop notepad has a bounded scrollable height');
console.log('notepad chunk tests passed');

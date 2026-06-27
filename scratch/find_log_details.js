import fs from 'fs';
import path from 'path';

const transcriptPath = '/Users/bittu/.gemini/antigravity-ide/brain/6876bff9-8869-4dbf-95e0-407a857c03aa/.system_generated/logs/transcript_full.jsonl';
const content = fs.readFileSync(transcriptPath, 'utf-8');
const lines = content.split('\n');

for (let line of lines) {
  if (line.includes('C7ECF203D6DB2E492CF6B8CF8B7AD031') && line.includes('capture_browser_console_logs')) {
    console.log("--- FOUND CONSOLE LOG STEP ---");
    const data = JSON.parse(line);
    console.log("type:", data.type);
    console.log("status:", data.status);
    console.log("Content around console logs:");
    // Let's print the entire content of the line, but sliced if too large
    console.log(data.content ? data.content.substring(0, 4000) : 'null');
  }
}

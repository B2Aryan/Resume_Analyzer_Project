import fs from 'fs';
import path from 'path';

const transcriptPath = '/Users/bittu/.gemini/antigravity-ide/brain/6876bff9-8869-4dbf-95e0-407a857c03aa/.system_generated/logs/transcript_full.jsonl';
const content = fs.readFileSync(transcriptPath, 'utf-8');
const lines = content.split('\n');

for (let line of lines) {
  if (!line.trim()) continue;
  try {
    const data = JSON.parse(line);
    if (line.includes('browser_subagent') && data.status === 'DONE') {
      console.log("--- MATCH ---");
      console.log("type:", data.type);
      console.log("keys:", Object.keys(data));
      if (data.type === 'BROWSER_SUBAGENT') {
        console.log("content starts with:", data.content ? data.content.substring(0, 300) : 'null');
      }
    }
  } catch (e) {
    // Ignore
  }
}

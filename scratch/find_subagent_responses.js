import fs from 'fs';
import path from 'path';

const transcriptPath = '/Users/bittu/.gemini/antigravity-ide/brain/6876bff9-8869-4dbf-95e0-407a857c03aa/.system_generated/logs/transcript_full.jsonl';
const content = fs.readFileSync(transcriptPath, 'utf-8');
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (!line.trim()) continue;
  try {
    const data = JSON.parse(line);
    if (data.type === 'BROWSER_SUBAGENT') {
      console.log(`Line ${i}: BROWSER_SUBAGENT content keys:`, Object.keys(data));
      // Print the content field completely or in parts
      console.log(data.content);
    }
  } catch (e) {
    // Ignore
  }
}

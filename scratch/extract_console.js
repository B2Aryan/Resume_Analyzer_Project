import fs from 'fs';
import path from 'path';

const transcriptPath = '/Users/bittu/.gemini/antigravity-ide/brain/6876bff9-8869-4dbf-95e0-407a857c03aa/.system_generated/logs/transcript_full.jsonl';
if (!fs.existsSync(transcriptPath)) {
  console.log("No transcript_full.jsonl found at:", transcriptPath);
  process.exit(0);
}

const lines = fs.readFileSync(transcriptPath, 'utf-8').split('\n');
console.log(`Read ${lines.length} lines.`);

// Let's find console logs
for (let line of lines) {
  if (!line.trim()) continue;
  try {
    const data = JSON.parse(line);
    // Let's look for Step 112 or Step 102 or anything in tool calls
    if (data.type === 'PLANNER_RESPONSE') {
      // Let's look inside tool calls or response
      const toolCalls = data.tool_calls;
      if (toolCalls) {
        for (let call of toolCalls) {
          if (call.name === 'browser_subagent') {
            console.log("Found browser_subagent tool call!");
          }
        }
      }
    }
    if (data.type === 'BROWSER_SUBAGENT' || data.content?.includes('Step 112: capture_browser_console_logs')) {
      const content = data.content || '';
      console.log("Found match!");
      const step112Idx = content.indexOf('Step 112: capture_browser_console_logs');
      if (step112Idx !== -1) {
        console.log(content.substring(step112Idx, step112Idx + 3000));
      } else {
        const step102Idx = content.indexOf('Step 102: capture_browser_console_logs');
        if (step102Idx !== -1) {
          console.log(content.substring(step102Idx, step102Idx + 3000));
        } else {
          console.log(content.substring(0, 1000));
        }
      }
    }
  } catch (e) {
    // Ignore invalid JSON lines
  }
}

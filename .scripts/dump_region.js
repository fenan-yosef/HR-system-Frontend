const fs = require('fs');
const path = 'e:/Projects/HR-system-Frontend/features/recruitment/components/JobPositionManager.tsx';
const s = fs.readFileSync(path, 'utf8');
const lines = s.split(/\r?\n/);
const start = 440;
const end = 468;
for (let i = start; i <= end && i < lines.length; i++) {
  const ln = lines[i-1];
  const codes = Array.from(ln).map(c => c.charCodeAt(0));
  console.log(`${i}: ${ln}`);
  console.log('codes:', codes.join(','));
}

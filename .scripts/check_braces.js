const fs = require('fs');
const path = 'e:/Projects/HR-system-Frontend/features/recruitment/components/JobPositionManager.tsx';
const s = fs.readFileSync(path, 'utf8');
const counts = {
  openCurly: (s.match(/{/g) || []).length,
  closeCurly: (s.match(/}/g) || []).length,
  openParen: (s.match(/\(/g) || []).length,
  closeParen: (s.match(/\)/g) || []).length,
  openAngle: (s.match(/</g) || []).length,
  closeAngle: (s.match(/>/g) || []).length,
};
console.log(JSON.stringify(counts, null, 2));

const fs=require('fs');
const p='e:/Projects/HR-system-Frontend/features/recruitment/components/JobPositionManager.tsx';
const s=fs.readFileSync(p,'utf8');
const lines=s.split(/\r?\n/);
for(let i=0;i<lines.length-1;i++){
  if(lines[i].trim()==='};' && lines[i+1].trim()==='}'){
    console.log('Found at lines',i+1,i+2);
    console.log('Line',i+1,':',lines[i]);
    console.log('Line',i+2,':',lines[i+1]);
  }
}

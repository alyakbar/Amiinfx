const { spawnSync } = require('child_process');
const fs = require('fs');

console.log('Running jest...');
const args = [
  'jest',
  '--json',
  '--outputFile=jest-result.json',
  '--runInBand',
];

const result = spawnSync('npx', args, { stdio: 'inherit', shell: true });

if (result.error) {
  console.error('Failed to run jest:', result.error);
  process.exit(2);
}

if (result.status !== 0) {
  console.log('Jest exited with status', result.status);
}

if (fs.existsSync('jest-result.json')) {
  console.log('Wrote jest-result.json');
} else {
  console.error('jest-result.json not found');
  process.exit(3);
}

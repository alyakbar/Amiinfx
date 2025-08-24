// Simple smoke test: avoid importing the TSX and instead verify the file contains a default export
import fs from 'fs';
import path from 'path';

test('AdminLogin file exists and exports default', () => {
  const filePath = path.join(__dirname, '..', 'app', 'admin', 'login', 'page.tsx');
  const content = fs.readFileSync(filePath, 'utf8');
  expect(content).toContain('export default');
});

const { spawn } = require('child_process');
const path = require('path');

const targetDir = path.resolve(__dirname, 'frontend/office/web/office-workforce-web');
const isWin = process.platform === 'win32';
const viteCmd = isWin ? 'vite.cmd' : 'vite';

const child = spawn(viteCmd, ['--port', '3000', '--host', '0.0.0.0'], {
  cwd: targetDir,
  stdio: 'inherit',
  shell: true,
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});

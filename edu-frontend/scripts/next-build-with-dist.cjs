const { spawn } = require('node:child_process')

const command = process.platform === 'win32' ? 'node.exe' : 'node'
const args = [require.resolve('next/dist/bin/next'), 'build']

const child = spawn(command, args, {
  stdio: 'inherit',
  env: {
    ...process.env,
    NEXT_DIST_DIR: '.next-build',
  },
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }

  process.exit(code ?? 1)
})

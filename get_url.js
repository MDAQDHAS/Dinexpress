const { spawn } = require('child_process');

const expo = spawn('npx.cmd', ['expo', 'start', '--tunnel'], {
  env: { ...process.env, CI: '1' },
});

expo.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output);
  if (output.includes('exp://')) {
    process.exit(0);
  }
});

expo.stderr.on('data', (data) => {
  console.error(data.toString());
});

setTimeout(() => {
  console.log('Timeout');
  process.exit(1);
}, 60000);

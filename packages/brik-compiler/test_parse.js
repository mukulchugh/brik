const { compileFiles } = require('./dist/index.js');
compileFiles({ projectRoot: process.cwd(), entries: ['test_jsx.tsx'] })
  .then(console.log)
  .catch(console.error);

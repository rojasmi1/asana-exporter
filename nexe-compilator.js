var nexe = require('nexe');

nexe.compile({
  input: 'index.js', // where the input file is
  output: 'nexe^$', // where to output the compiled binary
  nodeVersion: '6.3.0', // node version
  nodeTempDir: 'dist', // where to store node source.
  nodeConfigureArgs: ['opt', 'val'], // for all your configure arg needs.
  framework: "node", // node, nodejs, or iojs
  browserifyExcludes: ['try-thread-sleep']
}, function(err) {
  if(err) {
    return console.log(err);
  }
});

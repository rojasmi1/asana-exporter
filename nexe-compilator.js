var nexe = require('nexe');
var ncp = require('ncp');

nexe.compile({
  input: 'index.js', // where the input file is
  output: 'dist/asana-exporter/asana-exporter.exe', // where to output the compiled binary
  nodeVersion: '6.3.0', // node version
  nodeTempDir: 'temp', // where to store node source.
  nodeConfigureArgs: ['opt', 'val'], // for all your configure arg needs.
  framework: "node", // node, nodejs, or iojs
  browserifyExcludes: ['try-thread-sleep','ncp','nexe']
}, function(err) {
  if(err) {
    return console.log(err);
  }else{
    ncp.limit = 8;
    ncp('key_manager','dist/asana-exporter/key_manager',function(ncpError){
      if(ncpError){
        return console.error(ncpError);
      }
      console.log('Distributable generated successfully.');
    });
  }
});

const http = require('http');
require('./server.js');
console.log('Server started, waiting 6s...');
setTimeout(() => {
  console.log('Making request...');
  http.get('http://localhost:3000/stream/movie/tt0137523.json', (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      console.log('Body length:', data.length);
      try {
        const j = JSON.parse(data);
        console.log('Streams:', j.streams ? j.streams.length : 0);
      } catch(e) {
        console.log('Parse error:', e.message);
        console.log('Body preview:', data.substring(0, 300));
      }
      process.exit(0);
    });
  }).on('error', e => {
    console.log('Request error:', e.message);
    process.exit(1);
  });
}, 6000);

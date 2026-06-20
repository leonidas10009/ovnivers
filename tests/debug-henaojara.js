var u = require('../src/local-scrapers/utils');
var $ = require('cheerio-without-node-native');

async function main() {
  // 1. Fetch anime page
  console.log('=== Henaojara anime page ===');
  var h = await u.fetchText('https://henaojara.com/anime/naruto');
  if (!h) { console.log('BLOCKED - trying episode page'); 
    h = await u.fetchText('https://henaojara.com/ver/naruto-1');
    if (!h) { console.log('Both blocked'); return; }
    console.log('Episode page:', h.length, 'b');
  } else {
    console.log('Anime page:', h.length, 'b');
  }
  
  // 2. Find episode links
  var epLinks = h.match(/\/ver\/[^"'\s]+/gi) || [];
  console.log('/ver/ links:', epLinks.length);
  epLinks.slice(0, 10).forEach(function(e) { console.log('  ' + e); });
  
  // 3. Find server patterns
  var patterns = ['enlaces', 'servers', 'servidor', 'playVideo', 'onclick', 'iframe', 'embed', 
    'data-url', 'data-src', 'var videos', 'var servers', 'const enlaces', 'reproductor',
    'lista-server', 'logo-list', 'nombre-server'];
  patterns.forEach(function(p) {
    var m = h.match(new RegExp(p, 'gi')) || [];
    if (m.length > 0) console.log(p + ': ' + m.length + ' matches');
  });
  
  // 4. If episode links found, fetch first one
  if (epLinks.length > 0) {
    var epUrl = epLinks[0];
    if (!epUrl.startsWith('http')) epUrl = 'https://henaojara.com' + epUrl;
    console.log('\n=== Episode page: ' + epUrl + ' ===');
    var epHtml = await u.fetchText(epUrl);
    if (epHtml) {
      console.log('HTML:', epHtml.length, 'b');
      console.log('iframes:', (epHtml.match(/<iframe/gi) || []).length);
      console.log('onclick:', (epHtml.match(/onclick/gi) || []).length);
      console.log('playVideo:', (epHtml.match(/playVideo/gi) || []).length);
      
      // Check for server list
      var logoList = epHtml.match(/id="logo-list"[\s\S]{0,1000}/i);
      if (logoList) console.log('logo-list found:\n' + logoList[0].substring(0, 500));
      
      // Check for enlaces array
      var enlaces = epHtml.match(/const\s+enlaces\s*=\s*(\[[\s\S]*?\]);/);
      if (enlaces) console.log('enlaces array:', enlaces[1]);
      
      var serverSection = epHtml.match(/reproductor[\s\S]{0,2000}/gi);
      if (serverSection) console.log('\nReproductor section:\n' + serverSection[0].substring(0, 800));
      
      // Show first 2000 chars
      console.log('\nFirst 2000 chars:\n' + epHtml.substring(0, 2000));
    }
  }
}

main().catch(console.error);

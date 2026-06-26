const https = require('https');
const u = 'https://multiplayer.streamhj.top/player/multiplayer/embed.php?idanime=2087&idcapitulo=1';
https.get(u, { headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://animejara.com/' } }, r => {
  let d = '';
  r.on('data', c => d += c);
  r.on('end', () => {
    console.log('Size:', d.length);

    const onclickMatches = d.match(/onclick="[^"]{10,200}"/gi) || [];
    console.log('onclick handlers:', onclickMatches.length);
    onclickMatches.slice(0, 5).forEach(x => console.log(' ', x.slice(0, 150)));

    console.log('\nServer URLs:');
    const urls = d.match(/https?:\/\/[^"'\\s<>]{10,200}/g) || [];
    const serverDomains = /streamwish|filemoon|uqload|dood|mixdrop|voe|mp4upload|streamtape|yourupload|ok\.ru|mega|mediafire|hqq|netu|swhoi|burstcloud|sbembed|fembed|upstream/i;
    urls.filter(x => serverDomains.test(x)).slice(0, 10).forEach(x => console.log(' ', x.slice(0, 100)));

    // Check how the server URLs are embedded (look for pattern around them)
    const hqq = d.indexOf('hqq.tv');
    if (hqq > -1) console.log('\nHQQ context:', d.slice(hqq - 50, hqq + 100));

    const mega = d.indexOf('mega.nz');
    if (mega > -1) console.log('MEGA context:', d.slice(mega - 50, mega + 100));
  });
}).on('error', e => console.error(e));

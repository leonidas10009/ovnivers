const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
async function get(url, ref) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA, 'Referer': ref || url }, signal: AbortSignal.timeout(15000) });
    return res.ok ? await res.text() : null;
  } catch { return null; }
}

(async () => {
  // Try direct download page for Streamwish
  const dl = await get('https://sfastwish.com/dl?op=download_orig&id=0ky0tsum7i06', 'https://sfastwish.com/e/0ky0tsum7i06');
  if (dl) {
    // Look for any m3u8/mp4 URL or base64
    const urls = dl.match(/https?:\/\/[^\s"']+\.(m3u8|mp4)[^\s"']*/gi) || [];
    console.log('Streamwish dl page URLs:', urls.length);
    for (const u of urls) console.log('  ' + u);
    
    // Look for data-src or href with file
    const dataUrls = dl.match(/(?:href|src|data-file|data-url)\s*=\s*["']([^"']+)["']/gi) || [];
    console.log('Data URLs:', [...new Set(dataUrls)].slice(0, 5));
    
    // Check for form actions or download links
    const forms = dl.match(/<form[^>]*action="([^"]+)"[^>]*>/gi) || [];
    console.log('Forms:', forms);
    
    // Show the form area
    const formIdx = dl.indexOf('<form');
    if (formIdx >= 0) console.log('Form area:', dl.substring(formIdx, formIdx+500));
  }
})();

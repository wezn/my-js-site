async function scanSite() {
  const url = document.getElementById("url").value.trim();
  const result = document.getElementById("result");
  result.innerHTML = `<p>This tool cannot scan remote sites due to browser security (CORS). It will only analyze the current page (this scanner itself).</p>`;
  try {
    const allScripts = document.querySelectorAll("script");
    const allImages = document.querySelectorAll("img");
    const forms = document.querySelectorAll("form");
    const buttons = document.querySelectorAll("button");
    const metas = document.querySelectorAll("meta");

    const stats = {
      scannedAt: new Date().toLocaleString(),
      url: window.location.href,
      title: document.title,
      metaTags: Array.from(metas).map(m => ({ name: m.getAttribute('name') || m.getAttribute('property'), content: m.getAttribute('content') })),
      favicon: document.querySelector("link[rel~='icon']")?.href || "Not found",
      doctype: document.doctype?.name || "Unknown",
      charset: document.characterSet,
      lang: document.documentElement.lang,
      contentLengthEstimate: document.documentElement.outerHTML.length,
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      language: navigator.language,
      cookiesEnabled: navigator.cookieEnabled,
      performanceTiming: window.performance.timing.toJSON(),
      totalElements: document.getElementsByTagName("*").length,
      headings: Array.from(document.querySelectorAll("h1,h2,h3,h4,h5,h6")).map(h => h.tagName),
      divs: document.querySelectorAll("div").length,
      paragraphs: document.querySelectorAll("p").length,
      forms: forms.length,
      buttons: buttons.length,
      totalScripts: allScripts.length,
      inlineScripts: Array.from(allScripts).filter(s => !s.src).length,
      externalScripts: Array.from(allScripts).filter(s => s.src).map(s => s.src),
      totalStylesheets: document.querySelectorAll("link[rel='stylesheet']").length,
      inlineStyles: document.querySelectorAll('[style]').length,
      totalImages: allImages.length,
      imagesWithoutAlt: Array.from(allImages).filter(img => !img.alt).length,
      totalLinks: document.querySelectorAll("a").length,
      externalLinks: Array.from(document.querySelectorAll("a[href]")).filter(a => a.href.startsWith("http")),
      brokenLinks: await checkBrokenLinks(),
      missingAlts: Array.from(allImages).filter(img => !img.alt).length,
      missingLabels: Array.from(forms).filter(f => f.querySelectorAll("label").length === 0).length,
      estimatedLoadTime: window.performance.timing.loadEventEnd - window.performance.timing.navigationStart + "ms"
    };

    result.innerHTML = `<h2>📊 Scan Report (Current Page Only)</h2><pre>${JSON.stringify(stats, null, 2)}</pre>`;
  } catch (err) {
    result.innerHTML = `<p style='color: red'>❌ Scan failed. This tool only scans the current page due to browser security restrictions (CORS). External URLs require a backend proxy.</p>`;
  }
}

async function checkBrokenLinks() {
  const anchors = Array.from(document.querySelectorAll("a[href]"))
    .filter(a => a.href.startsWith("http"));
  const results = [];
  for (const a of anchors.slice(0, 5)) {
    try {
      const res = await fetch("https://api.allorigins.win/raw?url=" + encodeURIComponent(a.href));
      results.push({ url: a.href, status: res.status });
    } catch {
      results.push({ url: a.href, status: "error" });
    }
  }
  return results;
}

async function bulkCheck() {
  const urls = document.getElementById("bulkUrls").value.trim().split("\n").map(u => u.trim()).filter(Boolean);
  const bulkResult = document.getElementById("bulkResult");
  bulkResult.innerHTML = "<p>⏳ Checking URLs...</p>";
  const results = [];

  for (let url of urls) {
    try {
      const res = await fetch("https://api.allorigins.win/raw?url=" + encodeURIComponent(url));
      results.push({ url, status: res.status });
    } catch (e) {
      results.push({ url, status: 'unknown (possibly CORS error or fetch blocked)' });
    }
  }

  bulkResult.innerHTML = `<h2>📦 Bulk Check Result</h2><pre>${JSON.stringify(results, null, 2)}</pre>`;
}

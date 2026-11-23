// Prints status and the security-related response headers for public (th/en/zh) and admin URLs.
// Usage: node headers-http.cjs [base]   (default http://localhost:3100)
const base = process.argv[2] || "http://localhost:3100";
const urls = ["/th", "/en", "/zh", "/th/contact", "/th/products", "/admin/login", "/admin", "/th/nonexistent-page-xyz"];
const want = ["content-security-policy-report-only", "content-security-policy", "x-content-type-options", "referrer-policy", "x-frame-options", "permissions-policy", "strict-transport-security", "cache-control"];
(async () => {
  for (const u of urls) {
    const r = await fetch(base + u, { redirect: "manual" });
    console.log(`== ${u} -> ${r.status}${r.headers.get("location") ? " location=" + r.headers.get("location") : ""}`);
    for (const h of want) console.log(`   ${h}: ${r.headers.get(h) ?? "(absent)"}`);
  }
})();

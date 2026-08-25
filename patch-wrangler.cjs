const fs = require("fs");
const path = require("path");

const wranglerPath = path.join(__dirname, ".output", "server", "wrangler.json");
if (fs.existsSync(wranglerPath)) {
  const json = JSON.parse(fs.readFileSync(wranglerPath, "utf-8"));
  json.name = "run-zone-hub";
  json.kv_namespaces = [
    {
      binding: "LEADS_KV",
      id: "ce0ec90cfcb841898cd8ac87216c7201"
    }
  ];
  fs.writeFileSync(wranglerPath, JSON.stringify(json, null, 2), "utf-8");
  console.log("[patch-wrangler] Injected LEADS_KV namespace into", wranglerPath);
} else {
  console.warn("[patch-wrangler] File not found:", wranglerPath);
}

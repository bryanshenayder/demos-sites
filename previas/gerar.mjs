// Gera as prévias: um site por arquivo em clientes/*.json. Roda no deploy da Vercel.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, cpSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";
import { pagina, privacidade } from "./assets/render.js";

const OUT = "dist";
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
cpSync("assets", `${OUT}/assets`, { recursive: true });
cpSync("gerador", `${OUT}/gerador`, { recursive: true });
const ver = createHash("md5").update(readFileSync("assets/base.css")).update(readFileSync("assets/base.js")).update(readFileSync("assets/render.js")).digest("hex").slice(0, 8);

const slugs = [];
for (const arq of readdirSync("clientes").filter((f) => f.endsWith(".json"))) {
  const slug = arq.replace(/\.json$/, "").toLowerCase().replace(/[^a-z0-9-]/g, "-");
  let dados;
  try { dados = JSON.parse(readFileSync(`clientes/${arq}`, "utf8")); }
  catch (err) { console.error(`ERRO em ${arq}: ${err.message}`); process.exitCode = 1; continue; }
  mkdirSync(`${OUT}/${slug}`, { recursive: true });
  writeFileSync(`${OUT}/${slug}/index.html`, pagina(dados, { assets: "/assets/", ver, previa: !dados.oficial, raiz: `/${slug}/` }));
  writeFileSync(`${OUT}/${slug}/privacidade.html`, privacidade(dados));
  slugs.push(slug);
}
const vazio = (t, p) => `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${t}</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;font-family:system-ui,sans-serif;background:#F2F3F2;color:#1A1F22;text-align:center;padding:24px}</style></head><body><main><h1 style="font-size:28px">${t}</h1><p>${p}</p></main></body></html>`;
writeFileSync(`${OUT}/index.html`, vazio("Prévias", "Use o link que você recebeu."));
writeFileSync(`${OUT}/404.html`, vazio("Esta página não existe", "Confira o link que você recebeu."));
writeFileSync(`${OUT}/robots.txt`, "User-agent: *\nDisallow: /\n");
console.log(`ok: ${slugs.length} prévia(s): ${slugs.join(", ")}`);

/* Modelo universal: transforma os dados de uma empresa (JSON) em um site completo.
   Usado no build (gerar.mjs) e na prévia ao vivo do gerador. */

export const TEMAS = {
  pedra: {
    nome: "Sóbrio (serifa, foto inteira)",
    fontes: [["Cinzel", "cinzel-latin-600-normal.woff2", "600"], ["Public Sans", "public-sans-latin-wght-normal.woff2", "100 900"]],
    titulo: 'Cinzel,"Times New Roman",serif', texto: '"Public Sans",system-ui,sans-serif', peso: 600, track: ".01em", lh: "1.05",
    fundo: "#F2F3F2", tom: "#E3E5E3", tinta: "#1A1F22", corpo: "#3A4144", suave: "#5A6264", escuro: "#13171A", raio: "6px", cor: "#2F4A3F", hero: "cheio",
  },
  acolhedor: {
    nome: "Acolhedor (arredondado, foto ao lado)",
    fontes: [["Bricolage", "bricolage-grotesque-latin-standard-normal.woff2", "200 800"]],
    titulo: "Bricolage,system-ui,sans-serif", texto: "Bricolage,system-ui,sans-serif", peso: 800, track: "-.035em", lh: ".98",
    fundo: "#EEF0EE", tom: "#FFFFFF", tinta: "#1C2226", corpo: "#3A4348", suave: "#555E63", escuro: "#1C2226", raio: "22px", cor: "#1E4E5F", hero: "lado",
  },
  tecnico: {
    nome: "Técnico (condensado, retas)",
    fontes: [["Archivo", "archivo-latin-standard-normal.woff2", "100 900"]],
    titulo: "Archivo,system-ui,sans-serif", texto: "Archivo,system-ui,sans-serif", peso: 800, track: "-.005em", lh: ".95", estica: "72%",
    fundo: "#F7F7F4", tom: "#EFEFEA", tinta: "#1E2024", corpo: "#4A4E54", suave: "#5E636A", escuro: "#1E2024", raio: "4px", cor: "#8F5E35", hero: "lado",
  },
};

const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const so = (s = "") => String(s).replace(/\D/g, "");
const lista = (v) => (Array.isArray(v) ? v.filter(Boolean) : []);
const num = (v) => (v === "" || v == null ? null : Number(String(v).replace(",", ".")));
const br = (n, d = 1) => n.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });

/* texto claro ou escuro sobre a cor escolhida */
function contraste(hex) {
  const h = (hex || "#000").replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.substr(i, 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.4 ? "#111" : "#fff";
}

export function normaliza(d) {
  const e = { ...d };
  e.tema = TEMAS[e.tema] ? e.tema : "pedra";
  e.wa = so(e.whatsapp);
  if (e.wa && !e.wa.startsWith("55")) e.wa = "55" + e.wa;
  e.servicos = lista(e.servicos).filter((s) => s.nome);
  e.passos = lista(e.passos).filter((s) => s.nome);
  if (!e.passos.length) e.passos = [
    { nome: "Orçamento", desc: "Você manda o que precisa pelo WhatsApp, com uma foto se puder." },
    { nome: "Combinado", desc: "Valor e prazo são acertados antes de começar." },
    { nome: "Entrega", desc: "O serviço é feito e entregue no dia combinado." },
  ];
  e.depoimentos = lista(e.depoimentos).map((t) => String(t).trim()).filter(Boolean);
  e.fotos = lista(e.fotos).filter((f) => f && f.url);
  e.faq = lista(e.faq).filter((f) => f.p && f.r);
  e.horario = lista(e.horario);
  e.nota = num(e.nota);
  e.avaliacoes = num(e.avaliacoes);
  e.cor = /^#[0-9a-f]{6}$/i.test(e.cor || "") ? e.cor : TEMAS[e.tema].cor;
  e.local = [e.cidade, e.uf].filter(Boolean).join(", ");
  e.titulo = e.titulo || `${e.ramo || "Atendimento"} em ${e.cidade || "sua cidade"}.`;
  e.subtitulo = e.subtitulo || `${e.nome} atende ${e.cidade ? "em " + e.cidade + " e região" : "na sua região"}. Orçamento direto pelo WhatsApp.`;
  return e;
}

const ICO = {
  seta: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 10h12M11 5l5 5-5 5"/></svg>',
  pino: '<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.6"/></svg>',
  zap: '<svg viewBox="0 0 32 32"><path d="M16 3C8.8 3 3 8.7 3 15.8c0 2.5.7 4.9 2 7L3 29l6.4-2c2 1.1 4.3 1.7 6.6 1.7 7.2 0 13-5.7 13-12.8S23.2 3 16 3zm0 23.4c-2.1 0-4.1-.6-5.9-1.7l-.4-.3-3.8 1.2 1.2-3.7-.3-.4a10.6 10.6 0 0 1-1.7-5.7C5.1 9.9 10 5.2 16 5.2s10.9 4.7 10.9 10.6S22 26.4 16 26.4zm6-7.9c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2l-1 1.2c-.2.2-.4.2-.7.1-.3-.2-1.4-.5-2.6-1.6-1-.9-1.6-1.9-1.8-2.2-.2-.3 0-.5.1-.7l.5-.6.3-.5v-.5l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.1 1.1-1.1 2.7s1.2 3.1 1.3 3.3c.2.2 2.3 3.5 5.6 4.9 2.8 1.1 3.3.9 3.9.8.6-.1 1.9-.8 2.2-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4z"/></svg>',
};
const ESTRELAS = (g) => `<span class="estrelas${g ? " g" : ""}" role="img" aria-label="5 de 5 estrelas"></span>`;
const iniciais = (n = "") => n.split(/\s+/).filter((w) => w.length > 2 || /^[A-Z]/.test(w)).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "•";

function css(e, A) {
  const T = TEMAS[e.tema], fg = contraste(e.cor);
  const ff = T.fontes.map(([f, arq, w]) => `@font-face{font-family:"${f}";src:url(${A}fonts/${arq}) format("woff2");font-weight:${w};font-display:swap}`).join("");
  const cheio = T.hero === "cheio";
  return `${ff}
:root{--fundo:${T.fundo};--tom:${T.tom};--tinta:${T.tinta};--corpo:${T.corpo};--suave:${T.suave};--escuro:${T.escuro};--cor:${e.cor};--cor-t:${fg};--raio:${T.raio};
--foco:${e.cor};--loader-bg:${T.escuro};--loader-fg:#fff;--aviso-h:30px;--fb1:${T.tom};--sel-bg:${e.cor};--sel-fg:${fg};--mapa-bg:${T.tom};--mapa-fg:${T.tinta};--linha:#00000018;--w:1240px}
body{font-family:${T.texto};font-size:17px;line-height:1.6;color:var(--corpo);background:var(--fundo)}
.w{max-width:var(--w);margin:0 auto;padding:0 32px}
h1,h2,h3{font-family:${T.titulo};font-weight:${T.peso};letter-spacing:${T.track};line-height:${T.lh};color:var(--tinta)${T.estica ? ";font-stretch:" + T.estica : ""}}
.aviso-demo{background:var(--escuro);color:#C9CDCF}
.btn{display:inline-flex;align-items:center;gap:12px;background:var(--cor);color:var(--cor-t);text-decoration:none;padding:17px 28px;border-radius:${T.raio === "22px" ? "999px" : T.raio};font-weight:600;font-size:16px;transition:filter .2s ease,transform .16s var(--ease-out)}
.btn:hover{filter:brightness(1.08)}.btn svg{width:18px;height:18px}
.btn.claro{background:#fff;color:var(--tinta)}.btn.linha{background:transparent;color:inherit;box-shadow:inset 0 0 0 1.5px currentColor}
.btn.zap{background:#25D366;color:#0B2A16}
.topo .w{display:flex;align-items:center;justify-content:space-between;height:82px;gap:24px;transition:height .3s var(--ease-out)}
.topo.rolou{background:var(--fundo);color:var(--tinta)}.topo.rolou .w{height:68px}
${cheio ? ".topo{color:#fff}" : ".topo{color:var(--tinta)}"}
.marca{display:flex;align-items:center;gap:12px;text-decoration:none;font-weight:700}
.marca i{width:38px;height:38px;border-radius:${T.raio === "22px" ? "12px" : T.raio};background:var(--cor);color:var(--cor-t);display:grid;place-items:center;font-style:normal;font-family:${T.titulo};font-size:15px}
.marca b{font-family:${T.titulo};font-size:18px;line-height:1.1;${T.estica ? "font-stretch:100%;" : ""}}
.marca small{display:block;font-size:12px;font-weight:500;opacity:.75;font-family:${T.texto}}
.nav-d{display:flex;gap:30px;font-size:15px}.nav-d a{text-decoration:none;opacity:.85}.nav-d a:hover{opacity:1}
.topo .btn{padding:11px 20px;font-size:15px}
.menu-mob{background:var(--escuro);color:#fff}.menu-mob a{font-family:${T.titulo};font-weight:${T.peso}}
.menu-mob .btn{margin-top:26px;align-self:flex-start;font-family:${T.texto};font-size:17px}
.menu-aberto .topo{color:#fff;background:transparent}
${cheio ? `
.hero{position:relative;min-height:100svh;display:flex;align-items:flex-end;color:#fff;overflow:hidden;background:var(--escuro);padding:0}
.hero .foto{position:absolute;inset:0}.hero .foto img,.hero .foto .img-fb{width:100%;height:100%;object-fit:cover}
.hero .foto .img-fb{background:#2A3134}
.hero::before{content:"";position:absolute;inset:0;z-index:1;background:linear-gradient(90deg,rgba(13,16,18,.86),rgba(13,16,18,.5) 50%,rgba(13,16,18,.15)),linear-gradient(0deg,rgba(13,16,18,.7),transparent 45%)}
.hero .w{position:relative;z-index:2;width:100%;padding-top:170px;padding-bottom:64px}
.hero h1{color:#fff;font-size:clamp(42px,6.6vw,100px);max-width:960px}
.hero .lead{color:#D7DCDA}` : `
.hero{padding:150px 0 90px}
.hero .w{display:grid;grid-template-columns:1.05fr 1fr;gap:56px;align-items:center}
.hero h1{font-size:clamp(44px,5.6vw,86px)}
.hero .foto{aspect-ratio:4/5;border-radius:var(--raio);overflow:hidden;background:var(--tom)}
.hero .foto img,.hero .foto .img-fb{width:100%;height:100%;object-fit:cover}`}
.hero .lead{font-size:clamp(18px,1.6vw,21px);max-width:560px;margin:28px 0 36px}
.acoes{display:flex;gap:12px;flex-wrap:wrap}
.selo{display:flex;align-items:center;gap:14px;margin-top:40px;font-size:15px}
.selo b{font-family:${T.titulo};font-size:40px;line-height:1;${cheio ? "color:#fff" : "color:var(--tinta)"}}
.estrelas{color:${cheio ? "#E0C27A" : "var(--cor)"}}
.numeros{background:var(--escuro);color:#D5D9DB}
.numeros .w{display:grid;grid-template-columns:repeat(4,1fr)}
.numeros .w>div{padding:36px 22px;min-width:0}.numeros .w>div:first-child{padding-left:0}
.numeros strong{display:block;font-family:${T.titulo};font-weight:${T.peso};font-size:40px;color:#fff;line-height:1.05}
.numeros span{display:block;margin-top:8px;font-size:14px;color:#A9AFB2}
section{padding:128px 0}
.cab{display:grid;grid-template-columns:1.1fr 1fr;gap:48px;align-items:end;margin-bottom:56px}
.cab h2{font-size:clamp(36px,4.8vw,68px)}.cab p{max-width:470px;justify-self:end;font-size:18px}
.serv{display:grid;grid-template-columns:1fr 1fr;gap:0 64px}
.serv>div{display:grid;grid-template-columns:1fr auto;gap:20px;align-items:center;padding:28px 0;border-bottom:1px solid var(--linha)}
.serv strong{display:block;font-family:${T.titulo};font-weight:${T.peso};font-size:26px;color:var(--tinta);line-height:1.15;margin-bottom:4px}
.serv a{width:46px;height:46px;border-radius:50%;background:var(--tom);color:var(--tinta);display:grid;place-items:center;transition:background-color .2s ease,color .2s ease,transform .16s var(--ease-out)}
.serv a svg{width:18px;height:18px}.serv a:hover{background:var(--cor);color:var(--cor-t)}.serv a:active{transform:scale(.94)}
.passos{list-style:none;display:grid;grid-template-columns:repeat(var(--n,3),1fr);gap:40px}
.passos strong{display:block;font-family:${T.titulo};font-weight:${T.peso};font-size:30px;color:var(--tinta);line-height:1.1;margin-bottom:12px}
.gal{display:grid;grid-template-columns:repeat(6,1fr);grid-auto-rows:200px;gap:14px;grid-auto-flow:dense}
.gal a{position:relative;overflow:hidden;border-radius:var(--raio);display:block;background:var(--tom);grid-column:span 2}
.gal a:first-child{grid-column:span 4;grid-row:span 2}.gal a:nth-child(2){grid-row:span 2}
.gal img,.gal .img-fb{width:100%;height:100%;object-fit:cover;transition:transform .7s var(--ease-out)}
@media(hover:hover) and (pointer:fine){.gal a:hover img{transform:scale(1.04)}}
.nota-foto{font-size:13.5px;color:var(--suave);margin-top:16px}
.orc{background:var(--escuro);color:#D5D9DB}.orc h2,.orc h3{color:#fff}.orc .cab p{color:#B8BEC1}
.mont{display:grid;grid-template-columns:1.1fr 1fr;gap:32px;align-items:start}
.form{background:#fff;color:var(--corpo);border-radius:var(--raio);padding:36px}
.campo{margin-bottom:26px;border:0}.campo legend,.campo>label{display:block;font-weight:700;color:var(--tinta);margin-bottom:12px;font-size:17px}
.op{display:flex;flex-wrap:wrap;gap:8px}.op input{position:absolute;opacity:0;pointer-events:none}
.op label{padding:10px 16px;border:1.5px solid #D5D8D6;border-radius:999px;cursor:pointer;font-size:15px;transition:background-color .2s ease,border-color .2s ease,color .2s ease}
.op input:checked+label{background:var(--cor);border-color:var(--cor);color:var(--cor-t)}
.op input:focus-visible+label{outline:3px solid var(--cor);outline-offset:2px}
.form textarea,.form input[type=text]{width:100%;padding:14px 16px;border:1.5px solid #D5D8D6;border-radius:12px;background:#fff}
.resumo{position:sticky;top:96px;background:#ffffff0f;border-radius:var(--raio);padding:32px}
.resumo h3{font-size:28px;margin-bottom:16px}
.resumo pre{white-space:pre-wrap;font:inherit;font-size:15px;color:#E6E9EA;background:#ffffff0d;border-radius:12px;padding:18px;margin-bottom:22px}
.resumo .btn{width:100%;justify-content:center}.resumo .obs{font-size:13px;color:#A9AFB2;margin-top:12px}
.aval{overflow:hidden}
.g-sel{display:flex;align-items:center;gap:18px;justify-self:end}.g-sel b{font-family:${T.titulo};font-size:72px;color:var(--tinta);line-height:1}
.marq{display:grid;gap:16px}
.marq-t figure{width:360px;flex:none;background:${T.tom === "#FFFFFF" ? "#fff" : "var(--tom)"};border-radius:var(--raio);padding:26px;display:flex;flex-direction:column;gap:12px}
.marq-t blockquote{color:var(--tinta)}.marq-t .estrelas,.g-sel .estrelas{color:var(--cor)}.marq-t figcaption{margin-top:auto;font-size:14px;color:var(--suave)}
.faq{display:grid;grid-template-columns:1fr 1.5fr;gap:88px}.faq h2{font-size:clamp(36px,4.4vw,60px)}
details.p summary{font-weight:700;font-size:19px;color:var(--tinta)}
.contato{background:var(--escuro);color:#D5D9DB;padding:0}
.contato .w{display:grid;grid-template-columns:1fr 1fr;max-width:none;padding:0}
.contato .txt{padding:110px max(32px,calc((100vw - var(--w))/2 + 32px));padding-right:64px}
.contato h2{color:#fff;font-size:clamp(36px,4.4vw,60px);margin-bottom:18px}
.contato dl{margin:36px 0 40px;display:grid;gap:20px}.contato dt{font-size:13px;color:#A9AFB2;margin-bottom:4px}.contato dd{color:#fff;font-size:18px}
.contato dd a{text-decoration:none}
footer{background:var(--escuro);color:#A9AFB2;padding:56px 0 40px;font-size:14px;border-top:1px solid #ffffff12}
footer .base{display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap}footer a{text-decoration:none}footer a:hover{color:#fff}
@media(max-width:1060px){
  .hero .w,.cab,.mont,.faq,.contato .w,.serv{grid-template-columns:1fr}
  .cab p,.g-sel{justify-self:start}
  .hero .foto{aspect-ratio:4/3}
  .numeros .w{grid-template-columns:1fr 1fr}.numeros .w>div:nth-child(3){padding-left:0}
  .passos{grid-template-columns:1fr}
  .resumo{position:static}
  .gal{grid-template-columns:1fr 1fr}.gal a,.gal a:first-child,.gal a:nth-child(2){grid-column:span 1;grid-row:span 1}.gal a:first-child{grid-column:span 2}
  .contato .txt{padding:80px 32px}
}
@media(max-width:680px){
  body{font-size:16px}.w{padding:0 22px}section{padding:88px 0}
  .hero h1{font-size:clamp(36px,10.4vw,48px)}
  .numeros strong{font-size:30px}.numeros .w>div{padding:26px 12px}
  .form,.resumo{padding:24px}.marq-t figure{width:290px}
}`;
}

export function pagina(dados, { assets = "/assets/", ver = "", previa = true, raiz = "" } = {}) {
  const e = normaliza(dados), T = TEMAS[e.tema], A = assets, v = ver ? "?v=" + ver : "";
  const zap = e.wa ? `https://wa.me/${e.wa}` : "#contato";
  const zapMsg = e.wa ? `${zap}?text=${encodeURIComponent(`Olá! Vi o site e quero um orçamento.`)}` : "#contato";
  const temNota = e.nota != null && e.avaliacoes != null;
  const notaTxt = temNota ? br(e.nota) : "";
  const f0 = e.fotos[0];
  const img = (f, cls = "", extra = "") => f ? `<img ${cls} data-fb="${esc(f.legenda || e.ramo || "Foto")}" alt="${esc(f.legenda || e.nome)}" src="${esc(f.url)}" ${extra}>` : `<div class="img-fb" role="img" aria-label="${esc(e.ramo || e.nome)}" data-label=""></div>`;
  const nav = [
    e.servicos.length && ["#servicos", "Serviços"], ["#orcamento", "Orçamento"],
    e.fotos.length > 1 && ["#trabalhos", "Trabalhos"], e.depoimentos.length && ["#avaliacoes", "Avaliações"], ["#contato", "Contato"],
  ].filter(Boolean);
  const navHtml = nav.map(([h, t]) => `<a href="${h}">${t}</a>`).join("");
  const opcoes = (e.orcamento && lista(e.orcamento.opcoes).length ? lista(e.orcamento.opcoes) : e.servicos.map((s) => s.nome)).slice(0, 8);
  const numeros = [
    temNota && [notaTxt, "nota média no Google", e.nota],
    temNota && [String(e.avaliacoes), "avaliações de clientes", e.avaliacoes],
    e.cidade && [e.cidade, e.uf ? `atendimento em ${e.uf}` : "e região"],
    ["WhatsApp", "orçamento direto"],
  ].filter(Boolean).slice(0, 4);
  const descr = `${e.nome}: ${e.ramo || "serviços"} em ${e.local || "sua região"}.${temNota ? ` Nota ${notaTxt} no Google com ${e.avaliacoes} avaliações.` : ""} Orçamento pelo WhatsApp.`;

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<title>${esc(e.nome)}${e.ramo ? " | " + esc(e.ramo) : ""}${e.cidade ? " em " + esc(e.cidade) : ""}</title>
<meta name="description" content="${esc(descr)}">
<meta name="theme-color" content="${T.escuro}">
<meta property="og:type" content="website"><meta property="og:locale" content="pt_BR">
<meta property="og:title" content="${esc(e.nome)}${e.cidade ? ", " + esc(e.cidade) : ""}">
<meta property="og:description" content="${esc(e.subtitulo)}">
${f0 ? `<meta property="og:image" content="${esc(f0.url)}">` : ""}
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${e.cor}"/><text x="32" y="42" text-anchor="middle" font-family="sans-serif" font-size="28" font-weight="700" fill="${contraste(e.cor)}">${esc(iniciais(e.nome))}</text></svg>`)}">
<link rel="stylesheet" href="${A}base.css${v}">
<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "LocalBusiness", name: e.nome, description: descr, telephone: e.wa ? "+" + e.wa : undefined, address: e.endereco ? { "@type": "PostalAddress", streetAddress: e.endereco, addressLocality: e.cidade, addressRegion: e.uf, addressCountry: "BR" } : undefined }).replace(/</g, "\\u003c")}</script>
<style>${css(e, A)}</style>
</head>
<body>
<a class="pular" href="#conteudo">Pular para o conteúdo</a>
${previa ? `<div class="aviso-demo">Prévia criada para ${esc(e.nome)}. Ainda não é o site oficial.</div>` : ""}
<header class="topo"${previa ? "" : ' style="top:0"'}>
  <div class="w">
    <a class="marca" href="#topo"><i aria-hidden="true">${esc(iniciais(e.nome))}</i><span><b>${esc(e.nome)}</b>${e.ramo ? `<small>${esc(e.ramo)}</small>` : ""}</span></a>
    <nav class="nav-d" aria-label="Principal">${navHtml}</nav>
    <a class="btn nav-d" href="#orcamento">Pedir orçamento</a>
    <button class="btn-menu" aria-label="Abrir menu" aria-expanded="false"><span></span><span></span><span></span></button>
  </div>
</header>
<nav class="menu-mob" aria-label="Menu">${navHtml}${e.wa ? `<a class="btn zap" href="${zap}" target="_blank" rel="noopener">Chamar no WhatsApp</a>` : ""}</nav>

<main id="conteudo">
<section class="hero" id="topo" data-hero>
  ${T.hero === "cheio" ? `<div class="foto">${img(f0, "data-hero-img", 'fetchpriority="high"')}</div>` : ""}
  <div class="w">
    <div>
      <h1 data-split>${esc(e.titulo)}</h1>
      <p class="lead" data-hero-fade>${esc(e.subtitulo)}</p>
      <div class="acoes" data-hero-fade>
        <a class="btn" href="#orcamento">Pedir orçamento ${ICO.seta}</a>
        ${e.servicos.length ? `<a class="btn linha" href="#servicos">Ver serviços</a>` : ""}
      </div>
      ${temNota ? `<div class="selo" data-hero-fade><b>${notaTxt}</b><div>${ESTRELAS()}${e.avaliacoes} avaliações no Google</div></div>` : ""}
    </div>
    ${T.hero === "lado" ? `<div class="foto" data-hero-fade>${img(f0, "data-hero-img", 'fetchpriority="high"')}</div>` : ""}
  </div>
</section>

<div class="numeros"><div class="w">${numeros.map(([a, b, c]) => `<div><strong${typeof c === "number" ? ` data-count="${c}"` : ""}>${esc(a)}</strong><span>${esc(b)}</span></div>`).join("")}</div></div>

${e.servicos.length ? `<section id="servicos">
  <div class="w">
    <div class="cab"><h2 data-split>${esc(e.tituloServicos || "O que fazemos")}</h2><p data-reveal>${esc(e.textoServicos || "Toque em um serviço para já montar o pedido de orçamento.")}</p></div>
    <div class="serv">${e.servicos.map((s, i) => `<div data-reveal><div><strong>${esc(s.nome)}</strong>${s.desc ? `<p>${esc(s.desc)}</p>` : ""}</div><a href="#orcamento" data-op="${i}" aria-label="Orçar ${esc(s.nome)}">${ICO.seta}</a></div>`).join("")}</div>
  </div>
</section>` : ""}

<section style="padding-top:${e.servicos.length ? "0" : "128px"}">
  <div class="w">
    <div class="cab"><h2 data-split>Como funciona</h2><p data-reveal>Do primeiro contato até a entrega, direto com ${esc(e.nome)}.</p></div>
    <ol class="passos" style="--n:${Math.min(4, e.passos.length)}">${e.passos.slice(0, 4).map((p) => `<li data-reveal><strong>${esc(p.nome)}</strong>${esc(p.desc || "")}</li>`).join("")}</ol>
  </div>
</section>

${e.fotos.length > 1 ? `<section id="trabalhos" style="padding-top:0">
  <div class="w">
    <div class="cab"><h2 data-split>${esc(e.tituloFotos || "Trabalhos")}</h2><p data-reveal>Toque numa foto para ver em tela cheia.</p></div>
    <div class="gal">${e.fotos.slice(0, 6).map((f) => `<a href="#" data-lb="g" data-legenda="${esc(f.legenda || "")}" data-full="${esc(f.url)}">${img(f, "", 'loading="lazy" decoding="async"')}</a>`).join("")}</div>
    ${e.notaFotos !== false ? `<p class="nota-foto">${esc(e.notaFotos || "Fotos ilustrativas. No site oficial entram as fotos dos trabalhos da empresa.")}</p>` : ""}
  </div>
</section>` : ""}

<section class="orc" id="orcamento">
  <div class="w">
    <div class="cab"><h2 data-split>Peça seu orçamento em 1 minuto</h2><p data-reveal>Escolha o serviço e conte o que precisa. A mensagem chega pronta no WhatsApp.</p></div>
    <div class="mont">
      <form class="form" id="form" onsubmit="return false" data-reveal>
        ${opcoes.length ? `<fieldset class="campo"><legend>Qual serviço?</legend><div class="op" id="opS">${opcoes.map((o, i) => `<input type="checkbox" name="s" id="s${i}" value="${esc(o)}" ${i === 0 ? "checked" : ""}><label for="s${i}">${esc(o)}</label>`).join("")}</div></fieldset>` : ""}
        <fieldset class="campo"><legend>Para quando?</legend><div class="op">${["O quanto antes", "Nas próximas semanas", "Só pesquisando"].map((o, i) => `<input type="radio" name="q" id="q${i}" value="${o}" ${i === 0 ? "checked" : ""}><label for="q${i}">${o}</label>`).join("")}</div></fieldset>
        <div class="campo"><label for="det">Conte o que precisa (opcional)</label><textarea id="det" rows="3" placeholder="Medidas, quantidade, o que precisa ser feito"></textarea></div>
        <div class="campo" style="margin:0"><label for="bai">Seu bairro (opcional)</label><input type="text" id="bai" placeholder="Ex: Centro"></div>
      </form>
      <aside class="resumo" data-reveal aria-live="polite">
        <h3>Sua mensagem</h3>
        <pre id="msg"></pre>
        <a class="btn zap" id="enviar" href="${zap}" target="_blank" rel="noopener">Enviar pelo WhatsApp</a>
        <p class="obs">O valor final é combinado com a empresa. Mande uma foto na conversa se puder.</p>
        <p class="lgpd">Ao tocar no botão, o WhatsApp abre com a mensagem pronta e você decide se envia. Este site não guarda seus dados. <a href="${raiz}privacidade">Privacidade</a></p>
      </aside>
    </div>
  </div>
</section>

${e.depoimentos.length ? `<section class="aval" id="avaliacoes">
  <div class="w"><div class="cab"><h2 data-split>Quem já contratou, conta</h2>${temNota ? `<div class="g-sel" data-reveal><b>${notaTxt}</b><div>${ESTRELAS(true)}<span>${e.avaliacoes} avaliações no Google</span></div></div>` : ""}</div></div>
  <div class="marq">${[0, 1].map((r) => { const base = e.depoimentos.filter((_, i) => i % 2 === r); const fila = base.length ? base : e.depoimentos; let itens = [...fila]; while (itens.length < 4) itens = itens.concat(fila); return `<div class="marq-t${r ? " rev" : ""}" data-marquee style="--dur:${60 + r * 12}s">${itens.map((t) => `<figure>${ESTRELAS()}<blockquote>“${esc(t)}”</blockquote><figcaption>Cliente no Google</figcaption></figure>`).join("")}</div>`; }).join("")}</div>
</section>` : ""}

${e.faq.length ? `<section${e.depoimentos.length ? ' style="padding-top:0"' : ""}>
  <div class="w faq">
    <div><h2 data-split>Perguntas frequentes</h2>${e.wa ? `<p data-reveal style="margin-top:20px">Não achou? <a href="${zap}" target="_blank" rel="noopener">Chame no WhatsApp</a>.</p>` : ""}</div>
    <div data-reveal>${e.faq.map((f) => `<details class="p"><summary>${esc(f.p)}</summary><p class="r">${esc(f.r)}</p></details>`).join("")}</div>
  </div>
</section>` : ""}

<section class="contato" id="contato">
  <div class="w">
    <div class="txt">
      <h2 data-split>${esc(e.tituloContato || "Vamos conversar?")}</h2>
      <p data-reveal>Orçamento sem compromisso pelo WhatsApp.</p>
      <dl data-reveal>
        ${e.wa ? `<div><dt>WhatsApp</dt><dd><a href="${zap}" target="_blank" rel="noopener">${esc(e.whatsapp)}</a></dd></div>` : ""}
        ${e.endereco ? `<div><dt>Endereço</dt><dd>${esc(e.endereco)}${e.local ? ", " + esc(e.local) : ""}</dd></div>` : ""}
        ${e.horario.length ? `<div><dt>Horário</dt><dd>${e.horario.map(esc).join("<br>")}</dd></div>` : ""}
      </dl>
      ${e.wa ? `<a class="btn zap" data-reveal href="${zapMsg}" target="_blank" rel="noopener">Chamar no WhatsApp</a>` : ""}
    </div>
    ${e.endereco || e.mapa ? `<div class="mapa" data-mapa="https://www.google.com/maps?q=${encodeURIComponent(e.mapa || `${e.nome} ${e.endereco} ${e.local}`)}&output=embed" data-titulo="Mapa de ${esc(e.nome)}">${ICO.pino}<button type="button" class="btn mapa-btn">Mostrar o mapa</button><a href="https://www.google.com/maps/search/?api=1&amp;query=${encodeURIComponent(e.mapa || `${e.nome} ${e.endereco} ${e.local}`)}" target="_blank" rel="noopener">Abrir no Google Maps</a><small>O mapa é do Google e só carrega quando você toca no botão.</small></div>` : "<div></div>"}
  </div>
</section>
</main>

<footer><div class="w"><div class="base"><span>© <span data-ano></span> ${esc(e.nome)}</span><span><a href="${raiz}privacidade">Privacidade e termos</a>${e.fotos.length ? " · " + esc(e.creditoFotos || "Fotos ilustrativas") : ""}</span></div></div></footer>
${e.wa ? `<a class="fab" href="${zap}" target="_blank" rel="noopener" aria-label="Falar no WhatsApp">${ICO.zap}</a>` : ""}

<script src="${A}js/gsap.min.js"></script><script src="${A}js/ScrollTrigger.min.js"></script><script src="${A}js/lenis.min.js"></script>
<script>
(function(){
  var WA=${JSON.stringify(e.wa)},NOME=${JSON.stringify(e.nome)};
  var f=document.getElementById("form"),msg=document.getElementById("msg"),env=document.getElementById("enviar");
  function atualiza(){
    var s=[].slice.call(document.querySelectorAll("input[name=s]:checked")).map(function(i){return i.value}).join(", ");
    var q=(document.querySelector("input[name=q]:checked")||{}).value||"";
    var d=document.getElementById("det").value.trim(),b=document.getElementById("bai").value.trim();
    var t="Olá! Vim pelo site e quero um orçamento."+(s?"\\n\\nServiço: "+s:"")+(q?"\\nPara quando: "+q:"")+(d?"\\nDetalhes: "+d:"")+(b?"\\nBairro: "+b:"");
    msg.textContent=t; if(WA) env.href="https://wa.me/"+WA+"?text="+encodeURIComponent(t);
  }
  f.addEventListener("input",atualiza);atualiza();
  document.querySelectorAll("[data-op]").forEach(function(a){a.addEventListener("click",function(){
    document.querySelectorAll("input[name=s]").forEach(function(i){i.checked=false});
    var x=document.getElementById("s"+a.dataset.op); if(x){x.checked=true;atualiza();}
  })});
})();
</script>
<script src="${A}base.js${v}"></script>
</body>
</html>`;
  return html;
}

export function privacidade(dados, { assets = "/assets/" } = {}) {
  const e = normaliza(dados), T = TEMAS[e.tema];
  const ff = T.fontes.map(([f, arq, w]) => `@font-face{font-family:"${f}";src:url(${assets}fonts/${arq}) format("woff2");font-weight:${w};font-display:swap}`).join("");
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Privacidade e termos | ${esc(e.nome)}</title><style>${ff}
*{box-sizing:border-box;margin:0}html{-webkit-text-size-adjust:100%;overflow-x:clip}body{font-family:${T.texto};background:${T.fundo};color:${T.corpo};line-height:1.65;font-size:17px;padding:0 22px}
h1,h2{font-family:${T.titulo};font-weight:${T.peso};color:${T.tinta};line-height:1.08;text-wrap:balance}a{color:${e.cor};text-underline-offset:.22em}::selection{background:${e.cor};color:${contraste(e.cor)}}
main{max-width:720px;margin:0 auto;padding:72px 0 96px}h1{font-size:clamp(34px,6vw,54px);margin:28px 0 18px}h2{font-size:24px;margin:44px 0 12px}p+p,ul{margin-top:12px}ul{padding-left:20px}li+li{margin-top:6px}</style></head><body><main>
<a href="./" style="font-weight:600">Voltar para o site</a>
<h1>Privacidade e termos de uso</h1>
<p>Como o site de ${esc(e.nome)} trata seus dados, conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018).</p>
<h2>Quem é o responsável</h2><p>${esc(e.nome)}${e.endereco ? ", " + esc(e.endereco) : ""}${e.local ? ", " + esc(e.local) : ""}.${e.wa ? ` Contato pelo WhatsApp <a href="https://wa.me/${e.wa}">${esc(e.whatsapp)}</a>.` : ""}</p>
<h2>O que este site coleta</h2><p>Nada. O site não tem cadastro, não envia formulário para servidor, não usa Google Analytics, pixel de anúncio nem cookies próprios.</p><p>O que você preenche no pedido de orçamento fica só no seu navegador. Ao tocar em enviar, o WhatsApp abre com a mensagem pronta e você decide se manda.</p>
<h2>Serviços de terceiros</h2><ul><li><b>WhatsApp (Meta):</b> a conversa segue a política de privacidade do WhatsApp.</li><li><b>Google Maps:</b> o mapa só carrega quando você toca em “Mostrar o mapa”. A partir daí o Google pode gravar cookies próprios.</li><li><b>Fotos:</b> imagens carregadas de serviços externos recebem o endereço de internet do seu aparelho, como em qualquer site.</li><li><b>Hospedagem:</b> registra acessos de forma técnica para manter o site no ar.</li></ul>
<h2>Armazenamento no navegador</h2><p>O site guarda uma única marca na sessão do navegador para não repetir a animação de abertura. Ela some quando você fecha a aba e não identifica você.</p>
<h2>Seus direitos</h2><p>Você pode pedir acesso, correção ou exclusão dos dados que mandou para ${esc(e.nome)} pelo WhatsApp.</p>
<h2>Termos de uso</h2><p>O conteúdo do site é informativo. Valores, prazos e condições são combinados no orçamento. As fotos podem ser ilustrativas. Estes termos seguem as leis brasileiras, incluindo o Código de Defesa do Consumidor.</p>
</main></body></html>`;
}

/**
 * E SE...? | HISTÓRIAS DO TABOCAL — EP02: "E se parasse de ventar no mundo?"
 *
 * Gera tudo a partir do roteiro:
 *   1. narração (uma fala por arquivo) + legendas com o tempo de cada palavra
 *   2. trilha e efeito de vento sintetizados com FFmpeg (sem amostras de terceiros)
 *   3. index.html + hyperframes.json, com cada cena ancorada na sua fala
 *
 * Uso (na raiz do repositório):
 *   node examples/ep02-e-se-parasse-de-ventar/build.ts
 *   npx hfr render examples/ep02-e-se-parasse-de-ventar
 *
 * Voz: usa HFR_TTS_COMMAND se definido (ex.: edge-tts com pt-BR-AntonioNeural a +12%,
 * ver README), senão ELEVENLABS/OpenAI quando houver chave, senão espeak-ng.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ffmpeg } from '@hfr/media';
import { buildNarration, type TtsProviderName } from '@hfr/voice';
import type { CaptionDocument } from '@hfr/core';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const W = 1080, H = 1920, FPS = 30;
const OFFSET = 1.2; // a abertura "E SE...?" aparece antes da primeira fala
const HANDLE = '@historiasdotabocal';

interface Line { id: string; text: string; pause: number; emph: Record<string, 'gold' | 'blue' | 'red' | 'green' | 'orange'> }

export const LINES: Line[] = [
  { id: 'L01', text: 'E se... de repente, parasse de ventar no mundo inteiro?', pause: 0.7, emph: { ventar: 'blue', mundo: 'gold', inteiro: 'gold' } },
  { id: 'L02', text: 'Numa tarde comum, aqui no Tabocal, o Tito percebeu algo estranho.', pause: 0.35, emph: { tabocal: 'gold', estranho: 'red' } },
  { id: 'L03', text: 'O cata-vento parou. A roupa no varal ficou imóvel. Nenhuma folha se mexia.', pause: 0.7, emph: { parou: 'red', imovel: 'red', nenhuma: 'red' } },
  { id: 'L04', text: 'Em poucas horas, as pipas despencaram do céu, e os moinhos ficaram em silêncio.', pause: 0.5, emph: { pipas: 'gold', despencaram: 'red', silencio: 'blue' } },
  { id: 'L05', text: 'As turbinas eólicas pararam. E, no Brasil, mais de dez por cento da eletricidade vem delas.', pause: 0.6, emph: { turbinas: 'blue', pararam: 'red', dez: 'gold', cento: 'gold' } },
  { id: 'L06', text: 'Sem vento, o calor ficou preso sobre as cidades, e a fumaça começou a se acumular no ar.', pause: 0.6, emph: { calor: 'orange', preso: 'red', fumaca: 'orange' } },
  { id: 'L07', text: 'Se tá curtindo, já deixa o like e segue o perfil… porque o pior ainda vai acontecer.', pause: 0.55, emph: { like: 'red', segue: 'gold', pior: 'red' } },
  { id: 'L08', text: 'É o vento que leva a umidade do oceano para dentro dos continentes.', pause: 0.35, emph: { vento: 'blue', umidade: 'blue', oceano: 'blue' } },
  { id: 'L09', text: 'Sem ele, as nuvens ficaram presas sobre o mar… e a chuva sumiu do interior.', pause: 0.6, emph: { nuvens: 'blue', chuva: 'blue', sumiu: 'red' } },
  { id: 'L10', text: 'Milho, trigo e arroz dependem do vento para espalhar o pólen. As colheitas começaram a falhar.', pause: 0.6, emph: { milho: 'gold', trigo: 'gold', arroz: 'gold', falhar: 'red' } },
  { id: 'L11', text: 'E, sem o vento levando o calor do equador até os polos, o planeta se dividiu: uma faixa fervendo, e o resto congelando.', pause: 1.0, emph: { equador: 'orange', polos: 'blue', fervendo: 'red', congelando: 'blue' } },
  { id: 'L12', text: 'Mas calma. Na vida real, o vento não pode parar: ele nasce porque o Sol aquece a Terra de forma desigual.', pause: 0.5, emph: { calma: 'green', sol: 'gold', desigual: 'gold' } },
  { id: 'L13', text: 'Enquanto existir Sol, vai existir vento. O Tito pode soltar pipa tranquilo.', pause: 0.8, emph: { sol: 'gold', vento: 'blue', tranquilo: 'green' } },
  { id: 'L14', text: 'E você? Acha que a humanidade sobreviveria sem vento? Comenta aí!', pause: 0.6, emph: { sobreviveria: 'gold', comenta: 'blue' } },
];

const COLORS = { gold: '#ffc83d', blue: '#5ec8ff', red: '#ff4d4d', green: '#6be37a', orange: '#ff9a1f' };
const norm = (w: string) => w.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
const r3 = (n: number) => Math.round(n * 1000) / 1000;

// ------------------------------------------------------------------ áudio
async function narration() {
  const provider = (process.env.HFR_TTS_PROVIDER as TtsProviderName | undefined) ?? (process.env.HFR_TTS_COMMAND ? 'command' : undefined);
  return buildNarration(LINES.map((l) => ({ text: l.text, pauseAfter: l.pause })), {
    outDir: path.join(DIR, 'assets', 'narracao'), provider, voice: 'pt-br', language: 'pt-BR',
  });
}

/** Vento: ruído rosa filtrado com rajadas lentas. */
async function windTrack(file: string, seconds: number) {
  await ffmpeg(['-f', 'lavfi', '-i', `anoisesrc=color=pink:amplitude=0.6:duration=${seconds}:seed=7`,
    '-af', 'lowpass=f=700,highpass=f=80,tremolo=f=0.18:d=0.55,tremolo=f=0.11:d=0.4,volume=0.9', '-ac', '2', '-c:a', 'libmp3lame', '-b:a', '128k', file]);
}

/** Trilha de mistério/tensão: drone grave + acordes lentos (sintetizados). */
async function musicTrack(file: string, seconds: number) {
  const expr = [
    '0.16*sin(2*PI*55*t)*(0.7+0.3*sin(2*PI*0.05*t))',
    '0.10*sin(2*PI*82.41*t)*(0.6+0.4*sin(2*PI*0.08*t+1))',
    '0.07*sin(2*PI*130.81*t)*(0.5+0.5*sin(2*PI*0.11*t+2))',
    '0.05*sin(2*PI*196*t)*(0.5+0.5*sin(2*PI*0.13*t+3))',
    '0.035*sin(2*PI*329.63*t)*(0.5+0.5*sin(2*PI*0.17*t))',
    '0.06*sin(2*PI*41.2*t)*exp(-3*mod(t,4))',
  ].join('+');
  await ffmpeg(['-f', 'lavfi', '-i', `aevalsrc='${expr}':s=44100:d=${seconds}`, '-af', 'aecho=0.8:0.7:600:0.3,lowpass=f=2500', '-ac', '2', '-c:a', 'libmp3lame', '-b:a', '128k', file]);
}

// --------------------------------------------------------------- visual
const SKY_DAY = 'linear-gradient(180deg,#3d8fe0 0%,#86c4f2 55%,#d9f0ff 100%)';
const SKY_AFTERNOON = 'linear-gradient(180deg,#2f6db3 0%,#f2a35e 62%,#ffd98a 100%)';

const pinwheel = (id: string, x: number, y: number, s = 1) => `
  <g transform="translate(${x} ${y}) scale(${s})">
    <rect x="-6" y="0" width="12" height="420" rx="6" fill="#7a4a24"/>
    <g id="${id}">
      <path d="M0 0 L0 -120 Q60 -90 0 0" fill="#ff4d4d"/><path d="M0 0 L120 0 Q90 60 0 0" fill="#ffc83d"/>
      <path d="M0 0 L0 120 Q-60 90 0 0" fill="#5ec8ff"/><path d="M0 0 L-120 0 Q-90 -60 0 0" fill="#6be37a"/>
      <circle r="14" fill="#fff"/>
    </g>
  </g>`;

const tito = (x: number, y: number, s = 1, flip = false) => `
  <g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})">
    <ellipse cx="0" cy="250" rx="70" ry="14" fill="rgba(0,0,0,.25)"/>
    <rect x="-34" y="150" width="26" height="100" rx="12" fill="#2b3a67"/><rect x="8" y="150" width="26" height="100" rx="12" fill="#2b3a67"/>
    <rect x="-48" y="40" width="96" height="125" rx="40" fill="#ff7a3d"/>
    <rect x="-70" y="55" width="26" height="90" rx="13" fill="#e8b28a" transform="rotate(12 -57 60)"/>
    <rect x="44" y="55" width="26" height="90" rx="13" fill="#e8b28a" transform="rotate(-25 57 60)"/>
    <circle cx="0" cy="0" r="52" fill="#e8b28a"/>
    <path d="M-56 -8 Q-50 -62 0 -62 Q52 -62 58 -10 L-56 -10 Z" fill="#1f6f43"/><rect x="0" y="-18" width="78" height="14" rx="7" fill="#1f6f43"/>
    <circle cx="16" cy="4" r="6" fill="#222"/><circle cx="-14" cy="4" r="6" fill="#222"/>
    <path d="M-10 26 Q2 34 14 26" stroke="#7a3b2a" stroke-width="5" fill="none" stroke-linecap="round"/>
  </g>`;

const turbine = (id: string, x: number, y: number, s: number) => `
  <g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-10 0 L10 0 L16 520 L-16 520 Z" fill="#eef3f8"/>
    <g id="${id}"><circle r="16" fill="#fff"/>
      <path d="M-7 0 L0 -260 L7 0 Z" fill="#fff"/><path d="M-7 0 L0 -260 L7 0 Z" fill="#fff" transform="rotate(120)"/><path d="M-7 0 L0 -260 L7 0 Z" fill="#fff" transform="rotate(240)"/>
    </g>
  </g>`;

const cloud = (x: number, y: number, s: number, cls = '') => `
  <g class="${cls}" transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="110" ry="55" fill="#fff"/><ellipse cx="-80" cy="20" rx="80" ry="45" fill="#fff"/><ellipse cx="90" cy="20" rx="85" ry="45" fill="#fff"/><ellipse cx="10" cy="-35" rx="70" ry="50" fill="#fff"/></g>`;

const kite = (cls: string, x: number, y: number, color: string) => `
  <g class="${cls}" transform="translate(${x} ${y})">
    <path d="M0 -90 L60 0 L0 110 L-60 0 Z" fill="${color}"/><path d="M0 -90 L0 110 M-60 0 L60 0" stroke="rgba(0,0,0,.25)" stroke-width="4"/>
    <path d="M0 110 Q20 160 -10 210 Q-30 260 10 310" stroke="#fff" stroke-width="5" fill="none"/>
  </g>`;

const tag = (text: string, extra = '') => `<div class="tag" ${extra}>${text}</div>`;

async function main() {
  await mkdir(path.join(DIR, 'assets'), { recursive: true });
  console.log('narração…');
  const n = await narration();
  const at = (i: number) => r3(OFFSET + n.lines[i]!.start);
  const endOf = (i: number) => r3(OFFSET + n.lines[i]!.end);
  const lastEnd = endOf(LINES.length - 1);
  const END_START = r3(lastEnd + 0.6);
  const TOTAL = r3(END_START + 4.0);
  console.log(`provedor ${n.provider}, ${n.lines.map((l) => l.timing).join('/')}, duração ${TOTAL}s`);

  // legendas deslocadas pelo OFFSET
  const doc: CaptionDocument = {
    language: 'pt-BR',
    cues: n.document.cues.map((c) => ({ ...c, start: c.start + OFFSET, end: c.end + OFFSET, words: c.words?.map((w) => ({ ...w, start: w.start + OFFSET, end: w.end + OFFSET })) })),
  };
  await writeFile(path.join(DIR, 'captions.json'), JSON.stringify(doc, null, 2));

  console.log('trilha e vento…');
  await musicTrack(path.join(DIR, 'assets', 'trilha.mp3'), Math.ceil(TOTAL) + 1);
  await windTrack(path.join(DIR, 'assets', 'vento.mp3'), Math.ceil(TOTAL) + 1);

  // cena i começa um pouco antes da fala, e termina quando a próxima começa
  const scenes = [
    { id: 'abertura', from: 0 },
    { id: 'tabocal', line: 1 },
    { id: 'pipas', line: 3 },
    { id: 'turbinas', line: 4 },
    { id: 'calor', line: 5 },
    { id: 'chamada', line: 6 },
    { id: 'umidade', line: 7 },
    { id: 'seca', line: 8 },
    { id: 'colheita', line: 9 },
    { id: 'planeta', line: 10 },
    { id: 'calma', line: 11 },
    { id: 'comenta', line: 13 },
    { id: 'final', from: END_START },
  ].map((s) => ({ ...s, start: s.from ?? r3(Math.max(0, at(s.line!) - 0.25)) }));
  const S = Object.fromEntries(scenes.map((s, i) => {
    const next = scenes[i + 1];
    const end = next ? r3(next.start + 0.45) : TOTAL;
    return [s.id, { start: s.start, end, dur: r3(end - s.start) }];
  })) as Record<string, { start: number; end: number; dur: number }>;
  const clip = (id: string, inner: string, extra = '', enter = 'fade 0.45') =>
    `<section id="${id}" class="scene" data-name="${id}" data-start="${S[id]!.start}" data-end="${S[id]!.end}" data-enter="${enter}" ${extra}>${inner}\n    </section>`;
  // tempos relativos ao início de uma cena (para as timelines GSAP)
  const rel = (scene: string, t: number) => r3(t - S[scene]!.start);
  const windStop = at(2); // "O cata-vento parou."
  const windBack = at(11) + 2.5; // "…o vento não pode parar…"

  const emphCss = Object.entries(Object.fromEntries(LINES.flatMap((l) => Object.entries(l.emph).map(([w, c]) => [norm(w), c] as const))))
    .map(([w, c]) => `[data-hf-captions] .hf-cap-word[data-word="${w}"]{color:${COLORS[c]}}`).join('\n');

  const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>E SE...? EP02 — E se parasse de ventar no mundo?</title>
  <script src="/__hf/lib/gsap.js"></script>
  <style>
    @font-face{font-family:Anton;src:url(assets/fonts/anton-latin-400-normal.woff2) format("woff2");font-display:block}
    @font-face{font-family:Montserrat;font-weight:800;src:url(assets/fonts/montserrat-latin-800-normal.woff2) format("woff2");font-display:block}
    @font-face{font-family:Montserrat;font-weight:900;src:url(assets/fonts/montserrat-latin-900-normal.woff2) format("woff2");font-display:block}
    #stage{font-family:Montserrat,system-ui,sans-serif;color:#f4f4f8}
    .scene{position:absolute;inset:0;overflow:hidden}
    .scene svg.art{position:absolute;inset:0;width:100%;height:100%}
    .big{font-family:Anton,Impact,sans-serif;text-transform:uppercase;line-height:.95;text-align:center;letter-spacing:.01em}
    .gold{color:#ffc83d}.blue{color:#5ec8ff}.red{color:#ff4d4d}.green{color:#6be37a}
    .tag{position:absolute;top:150px;left:50%;translate:-50% 0;padding:14px 30px;border-radius:999px;background:rgba(5,6,12,.72);font:800 34px Montserrat;letter-spacing:.08em;text-transform:uppercase;white-space:nowrap;border:2px solid rgba(255,200,61,.6)}
    .badge{position:absolute;top:70px;left:50%;translate:-50% 0;font:900 30px Montserrat;letter-spacing:.18em;color:#ffc83d;white-space:nowrap;text-shadow:0 3px 12px rgba(0,0,0,.5)}
    .card{position:absolute;left:90px;right:90px;padding:40px;border-radius:40px;background:rgba(5,6,12,.78);text-align:center;box-shadow:0 30px 80px rgba(0,0,0,.4)}
    .vignette{position:absolute;inset:0;background:radial-gradient(120% 80% at 50% 45%,transparent 55%,rgba(0,0,0,.55));pointer-events:none}
    [data-hf-captions]{top:1290px;bottom:auto !important;left:60px;right:60px;font:900 76px/1.08 Montserrat;text-transform:uppercase;--hf-cap-active:#ffffff;--hf-cap-color:#fff;text-shadow:0 5px 0 rgba(0,0,0,.55),0 8px 30px rgba(0,0,0,.6)}
    ${emphCss}
  </style>
</head>
<body>
  <div id="stage" data-composition data-width="${W}" data-height="${H}" data-fps="${FPS}" data-duration="${TOTAL}" data-background="#05060c">

    ${clip('abertura', `
      <div style="position:absolute;inset:0;background:${SKY_DAY}"></div>
      <svg class="art" viewBox="0 0 ${W} ${H}">
        <g id="ab-clouds">${cloud(200, 380, 1.1)}${cloud(820, 640, 0.9)}${cloud(380, 980, 0.7)}${cloud(900, 1180, 1.2)}</g>
        <g id="ab-streaks" stroke="rgba(255,255,255,.75)" stroke-width="8" stroke-linecap="round">
          ${Array.from({ length: 14 }, (_, i) => `<line x1="${(i * 157) % 900}" y1="${260 + i * 105}" x2="${((i * 157) % 900) + 180 + (i % 3) * 60}" y2="${260 + i * 105}"/>`).join('')}
        </g>
      </svg>
      <div class="vignette"></div>
      <div class="badge">HISTÓRIAS DO TABOCAL</div>
      <div id="ab-ese" class="big gold" style="position:absolute;top:470px;width:100%;font-size:230px;-webkit-text-stroke:8px #5a3a00;paint-order:stroke fill;text-shadow:0 12px 0 #8a5a00,0 30px 60px rgba(0,0,0,.45)">E SE...?</div>
      <div id="ab-title" class="big" style="position:absolute;top:790px;left:70px;right:70px;padding:34px 20px 40px;border-radius:44px;background:rgba(5,6,12,.72);font-size:118px;color:#fff;box-shadow:0 24px 60px rgba(0,0,0,.35)">PARASSE DE <span class="blue">VENTAR</span><br>NO MUNDO?</div>`, '', 'none')}

    ${clip('tabocal', `
      <div style="position:absolute;inset:0;background:${SKY_AFTERNOON}"></div>
      <svg class="art" viewBox="0 0 ${W} ${H}">
        <circle cx="820" cy="520" r="110" fill="#ffe9a8"/><circle cx="820" cy="520" r="170" fill="rgba(255,233,168,.25)"/>
        <g id="tb-clouds">${cloud(260, 360, 0.8)}${cloud(700, 260, 0.6)}</g>
        <path d="M0 1180 Q300 1050 600 1150 T1080 1120 L1080 1920 L0 1920 Z" fill="#4c9a4a"/>
        <path d="M0 1320 Q350 1220 700 1300 T1080 1280 L1080 1920 L0 1920 Z" fill="#3a7d3b"/>
        <g transform="translate(640 1000)"><rect x="0" y="80" width="300" height="200" fill="#f1d7a8"/><path d="M-30 90 L150 -20 L330 90 Z" fill="#c4492f"/><rect x="120" y="170" width="70" height="110" fill="#7a4a24"/><rect x="30" y="130" width="60" height="55" fill="#7cc6ff"/></g>
        <g id="tb-tree" transform="translate(170 1180)"><rect x="-18" y="-40" width="36" height="200" fill="#6b4226"/><g id="tb-leaves"><circle cx="0" cy="-120" r="110" fill="#2f7d32"/><circle cx="-70" cy="-60" r="70" fill="#38913b"/><circle cx="75" cy="-70" r="75" fill="#2a6f2d"/></g></g>
        <line x1="330" y1="1150" x2="620" y2="1150" stroke="#555" stroke-width="5"/><rect x="322" y="1140" width="14" height="190" fill="#7a4a24"/><rect x="612" y="1140" width="14" height="190" fill="#7a4a24"/>
        <g id="tb-cloth1" transform="translate(390 1150)"><path d="M-40 0 L40 0 L48 120 L-48 120 Z" fill="#ff4d4d"/></g>
        <g id="tb-cloth2" transform="translate(480 1150)"><path d="M-30 0 L30 0 L30 150 L-30 150 Z" fill="#5ec8ff"/></g>
        <g id="tb-cloth3" transform="translate(565 1150)"><path d="M-38 0 L38 0 L30 95 L-30 95 Z" fill="#ffc83d"/></g>
        ${pinwheel('tb-pin', 880, 1260, 1)}
        ${tito(520, 1440, 1.25, true)}
      </svg>
      <div class="vignette"></div>
      ${tag('TABOCAL · 15H', 'id="tb-tag"')}
      <div id="tb-stop" class="big red" style="position:absolute;top:290px;width:100%;font-size:170px;opacity:0;text-shadow:0 10px 0 rgba(0,0,0,.35)">PAROU.</div>`)}

    ${clip('pipas', `
      <div style="position:absolute;inset:0;background:${SKY_DAY}"></div>
      <svg class="art" viewBox="0 0 ${W} ${H}">
        ${kite('pp-kite', 260, 330, '#ff4d4d')}${kite('pp-kite', 560, 220, '#ffc83d')}${kite('pp-kite', 850, 400, '#6be37a')}
        <path d="M0 1450 Q540 1330 1080 1450 L1080 1920 L0 1920 Z" fill="#4c9a4a"/>
        <g transform="translate(540 1430)"><path d="M-70 0 L-45 -330 L45 -330 L70 0 Z" fill="#d8c3a0"/><path d="M-55 -330 L0 -400 L55 -330 Z" fill="#8a4b2a"/>
          <g id="pp-mill" transform="translate(0 -320)"><rect x="-14" y="-270" width="28" height="270" fill="#f4efe6"/><rect x="-14" y="-270" width="28" height="270" fill="#f4efe6" transform="rotate(90)"/><rect x="-14" y="-270" width="28" height="270" fill="#f4efe6" transform="rotate(180)"/><rect x="-14" y="-270" width="28" height="270" fill="#f4efe6" transform="rotate(270)"/><circle r="22" fill="#5a3a22"/></g></g>
      </svg>
      <div class="vignette"></div>
      ${tag('AS PIPAS CAÍRAM')}`)}

    ${clip('turbinas', `
      <div id="tu-sky" style="position:absolute;inset:0;background:linear-gradient(180deg,#a9c7e6,#e6eef6)"></div>
      <svg class="art" viewBox="0 0 ${W} ${H}">
        <path d="M0 1300 Q540 1180 1080 1300 L1080 1920 L0 1920 Z" fill="#9db58a"/>
        ${turbine('tu-1', 200, 820, 0.8)}${turbine('tu-2', 520, 700, 1.05)}${turbine('tu-3', 860, 860, 0.75)}
      </svg>
      <div class="card" style="top:240px">
        <div id="tu-num" class="big gold" style="font-size:190px">+10%</div>
        <div style="font:900 44px Montserrat;margin-top:10px">DA ELETRICIDADE DO BRASIL<br>VEM DO VENTO</div>
      </div>
      <div id="tu-dark" style="position:absolute;inset:0;background:#05060c;opacity:0"></div>`)}

    ${clip('calor', `
      <div style="position:absolute;inset:0;background:linear-gradient(180deg,#ff8a3d 0%,#ffbf69 55%,#ffe0a3 100%)"></div>
      <svg class="art" viewBox="0 0 ${W} ${H}">
        <circle id="ca-sun" cx="540" cy="560" r="170" fill="#fff3c4"/><circle cx="540" cy="560" r="260" fill="rgba(255,243,196,.3)"/>
        <g fill="#3b2a3f">${Array.from({ length: 11 }, (_, i) => { const w = 70 + (i * 37) % 60, h = 260 + (i * 97) % 420, x = i * 100 - 10; return `<rect x="${x}" y="${1500 - h}" width="${w}" height="${h + 500}"/>`; }).join('')}</g>
        <g transform="translate(900 820)"><rect x="-30" y="0" width="60" height="420" rx="30" fill="#fff"/><circle cx="0" cy="440" r="56" fill="#ff4d4d"/><rect id="ca-merc" x="-14" y="120" width="28" height="320" rx="14" fill="#ff4d4d"/></g>
      </svg>
      <canvas data-hf-particles="dust" data-count="160" data-colors="#fff3c4,#ffd18a" data-seed="4" data-start="calor.start" data-end="calor.end" style="position:absolute;inset:0;width:100%;height:100%"></canvas>
      <div id="ca-smog" style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(90,70,60,0) 0%,rgba(90,70,60,.75) 70%);opacity:0"></div>
      ${tag('CALOR PRESO')}`)}

    ${clip('chamada', `
      <div style="position:absolute;inset:0;background:radial-gradient(80% 60% at 50% 40%,#1b2a55,#05060c 75%)"></div>
      <svg class="art" viewBox="0 0 ${W} ${H}"><g id="ch-heart" transform="translate(540 640)"><path d="M0 120 C-220 -20 -180 -220 -40 -200 C0 -195 0 -150 0 -150 C0 -150 0 -195 40 -200 C180 -220 220 -20 0 120 Z" fill="#ff4d4d" transform="scale(1.6)"/></g></svg>
      <div id="ch-text" class="big" style="position:absolute;top:960px;width:100%;font-size:120px">CURTE E <span class="gold">SEGUE</span></div>
      <div style="position:absolute;top:1110px;width:100%;text-align:center;font:900 48px Montserrat;color:#ffc83d">${HANDLE}</div>`)}

    ${clip('umidade', `
      <div style="position:absolute;inset:0;background:linear-gradient(180deg,#5aa6e6,#cfe8fb)"></div>
      <svg class="art" viewBox="0 0 ${W} ${H}">
        <path d="M0 900 L0 1920 L430 1920 Q470 1500 380 1250 Q330 1080 440 900 Z" fill="#1f6fb2"/>
        <path d="M440 900 Q330 1080 380 1250 Q470 1500 430 1920 L1080 1920 L1080 900 Z" fill="#6aa84f"/>
        <path d="M0 1000 Q60 980 120 1000 T240 1000" stroke="rgba(255,255,255,.5)" stroke-width="6" fill="none"/>
        <g id="um-clouds">${cloud(180, 700, 0.9)}${cloud(320, 560, 0.6)}</g>
        <g id="um-arrows" stroke="#fff" stroke-width="14" stroke-linecap="round" fill="none">
          <path class="um-a" d="M150 820 Q480 700 880 820" stroke-dasharray="40 30"/>
          <path class="um-a" d="M120 1000 Q520 900 950 1050" stroke-dasharray="40 30"/>
        </g>
        <g id="um-drops" fill="#5ec8ff">${Array.from({ length: 8 }, (_, i) => `<path transform="translate(${180 + i * 30} ${780 + (i % 3) * 60})" d="M0 -22 Q16 0 0 12 Q-16 0 0 -22 Z"/>`).join('')}</g>
        <text x="200" y="1500" font-family="Anton" font-size="80" fill="#fff">OCEANO</text>
        <text x="620" y="1500" font-family="Anton" font-size="80" fill="#fff">CONTINENTE</text>
      </svg>
      ${tag('O VENTO LEVA A UMIDADE')}`)}

    ${clip('seca', `
      <div style="position:absolute;inset:0;background:linear-gradient(180deg,#f0a35e,#f7d9a0)"></div>
      <svg class="art" viewBox="0 0 ${W} ${H}">
        <circle cx="820" cy="430" r="140" fill="#fff3c4"/>
        <rect x="0" y="880" width="330" height="1040" fill="#1f6fb2"/>
        <g id="se-clouds">${cloud(170, 640, 0.9)}${cloud(120, 470, 0.6)}</g>
        <g id="se-rain" stroke="#9fd6ff" stroke-width="5">${Array.from({ length: 10 }, (_, i) => `<line x1="${80 + i * 22}" y1="${720 + (i % 3) * 30}" x2="${70 + i * 22}" y2="${800 + (i % 3) * 30}"/>`).join('')}</g>
        <rect x="330" y="880" width="750" height="1040" fill="#b88a55"/>
        <g id="se-cracks" stroke="#5a3d22" stroke-width="7" fill="none" stroke-linecap="round">
          <path d="M420 1000 L520 1110 L500 1250 L620 1360 L600 1520" pathLength="1"/>
          <path d="M700 960 L760 1090 L900 1150 L940 1300 L1060 1380" pathLength="1"/>
          <path d="M520 1110 L640 1080 L760 1090" pathLength="1"/><path d="M620 1360 L780 1420 L940 1300" pathLength="1"/>
          <path d="M600 1520 L720 1640 L700 1800" pathLength="1"/><path d="M780 1420 L860 1600 L1000 1660" pathLength="1"/>
        </g>
      </svg>
      ${tag('A CHUVA SUMIU')}`)}

    ${clip('colheita', `
      <div style="position:absolute;inset:0;background:linear-gradient(180deg,#f5b26b,#fde3b0)"></div>
      <svg class="art" viewBox="0 0 ${W} ${H}">
        <rect x="0" y="1300" width="1080" height="620" fill="#a8753f"/>
        ${Array.from({ length: 7 }, (_, i) => `<g class="co-plant" transform="translate(${90 + i * 150} 1320)"><g class="co-stalk"><rect x="-8" y="-560" width="16" height="560" fill="#3f8f3a"/><path d="M0 -200 Q-120 -260 -150 -180" stroke="#4aa043" stroke-width="22" fill="none" stroke-linecap="round"/><path d="M0 -320 Q120 -380 150 -300" stroke="#4aa043" stroke-width="22" fill="none" stroke-linecap="round"/><path d="M0 -440 Q-110 -500 -130 -420" stroke="#4aa043" stroke-width="20" fill="none" stroke-linecap="round"/><ellipse cx="22" cy="-360" rx="20" ry="60" fill="#f2c94c"/><path d="M0 -560 L-30 -640 M0 -560 L0 -650 M0 -560 L30 -640" stroke="#e8d27a" stroke-width="8"/></g></g>`).join('')}
      </svg>
      <canvas data-hf-particles="stars" data-count="50" data-colors="#fff1a8" data-seed="9" data-start="colheita.start" data-end="colheita.end" style="position:absolute;left:0;right:0;top:600px;height:700px;width:100%"></canvas>
      ${tag('SEM VENTO, SEM PÓLEN')}`)}

    ${clip('planeta', `
      <div style="position:absolute;inset:0;background:radial-gradient(70% 50% at 50% 42%,#0d1a3a,#05060c 80%)"></div>
      <canvas data-hf-particles="stars" data-count="160" data-colors="#ffffff" data-seed="2" data-start="planeta.start" data-end="planeta.end" style="position:absolute;inset:0;width:100%;height:100%"></canvas>
      <div id="pl-earth" style="position:absolute;left:190px;top:420px;width:700px;height:700px;border-radius:50%;background:linear-gradient(180deg,#e9f6ff 0%,#5ec8ff 24%,#2f7fbf 38%,#ff9a1f 46%,#ff4d4d 50%,#ff9a1f 54%,#2f7fbf 62%,#5ec8ff 76%,#e9f6ff 100%);box-shadow:0 0 120px rgba(94,200,255,.35),inset -60px -40px 120px rgba(0,0,0,.45)"></div>
      <div id="pl-hot" style="position:absolute;left:190px;top:700px;width:700px;height:140px;border-radius:50%;background:radial-gradient(closest-side,rgba(255,77,77,.9),transparent);filter:blur(10px);opacity:0"></div>
      <div id="pl-l1" class="big red" style="position:absolute;top:740px;left:0;width:100%;font-size:70px;opacity:0;text-shadow:0 6px 20px #000">FERVENDO</div>
      <div id="pl-l2" class="big blue" style="position:absolute;top:300px;left:0;width:100%;font-size:70px;opacity:0;text-shadow:0 6px 20px #000">CONGELANDO</div>
      <div id="pl-l3" class="big blue" style="position:absolute;top:1150px;left:0;width:100%;font-size:70px;opacity:0;text-shadow:0 6px 20px #000">CONGELANDO</div>`)}

    ${clip('calma', `
      <div style="position:absolute;inset:0;background:${SKY_DAY}"></div>
      <svg class="art" viewBox="0 0 ${W} ${H}">
        <g id="cm-sun" transform="translate(540 420)"><circle r="130" fill="#ffe27a"/>${Array.from({ length: 12 }, (_, i) => `<rect x="-8" y="-230" width="16" height="60" rx="8" fill="#ffe27a" transform="rotate(${i * 30})"/>`).join('')}</g>
        <g id="cm-wind" stroke="rgba(255,255,255,.85)" stroke-width="10" stroke-linecap="round" fill="none">
          <path d="M80 760 Q300 700 520 760 T960 760"/><path d="M40 880 Q260 820 480 880 T900 880"/><path d="M140 1000 Q360 940 580 1000 T1000 1000"/>
        </g>
        <path d="M0 1260 Q300 1150 600 1240 T1080 1210 L1080 1920 L0 1920 Z" fill="#4c9a4a"/>
        <g id="cm-kite">${kite('', 760, 640, '#ff4d4d')}</g>
        <path id="cm-string" d="M760 750 Q640 1050 470 1330" stroke="#fff" stroke-width="4" fill="none"/>
        ${pinwheel('cm-pin', 250, 1180, 0.9)}
        ${tito(470, 1420, 1.2)}
      </svg>
      <div id="cm-card" class="card" style="top:180px;opacity:0"><div class="big gold" style="font-size:110px">O VENTO NASCE<br>DO SOL</div></div>`)}

    ${clip('comenta', `
      <div style="position:absolute;inset:0;background:radial-gradient(80% 60% at 50% 40%,#1b2a55,#05060c 75%)"></div>
      <div id="co-q" class="big" style="position:absolute;top:330px;width:100%;font-size:190px">E <span class="gold">VOCÊ?</span></div>
      <svg class="art" viewBox="0 0 ${W} ${H}"><g id="co-bubble" transform="translate(540 820)"><path d="M-300 -150 Q-300 -220 -230 -220 L230 -220 Q300 -220 300 -150 L300 90 Q300 160 230 160 L-60 160 L-170 260 L-150 160 L-230 160 Q-300 160 -300 90 Z" fill="#5ec8ff"/><circle cx="-120" cy="-30" r="34" fill="#05060c"/><circle cx="0" cy="-30" r="34" fill="#05060c"/><circle cx="120" cy="-30" r="34" fill="#05060c"/></g></svg>
      <div id="co-cta" class="big" style="position:absolute;top:1110px;width:100%;font-size:110px">COMENTA <span class="blue">AÍ!</span></div>`)}

    ${clip('final', `
      <div style="position:absolute;inset:0;background:radial-gradient(90% 60% at 50% 35%,#2a1f4a,#05060c 75%)"></div>
      <canvas data-hf-particles="confetti" data-count="120" data-colors="#ffc83d,#ff4d4d,#5ec8ff,#6be37a" data-seed="5" data-start="final.start" data-end="final.end" style="position:absolute;inset:0;width:100%;height:100%"></canvas>
      <div class="big gold" id="fi-logo" style="position:absolute;top:470px;width:100%;font-size:150px;text-shadow:0 10px 0 #8a5a00">HISTÓRIAS<br>DO TABOCAL</div>
      <div id="fi-q" style="position:absolute;top:860px;width:100%;text-align:center;font:900 56px Montserrat">Gostou dessa história?</div>
      <div id="fi-cta" class="big" style="position:absolute;top:1010px;left:60px;right:60px;font-size:92px"><span class="red">CURTA</span> · <span class="blue">COMENTE</span><br>E <span class="gold">SIGA O PERFIL!</span></div>
      <div style="position:absolute;top:1300px;width:100%;text-align:center;font:900 46px Montserrat;color:#ffc83d">${HANDLE}</div>`, '', 'zoom-out 0.7 out-expo')}

    <div data-hf-captions="captions.json" data-style="pop" data-max-words="4" data-max-chars="26" data-start="0" data-end="${END_START}" data-track="90"></div>
  </div>

<script>
  // Cada timeline é registrada no início da sua cena: os tempos abaixo são relativos à cena.
  const T = (id) => document.getElementById(id);
  const reg = (scene, build) => { const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } }); build(tl); hf.register(tl, { start: scene }); };

  reg('abertura', (tl) => {
    tl.from('#ab-ese', { scale: 1.9, duration: 0.6, ease: 'back.out(1.6)' }, 0) // visível já no 1º quadro (capa)
      .from('#ab-title', { y: 80, opacity: 0, duration: 0.6 }, ${rel('abertura', at(0) + 1.0)})
      .fromTo('#ab-streaks line', { x: -400 }, { x: 900, duration: 1.4, ease: 'none', repeat: 4, stagger: { each: 0.08, repeat: 4 } }, 0)
      .fromTo('#ab-clouds', { x: -120 }, { x: 160, duration: ${S.abertura!.dur}, ease: 'none' }, 0);
  });

  reg('tabocal', (tl) => {
    const stop = ${rel('tabocal', windStop)};
    tl.fromTo(['#tb-cloth1', '#tb-cloth2', '#tb-cloth3'], { rotation: -10, transformOrigin: '50% 0%' }, { rotation: 10, duration: 0.45, ease: 'sine.inOut', yoyo: true, repeat: Math.max(1, Math.floor(stop / 0.45) - 1), stagger: 0.12 }, 0)
      .to(['#tb-cloth1', '#tb-cloth2', '#tb-cloth3'], { rotation: 0, duration: 0.8, ease: 'power2.out' }, stop)
      .fromTo('#tb-leaves', { rotation: -3, transformOrigin: '50% 100%' }, { rotation: 3, duration: 0.6, ease: 'sine.inOut', yoyo: true, repeat: Math.max(1, Math.floor(stop / 0.6) - 1) }, 0)
      .to('#tb-leaves', { rotation: 0, duration: 0.8 }, stop)
      .fromTo('#tb-clouds', { x: 0 }, { x: 140, duration: stop, ease: 'none' }, 0)
      .fromTo('#tb-stop', { opacity: 0, scale: 1.6 }, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2)' }, stop + 0.1)
      .to('#tb-stop', { opacity: 0, duration: 0.4 }, stop + 2.2);
  });

  reg('pipas', (tl) => {
    tl.fromTo('.pp-kite', { y: 0, rotation: 0 }, { y: 1500, rotation: (i) => [-200, 160, 240][i], duration: 2.6, ease: 'power2.in', stagger: 0.35 }, 0.3)
;
  });

  reg('turbinas', (tl) => {
    tl.from('#turbinas .card', { y: -60, opacity: 0, duration: 0.5 }, ${rel('turbinas', at(4) + 1.6)})
      .to('#tu-dark', { opacity: 0.35, duration: 1.2 }, ${rel('turbinas', at(4) + 3.2)});
  });

  reg('calor', (tl) => {
    tl.fromTo('#ca-merc', { attr: { y: 360, height: 80 } }, { attr: { y: 60, height: 380 }, duration: ${S.calor!.dur}, ease: 'power1.inOut' }, 0)
      .to('#ca-smog', { opacity: 1, duration: ${S.calor!.dur}, ease: 'power1.in' }, 0)
      .fromTo('#ca-sun', { attr: { r: 150 } }, { attr: { r: 210 }, duration: ${S.calor!.dur}, ease: 'none' }, 0);
  });

  reg('chamada', (tl) => {
    tl.from('#ch-heart', { scale: 0, transformOrigin: '50% 50%', duration: 0.5, ease: 'back.out(2.2)' }, 0.2)
      .to('#ch-heart', { scale: 1.12, transformOrigin: '50% 50%', duration: 0.35, yoyo: true, repeat: 7, ease: 'sine.inOut' }, 0.8)
      .from('#ch-text', { y: 60, opacity: 0, duration: 0.5 }, 0.5);
  });

  reg('umidade', (tl) => {
    tl.fromTo('.um-a', { strokeDashoffset: 0 }, { strokeDashoffset: -350, duration: 3, ease: 'none' }, 0)
      .fromTo('#um-drops path', { x: 0, opacity: 1 }, { x: 640, opacity: 0.2, duration: 2.6, stagger: 0.12, ease: 'none' }, 0.2)
      .to('#um-arrows', { opacity: 0, duration: 0.8 }, ${rel('umidade', at(8) - 0.3)});
  });

  reg('seca', (tl) => {
    tl.fromTo('#se-cracks path', { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6, stagger: 0.25, ease: 'power1.inOut' }, ${rel('seca', at(8) + 1.2)})
      .fromTo('#se-rain line', { y: 0 }, { y: 60, duration: 0.4, repeat: 12, ease: 'none' }, 0);
  });

  reg('colheita', (tl) => {
    tl.to('.co-stalk', { rotation: (i) => (i % 2 ? 22 : -18), transformOrigin: '50% 100%', duration: 2.4, stagger: 0.1, ease: 'power2.in' }, ${rel('colheita', at(9) + 2.0)})
      .to('.co-stalk path, .co-stalk rect', { stroke: '#8a6b3a', fill: '#8a6b3a', duration: 2.4 }, ${rel('colheita', at(9) + 2.0)});
  });

  reg('planeta', (tl) => {
    tl.from('#pl-earth', { scale: 0.6, opacity: 0, duration: 0.8 }, 0)
      .to('#pl-earth', { rotation: 25, duration: ${S.planeta!.dur}, ease: 'none' }, 0)
      .to('#pl-hot', { opacity: 1, duration: 1.2 }, ${rel('planeta', at(10) + 3.6)})
      .to('#pl-l1', { opacity: 1, duration: 0.4 }, ${rel('planeta', at(10) + 3.8)})
      .to(['#pl-l2', '#pl-l3'], { opacity: 1, duration: 0.4 }, ${rel('planeta', at(10) + 5.0)});
  });

  reg('calma', (tl) => {
    const back = ${rel('calma', windBack)};
    tl.fromTo('#cm-card', { opacity: 0, y: -40 }, { opacity: 1, y: 0, duration: 0.5 }, back - 0.3)
      .fromTo('#cm-wind', { opacity: 0, x: -300 }, { opacity: 1, x: 0, duration: 1.2 }, back)
      .fromTo('#cm-kite', { y: 700, opacity: 0 }, { y: 0, opacity: 1, duration: 2.4, ease: 'power2.out' }, ${rel('calma', at(12))})
      .fromTo('#cm-string', { opacity: 0 }, { opacity: 1, duration: 1 }, ${rel('calma', at(12) + 1.2)})
      .to('#cm-kite', { rotation: 8, transformOrigin: '50% 0%', duration: 0.8, yoyo: true, repeat: 6, ease: 'sine.inOut' }, ${rel('calma', at(12) + 2.4)});
  });

  reg('comenta', (tl) => {
    tl.from('#co-q', { scale: 1.8, opacity: 0, duration: 0.5, ease: 'back.out(1.8)' }, 0.1)
      .from('#co-bubble', { scale: 0, transformOrigin: '50% 50%', duration: 0.5, ease: 'back.out(2)' }, ${rel('comenta', at(13) + 2.6)})
      .from('#co-cta', { y: 60, opacity: 0, duration: 0.5 }, ${rel('comenta', at(13) + 3.1)});
  });

  // Rotações com pivô no eixo de cada peça (o grupo gira em torno da própria origem), em função do tempo.
  const spin = (id, deg) => {
    const el = T(id);
    if (el.dataset.base === undefined) el.dataset.base = el.getAttribute('transform') || ''; // mantém o translate original
    el.setAttribute('transform', el.dataset.base + ' rotate(' + deg.toFixed(2) + ')');
  };
  const coast = (w, tau, x) => w * tau * (1 - Math.exp(-Math.max(0, x) / tau)); // desacelera até parar
  hf.onFrame((t) => {
    const tb = t - ${S.tabocal!.start}, stop = ${rel('tabocal', windStop)};
    spin('tb-pin', tb < stop ? 620 * tb : 620 * stop + coast(620, 0.4, tb - stop));
    spin('pp-mill', coast(160, 1.1, t - ${S.pipas!.start}));
    [0, 1, 2].forEach((i) => spin('tu-' + (i + 1), i * 40 + coast(240, 0.9 + i * 0.25, t - ${S.turbinas!.start})));
    const cm = t - ${S.calma!.start}, back = ${rel('calma', windBack)};
    const x = Math.max(0, cm - back);
    spin('cm-pin', 520 * (x - 0.8 * (1 - Math.exp(-x / 0.8))));
    spin('cm-sun', 6 * Math.max(0, cm));
  });

  reg('final', (tl) => {
    tl.from('#fi-logo', { scale: 1.5, opacity: 0, duration: 0.6, ease: 'back.out(1.6)' }, 0.1)
      .from('#fi-q', { opacity: 0, y: 30, duration: 0.5 }, 0.7)
      .from('#fi-cta', { opacity: 0, y: 40, duration: 0.5 }, 1.1);
  });
</script>
</body>
</html>
`;
  await writeFile(path.join(DIR, 'index.html'), html);
  const narr = path.relative(DIR, n.audio).split(path.sep).join('/');
  const manifest = {
    name: 'E SE...? EP02 — E se parasse de ventar no mundo?',
    entry: 'index.html',
    audio: [
      { id: 'narracao', src: narr, start: OFFSET, role: 'narration' },
      { id: 'vento', src: 'assets/vento.mp3', start: 0, duration: r3(windStop + 1.2), volume: 0.55, fadeIn: 0.5, fadeOut: 1.4, role: 'sfx' },
      { id: 'vento-volta', src: 'assets/vento.mp3', start: r3(windBack), mediaStart: 10, duration: r3(S.calma!.end - windBack), volume: 0.35, fadeIn: 1.5, fadeOut: 1.5, role: 'sfx' },
      { id: 'trilha', src: 'assets/trilha.mp3', start: 0, duration: TOTAL, volume: 0.55, fadeIn: 1.5, fadeOut: 2.5, role: 'music', duckUnder: 'narration' },
    ],
    captions: { src: 'captions.json', embed: true, language: 'pt-BR' },
    output: { file: 'renders/ep02-e-se-parasse-de-ventar.mp4', loudness: -14 },
  };
  await writeFile(path.join(DIR, 'hyperframes.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log(`ok: ${path.relative(process.cwd(), DIR)} (${TOTAL}s)`);
}

await main();

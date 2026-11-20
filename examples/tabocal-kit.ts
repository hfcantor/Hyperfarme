/**
 * Kit da série "E SE...? | HISTÓRIAS DO TABOCAL" — partes comuns a todos os episódios:
 * identidade (fontes, cores, legendas), personagens e elementos em SVG, narração,
 * áudio sintetizado, tempos ancorados nas falas e as cenas fixas (chamada, comenta, final).
 * Cada episódio define o roteiro (LINES) e as suas cenas; o kit monta o projeto.
 */
import { mkdir, writeFile, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ffmpeg } from '@hfr/media';
import { buildNarration, type TtsProviderName } from '@hfr/voice';
import type { CaptionDocument } from '@hfr/core';

export const W = 1080, H = 1920, FPS = 30;
export const OFFSET = 1.2; // a abertura aparece antes da primeira fala
export const HANDLE = '@historiasdotabocal';
export const SERIES = 'HISTÓRIAS DO TABOCAL';
const KIT_DIR = path.dirname(fileURLToPath(import.meta.url));

export type Emph = 'gold' | 'blue' | 'red' | 'green' | 'orange';
export interface Line { id: string; text: string; pause: number; emph: Record<string, Emph> }

export const COLORS: Record<Emph, string> = { gold: '#ffc83d', blue: '#5ec8ff', red: '#ff4d4d', green: '#6be37a', orange: '#ff9a1f' };
export const norm = (w: string) => w.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
export const r3 = (n: number) => Math.round(n * 1000) / 1000;

// ------------------------------------------------------------- arte SVG
export const tito = (x: number, y: number, s = 1, flip = false, lookUp = false) => `
  <g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})">
    <ellipse cx="0" cy="250" rx="70" ry="14" fill="rgba(0,0,0,.25)"/>
    <rect x="-34" y="150" width="26" height="100" rx="12" fill="#2b3a67"/><rect x="8" y="150" width="26" height="100" rx="12" fill="#2b3a67"/>
    <rect x="-48" y="40" width="96" height="125" rx="40" fill="#ff7a3d"/>
    <rect x="-70" y="55" width="26" height="90" rx="13" fill="#e8b28a" transform="rotate(12 -57 60)"/>
    <rect x="44" y="55" width="26" height="90" rx="13" fill="#e8b28a" transform="rotate(-25 57 60)"/>
    <g ${lookUp ? 'transform="rotate(-14 0 30)"' : ''}>
      <circle cx="0" cy="0" r="52" fill="#e8b28a"/>
      <path d="M-56 -8 Q-50 -62 0 -62 Q52 -62 58 -10 L-56 -10 Z" fill="#1f6f43"/><rect x="0" y="-18" width="78" height="14" rx="7" fill="#1f6f43"/>
      <circle cx="16" cy="${lookUp ? -2 : 4}" r="6" fill="#222"/><circle cx="-14" cy="${lookUp ? -2 : 4}" r="6" fill="#222"/>
      ${lookUp ? '<ellipse cx="2" cy="28" rx="10" ry="12" fill="#7a3b2a"/>' : '<path d="M-10 26 Q2 34 14 26" stroke="#7a3b2a" stroke-width="5" fill="none" stroke-linecap="round"/>'}
    </g>
  </g>`;

export const cloud = (x: number, y: number, s: number, fill = '#fff') => `
  <g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="110" ry="55" fill="${fill}"/><ellipse cx="-80" cy="20" rx="80" ry="45" fill="${fill}"/><ellipse cx="90" cy="20" rx="85" ry="45" fill="${fill}"/><ellipse cx="10" cy="-35" rx="70" ry="50" fill="${fill}"/></g>`;

/** Lua cheia com crateras (r = raio). */
export const moon = (id: string, x: number, y: number, r: number) => `
  <g id="${id}" transform="translate(${x} ${y})">
    <circle r="${r * 1.9}" fill="rgba(255,248,220,.10)"/><circle r="${r * 1.45}" fill="rgba(255,248,220,.16)"/>
    <circle r="${r}" fill="#f4efd9"/>
    <circle cx="${-r * 0.35}" cy="${-r * 0.25}" r="${r * 0.2}" fill="#d9d2b6"/><circle cx="${r * 0.3}" cy="${r * 0.2}" r="${r * 0.27}" fill="#ddd6bb"/>
    <circle cx="${r * 0.1}" cy="${-r * 0.5}" r="${r * 0.1}" fill="#d5ceb1"/><circle cx="${-r * 0.4}" cy="${r * 0.45}" r="${r * 0.12}" fill="#d9d2b6"/>
  </g>`;

/** Vila do Tabocal à noite (casas, coqueiro, chão). */
export const nightVillage = () => `
  <path d="M0 1240 Q300 1140 600 1220 T1080 1190 L1080 1920 L0 1920 Z" fill="#1c3a2a"/>
  <path d="M0 1380 Q350 1290 700 1360 T1080 1340 L1080 1920 L0 1920 Z" fill="#163024"/>
  <g transform="translate(650 1060)"><rect x="0" y="80" width="300" height="200" fill="#3b3550"/><path d="M-30 90 L150 -20 L330 90 Z" fill="#5a2f3a"/><rect x="120" y="170" width="70" height="110" fill="#2a2030"/><rect x="30" y="130" width="60" height="55" fill="#ffd27a"/></g>
  <g transform="translate(150 1250)"><path d="M0 0 Q20 -260 -10 -520" stroke="#3a2a1c" stroke-width="26" fill="none"/>
    <g transform="translate(-10 -520)" fill="#204a2c"><path d="M0 0 Q-160 -40 -240 60 Q-140 10 0 0"/><path d="M0 0 Q160 -50 240 50 Q140 0 0 0"/><path d="M0 0 Q-60 -150 -170 -170 Q-60 -100 0 0"/><path d="M0 0 Q70 -150 180 -160 Q70 -90 0 0"/></g></g>`;

export const tag = (text: string, extra = '') => `<div class="tag" ${extra}>${text}</div>`;

// ---------------------------------------------------------------- estilo
export function baseHead(lines: Line[]): string {
  const emph = Object.entries(Object.fromEntries(lines.flatMap((l) => Object.entries(l.emph).map(([w, c]) => [norm(w), c] as const))))
    .map(([w, c]) => `[data-hf-captions] .hf-cap-word[data-word="${w}"]{color:${COLORS[c as Emph]}}`).join('\n    ');
  return `<script src="/__hf/lib/gsap.js"></script>
  <style>
    @font-face{font-family:Anton;src:url(assets/fonts/anton-latin-400-normal.woff2) format("woff2");font-display:block}
    @font-face{font-family:Montserrat;font-weight:800;src:url(assets/fonts/montserrat-latin-800-normal.woff2) format("woff2");font-display:block}
    @font-face{font-family:Montserrat;font-weight:900;src:url(assets/fonts/montserrat-latin-900-normal.woff2) format("woff2");font-display:block}
    #stage{font-family:Montserrat,system-ui,sans-serif;color:#f4f4f8}
    .scene{position:absolute;inset:0;overflow:hidden}
    .scene svg.art{position:absolute;inset:0;width:100%;height:100%}
    .big{font-family:Anton,Impact,sans-serif;text-transform:uppercase;line-height:.95;text-align:center;letter-spacing:.01em}
    .gold{color:#ffc83d}.blue{color:#5ec8ff}.red{color:#ff4d4d}.green{color:#6be37a}.orange{color:#ff9a1f}
    .tag{position:absolute;top:150px;left:50%;translate:-50% 0;padding:14px 30px;border-radius:999px;background:rgba(5,6,12,.72);font:800 34px Montserrat;letter-spacing:.08em;text-transform:uppercase;white-space:nowrap;border:2px solid rgba(255,200,61,.6)}
    .badge{position:absolute;top:70px;left:50%;translate:-50% 0;font:900 30px Montserrat;letter-spacing:.18em;color:#ffc83d;white-space:nowrap;text-shadow:0 3px 12px rgba(0,0,0,.5)}
    .card{position:absolute;left:90px;right:90px;padding:40px;border-radius:40px;background:rgba(5,6,12,.78);text-align:center;box-shadow:0 30px 80px rgba(0,0,0,.4)}
    .vignette{position:absolute;inset:0;background:radial-gradient(120% 80% at 50% 45%,transparent 55%,rgba(0,0,0,.55));pointer-events:none}
    .title-card{position:absolute;top:790px;left:70px;right:70px;padding:34px 20px 40px;border-radius:44px;background:rgba(5,6,12,.72);font-size:118px;color:#fff;box-shadow:0 24px 60px rgba(0,0,0,.35)}
    .ese{position:absolute;top:470px;width:100%;font-size:230px;-webkit-text-stroke:8px #5a3a00;paint-order:stroke fill;text-shadow:0 12px 0 #8a5a00,0 30px 60px rgba(0,0,0,.45)}
    [data-hf-captions]{top:1290px;bottom:auto !important;left:60px;right:60px;font:900 76px/1.08 Montserrat;text-transform:uppercase;--hf-cap-active:#ffffff;--hf-cap-color:#fff;text-shadow:0 5px 0 rgba(0,0,0,.55),0 8px 30px rgba(0,0,0,.6)}
    ${emph}
  </style>`;
}

// ------------------------------------------------------------------ áudio
export async function narrate(lines: Line[], dir: string) {
  const provider = (process.env.HFR_TTS_PROVIDER as TtsProviderName | undefined) ?? (process.env.HFR_TTS_COMMAND ? 'command' : undefined);
  return buildNarration(lines.map((l) => ({ text: l.text, pauseAfter: l.pause })), {
    outDir: path.join(dir, 'assets', 'narracao'), provider, voice: 'pt-br', language: 'pt-BR',
  });
}

const mp3 = ['-ac', '2', '-c:a', 'libmp3lame', '-b:a', '128k'];

/** Trilha de mistério: drone grave + acordes lentos. */
export async function mysteryScore(file: string, seconds: number) {
  const expr = [
    '0.16*sin(2*PI*55*t)*(0.7+0.3*sin(2*PI*0.05*t))', '0.10*sin(2*PI*82.41*t)*(0.6+0.4*sin(2*PI*0.08*t+1))',
    '0.07*sin(2*PI*130.81*t)*(0.5+0.5*sin(2*PI*0.11*t+2))', '0.05*sin(2*PI*196*t)*(0.5+0.5*sin(2*PI*0.13*t+3))',
    '0.035*sin(2*PI*329.63*t)*(0.5+0.5*sin(2*PI*0.17*t))', '0.06*sin(2*PI*41.2*t)*exp(-3*mod(t,4))',
  ].join('+');
  await ffmpeg(['-f', 'lavfi', '-i', `aevalsrc='${expr}':s=44100:d=${seconds}`, '-af', 'aecho=0.8:0.7:600:0.3,lowpass=f=2500', ...mp3, file]);
}

/** Vento: ruído rosa filtrado com rajadas lentas. */
export async function windSfx(file: string, seconds: number) {
  await ffmpeg(['-f', 'lavfi', '-i', `anoisesrc=color=pink:amplitude=0.6:duration=${seconds}:seed=7`,
    '-af', 'lowpass=f=700,highpass=f=80,tremolo=f=0.18:d=0.55,tremolo=f=0.11:d=0.4,volume=0.9', ...mp3, file]);
}

/** Grilos: trinados agudos em grupos irregulares sobre um leve ruído noturno. */
export async function cricketsSfx(file: string, seconds: number) {
  const chirp = (f: number, rate: number, period: number, phase: number, amp: number) =>
    `${amp}*sin(2*PI*${f}*t)*gt(sin(2*PI*${rate}*t),0.3)*lt(mod(t+${phase},${period}),${(period * 0.35).toFixed(2)})`;
  const expr = [chirp(4400, 28, 1.3, 0, 0.09), chirp(4900, 31, 1.7, 0.4, 0.06), chirp(4100, 25, 2.1, 0.9, 0.05)].join('+');
  await ffmpeg(['-f', 'lavfi', '-i', `aevalsrc='${expr}':s=44100:d=${seconds}`, '-f', 'lavfi', '-i', `anoisesrc=color=brown:amplitude=0.04:duration=${seconds}:seed=3`,
    '-filter_complex', '[0][1]amix=inputs=2:normalize=0,highpass=f=120,aecho=0.6:0.5:120:0.25', ...mp3, file]);
}

// ---------------------------------------------------------------- tempos
export interface SceneSpec { id: string; line?: number; from?: number }
export interface Timing {
  at(i: number): number; endOf(i: number): number;
  S: Record<string, { start: number; end: number; dur: number }>;
  rel(scene: string, t: number): number;
  clip(id: string, inner: string, enter?: string): string;
  END_START: number; TOTAL: number;
}

export function timing(n: Awaited<ReturnType<typeof narrate>>, specs: SceneSpec[], lines: Line[], tail = 4.0): Timing {
  const at = (i: number) => r3(OFFSET + n.lines[i]!.start);
  const endOf = (i: number) => r3(OFFSET + n.lines[i]!.end);
  const END_START = r3(endOf(lines.length - 1) + 0.6);
  const TOTAL = r3(END_START + tail);
  const withFinal = [...specs, { id: 'final', from: END_START }];
  const scenes = withFinal.map((s) => ({ ...s, start: s.from ?? r3(Math.max(0, at(s.line!) - 0.25)) }));
  const S = Object.fromEntries(scenes.map((s, i) => {
    const next = scenes[i + 1];
    const end = next ? r3(next.start + 0.45) : TOTAL;
    return [s.id, { start: s.start, end, dur: r3(end - s.start) }];
  })) as Timing['S'];
  return {
    at, endOf, S, END_START, TOTAL,
    rel: (scene, t) => r3(t - S[scene]!.start),
    clip: (id, inner, enter = 'fade 0.45') =>
      `<section id="${id}" class="scene" data-name="${id}" data-start="${S[id]!.start}" data-end="${S[id]!.end}" data-enter="${enter}">${inner}\n    </section>`,
  };
}

export function shiftedCaptions(n: Awaited<ReturnType<typeof narrate>>): CaptionDocument {
  return {
    language: 'pt-BR',
    cues: n.document.cues.map((c) => ({ ...c, start: c.start + OFFSET, end: c.end + OFFSET, words: c.words?.map((w) => ({ ...w, start: w.start + OFFSET, end: w.end + OFFSET })) })),
  };
}

// ----------------------------------------------------- cenas da série
/** Chamada do meio (curte e segue), "E você? Comenta aí!" e tela final. */
export function seriesScenes(t: Timing, o: { commentLine: number }) {
  const html = {
    chamada: t.clip('chamada', `
      <div style="position:absolute;inset:0;background:radial-gradient(80% 60% at 50% 40%,#1b2a55,#05060c 75%)"></div>
      <svg class="art" viewBox="0 0 ${W} ${H}"><g id="ch-heart" transform="translate(540 640)"><path d="M0 120 C-220 -20 -180 -220 -40 -200 C0 -195 0 -150 0 -150 C0 -150 0 -195 40 -200 C180 -220 220 -20 0 120 Z" fill="#ff4d4d" transform="scale(1.6)"/></g></svg>
      <div id="ch-text" class="big" style="position:absolute;top:960px;width:100%;font-size:120px">CURTE E <span class="gold">SEGUE</span></div>
      <div style="position:absolute;top:1110px;width:100%;text-align:center;font:900 48px Montserrat;color:#ffc83d">${HANDLE}</div>`),
    comenta: t.clip('comenta', `
      <div style="position:absolute;inset:0;background:radial-gradient(80% 60% at 50% 40%,#1b2a55,#05060c 75%)"></div>
      <div id="co-q" class="big" style="position:absolute;top:330px;width:100%;font-size:190px">E <span class="gold">VOCÊ?</span></div>
      <svg class="art" viewBox="0 0 ${W} ${H}"><g id="co-bubble" transform="translate(540 820)"><path d="M-300 -150 Q-300 -220 -230 -220 L230 -220 Q300 -220 300 -150 L300 90 Q300 160 230 160 L-60 160 L-170 260 L-150 160 L-230 160 Q-300 160 -300 90 Z" fill="#5ec8ff"/><circle cx="-120" cy="-30" r="34" fill="#05060c"/><circle cx="0" cy="-30" r="34" fill="#05060c"/><circle cx="120" cy="-30" r="34" fill="#05060c"/></g></svg>
      <div id="co-cta" class="big" style="position:absolute;top:1110px;width:100%;font-size:110px">COMENTA <span class="blue">AÍ!</span></div>`),
    final: t.clip('final', `
      <div style="position:absolute;inset:0;background:radial-gradient(90% 60% at 50% 35%,#2a1f4a,#05060c 75%)"></div>
      <canvas data-hf-particles="confetti" data-count="120" data-colors="#ffc83d,#ff4d4d,#5ec8ff,#6be37a" data-seed="5" data-start="final.start" data-end="final.end" style="position:absolute;inset:0;width:100%;height:100%"></canvas>
      <div class="big gold" id="fi-logo" style="position:absolute;top:470px;width:100%;font-size:150px;text-shadow:0 10px 0 #8a5a00">HISTÓRIAS<br>DO TABOCAL</div>
      <div id="fi-q" style="position:absolute;top:860px;width:100%;text-align:center;font:900 56px Montserrat">Gostou dessa história?</div>
      <div id="fi-cta" class="big" style="position:absolute;top:1010px;left:60px;right:60px;font-size:92px"><span class="red">CURTA</span> · <span class="blue">COMENTE</span><br>E <span class="gold">SIGA O PERFIL!</span></div>
      <div style="position:absolute;top:1300px;width:100%;text-align:center;font:900 46px Montserrat;color:#ffc83d">${HANDLE}</div>`, 'zoom-out 0.7 out-expo'),
  };
  const js = `
  reg('chamada', (tl) => {
    tl.from('#ch-heart', { scale: 0, transformOrigin: '50% 50%', duration: 0.5, ease: 'back.out(2.2)' }, 0.2)
      .to('#ch-heart', { scale: 1.12, transformOrigin: '50% 50%', duration: 0.35, yoyo: true, repeat: 7, ease: 'sine.inOut' }, 0.8)
      .from('#ch-text', { y: 60, opacity: 0, duration: 0.5 }, 0.5);
  });
  reg('comenta', (tl) => {
    tl.from('#co-q', { scale: 1.8, opacity: 0, duration: 0.5, ease: 'back.out(1.8)' }, 0.1)
      .from('#co-bubble', { scale: 0, transformOrigin: '50% 50%', duration: 0.5, ease: 'back.out(2)' }, ${t.rel('comenta', t.at(o.commentLine) + 2.4)})
      .from('#co-cta', { y: 60, opacity: 0, duration: 0.5 }, ${t.rel('comenta', t.at(o.commentLine) + 2.9)});
  });
  reg('final', (tl) => {
    tl.from('#fi-logo', { scale: 1.5, opacity: 0, duration: 0.6, ease: 'back.out(1.6)' }, 0.1)
      .from('#fi-q', { opacity: 0, y: 30, duration: 0.5 }, 0.7)
      .from('#fi-cta', { opacity: 0, y: 40, duration: 0.5 }, 1.1);
  });`;
  return { html, js };
}

/** Monta e grava index.html, hyperframes.json, captions.json e as fontes. */
export async function writeEpisode(dir: string, o: {
  title: string; lines: Line[]; t: Timing; scenesHtml: string[]; scriptJs: string;
  captions: CaptionDocument; audio: Array<Record<string, unknown>>; output: string;
}) {
  await mkdir(path.join(dir, 'assets', 'fonts'), { recursive: true });
  for (const f of ['anton-latin-400-normal.woff2', 'montserrat-latin-800-normal.woff2', 'montserrat-latin-900-normal.woff2']) {
    await copyFile(path.join(KIT_DIR, 'ep02-e-se-parasse-de-ventar', 'assets', 'fonts', f), path.join(dir, 'assets', 'fonts', f));
  }
  await writeFile(path.join(dir, 'captions.json'), JSON.stringify(o.captions, null, 2));
  const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>${o.title}</title>
  ${baseHead(o.lines)}
</head>
<body>
  <div id="stage" data-composition data-width="${W}" data-height="${H}" data-fps="${FPS}" data-duration="${o.t.TOTAL}" data-background="#05060c">
    ${o.scenesHtml.join('\n\n    ')}

    <div data-hf-captions="captions.json" data-style="pop" data-max-words="4" data-max-chars="26" data-start="0" data-end="${o.t.END_START}" data-track="90"></div>
  </div>

<script>
  // Cada timeline é registrada no início da sua cena: os tempos são relativos à cena.
  const T = (id) => document.getElementById(id);
  const reg = (scene, build) => { const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } }); build(tl); hf.register(tl, { start: scene }); };
  ${o.scriptJs}
</script>
</body>
</html>
`;
  await writeFile(path.join(dir, 'index.html'), html);
  const manifest = { name: o.title, entry: 'index.html', audio: o.audio, captions: { src: 'captions.json', embed: true, language: 'pt-BR' }, output: { file: o.output, loudness: -14 } };
  await writeFile(path.join(dir, 'hyperframes.json'), JSON.stringify(manifest, null, 2) + '\n');
}

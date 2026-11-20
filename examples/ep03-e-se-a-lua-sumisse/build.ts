/**
 * E SE...? | HISTÓRIAS DO TABOCAL — EP03: "E se a Lua sumisse?"
 *
 *   node examples/ep03-e-se-a-lua-sumisse/build.ts
 *   npx hfr render examples/ep03-e-se-a-lua-sumisse --quality high
 *
 * Voz: HFR_TTS_COMMAND (ex.: edge-tts pt-BR-AntonioNeural +12%), HFR_TTS_PROVIDER ou espeak-ng.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  W, H, cloud, cricketsSfx, moon, mysteryScore, narrate, nightVillage, r3, seriesScenes, shiftedCaptions, tag, timing, tito, writeEpisode,
  type Line,
} from '../tabocal-kit.ts';

const DIR = path.dirname(fileURLToPath(import.meta.url));

export const LINES: Line[] = [
  { id: 'L01', text: 'E se... numa noite qualquer, a Lua simplesmente sumisse do céu?', pause: 0.7, emph: { lua: 'gold', sumisse: 'red', ceu: 'blue' } },
  { id: 'L02', text: 'Aqui no Tabocal, o Tito olhou para cima e não acreditou.', pause: 0.35, emph: { tabocal: 'gold', acreditou: 'red' } },
  { id: 'L03', text: 'No lugar da Lua cheia, só escuridão. A noite ficou muito mais escura.', pause: 0.7, emph: { escuridao: 'red', escura: 'red' } },
  { id: 'L04', text: 'Na manhã seguinte, o mar quase não se mexeu. Sem a Lua, só o Sol puxava as águas, e as marés ficaram bem mais fracas.', pause: 0.5, emph: { mar: 'blue', sol: 'gold', mares: 'blue', fracas: 'red' } },
  { id: 'L05', text: 'Caranguejos, peixes e aves que vivem do sobe e desce da maré perderam o seu ritmo.', pause: 0.5, emph: { caranguejos: 'orange', mare: 'blue', ritmo: 'red' } },
  { id: 'L06', text: 'Corais que se reproduzem guiados pela luz da Lua ficaram sem sinal. E muitos animais noturnos se perderam no escuro.', pause: 0.6, emph: { corais: 'orange', luz: 'gold', perderam: 'red', escuro: 'red' } },
  { id: 'L07', text: 'Se tá curtindo, já deixa o like e segue o perfil… porque o pior ainda vai acontecer.', pause: 0.55, emph: { like: 'red', segue: 'gold', pior: 'red' } },
  { id: 'L08', text: 'A Lua funciona como uma âncora: ela ajuda a manter firme a inclinação da Terra.', pause: 0.35, emph: { ancora: 'gold', inclinacao: 'blue', terra: 'blue' } },
  { id: 'L09', text: 'Sem ela, ao longo de milhões de anos, o eixo do planeta poderia balançar muito mais.', pause: 0.5, emph: { milhoes: 'gold', eixo: 'blue', balancar: 'red' } },
  { id: 'L10', text: 'E o clima mudaria de forma extrema: eras de calor sem fim, e eras cobertas de gelo.', pause: 0.6, emph: { extrema: 'red', calor: 'orange', gelo: 'blue' } },
  { id: 'L11', text: 'Nunca mais haveria um eclipse total do Sol. E os calendários que contam os meses pelas fases da Lua perderiam a referência.', pause: 0.8, emph: { eclipse: 'gold', meses: 'gold', fases: 'gold', referencia: 'red' } },
  { id: 'L12', text: 'Mas calma. Na vida real, a Lua não tem como sumir: a gravidade a mantém presa à Terra há mais de quatro bilhões de anos.', pause: 0.5, emph: { calma: 'green', gravidade: 'gold', quatro: 'gold', bilhoes: 'gold' } },
  { id: 'L13', text: 'Ou seja… hoje à noite ela vai estar lá de novo, e o Tito pode dormir tranquilo.', pause: 0.8, emph: { noite: 'blue', tranquilo: 'green' } },
  { id: 'L14', text: 'E você? Do que mais sentiria falta se a Lua sumisse? Comenta aí!', pause: 0.6, emph: { falta: 'gold', lua: 'gold', comenta: 'blue' } },
];

const NIGHT = 'linear-gradient(180deg,#050816 0%,#0f1d3d 60%,#1d2f55 100%)';
const SPACE = 'radial-gradient(70% 50% at 50% 42%,#0d1a3a,#05060c 80%)';
const stars = (scene: string, count = 160, seed = 2) =>
  `<canvas data-hf-particles="stars" data-count="${count}" data-colors="#ffffff,#cfe3ff" data-seed="${seed}" data-start="${scene}.start" data-end="${scene}.end" style="position:absolute;inset:0;width:100%;height:100%"></canvas>`;

/** Terra com continentes simples; `tilt` em graus. */
const earth = (id: string, x: number, y: number, r: number, tilt: number, axisId: string) => `
  <g transform="translate(${x} ${y})">
    <g id="${id}" transform="rotate(${tilt})">
      <defs><clipPath id="${id}-clip"><circle r="${r}"/></clipPath></defs>
      <circle r="${r * 1.08}" fill="rgba(94,200,255,.15)"/>
      <circle r="${r}" fill="#1f6fb2"/>
      <g clip-path="url(#${id}-clip)" fill="#4caf50">
        <path d="M${-r * 0.7} ${-r * 0.5} q${r * 0.3} ${-r * 0.3} ${r * 0.6} 0 q${r * 0.1} ${r * 0.4} ${-r * 0.2} ${r * 0.6} q${-r * 0.4} ${r * 0.1} ${-r * 0.4} ${-r * 0.6}z"/>
        <path d="M${r * 0.1} ${r * 0.05} q${r * 0.4} ${-r * 0.2} ${r * 0.6} ${r * 0.1} q${-r * 0.05} ${r * 0.5} ${-r * 0.35} ${r * 0.6} q${-r * 0.3} ${-r * 0.2} ${-r * 0.25} ${-r * 0.7}z"/>
        <ellipse cx="0" cy="${-r * 0.95}" rx="${r * 0.6}" ry="${r * 0.14}" fill="#e9f6ff"/><ellipse cx="0" cy="${r * 0.95}" rx="${r * 0.6}" ry="${r * 0.14}" fill="#e9f6ff"/>
      </g>
      <circle r="${r}" fill="url(#shade)"/>
      <line id="${axisId}" x1="0" y1="${-r * 1.45}" x2="0" y2="${r * 1.45}" stroke="#ffc83d" stroke-width="10" stroke-dasharray="26 16" stroke-linecap="round"/>
    </g>
  </g>`;

const SHADE_DEF = `<defs><radialGradient id="shade" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="rgba(255,255,255,.18)"/><stop offset=".6" stop-color="rgba(0,0,0,0)"/><stop offset="1" stop-color="rgba(0,0,0,.55)"/></radialGradient></defs>`;

const crab = (x: number, y: number, s: number) => `
  <g class="crab" transform="translate(${x} ${y}) scale(${s})">
    <ellipse rx="60" ry="36" fill="#e2552c"/><circle cx="-20" cy="-40" r="9" fill="#fff"/><circle cx="20" cy="-40" r="9" fill="#fff"/><circle cx="-20" cy="-40" r="4" fill="#111"/><circle cx="20" cy="-40" r="4" fill="#111"/>
    <path d="M-55 -10 q-50 -40 -30 -70 M55 -10 q50 -40 30 -70" stroke="#e2552c" stroke-width="12" fill="none" stroke-linecap="round"/>
    <path d="M-50 15 l-40 30 M-40 25 l-30 40 M50 15 l40 30 M40 25 l30 40" stroke="#c4441f" stroke-width="9" stroke-linecap="round"/>
  </g>`;

async function main() {
  console.log('narração…');
  const n = await narrate(LINES, DIR);
  const t = timing(n, [
    { id: 'abertura', from: 0 }, { id: 'tabocal', line: 1 }, { id: 'mare', line: 3 }, { id: 'vida', line: 4 }, { id: 'corais', line: 5 },
    { id: 'chamada', line: 6 }, { id: 'ancora', line: 7 }, { id: 'eixo', line: 8 }, { id: 'clima', line: 9 }, { id: 'eclipse', line: 10 },
    { id: 'calma', line: 11 }, { id: 'comenta', line: 13 },
  ], LINES);
  const { at, S, rel, clip } = t;
  console.log(`provedor ${n.provider}, duração ${t.TOTAL}s`);
  const moonGone = at(2) + 0.1; // "No lugar da Lua cheia, só escuridão."
  const moonBack = at(12) + 1.0; // "…hoje à noite ela vai estar lá de novo…"

  console.log('trilha e grilos…');
  await mysteryScore(path.join(DIR, 'assets', 'trilha.mp3'), Math.ceil(t.TOTAL) + 1);
  await cricketsSfx(path.join(DIR, 'assets', 'grilos.mp3'), Math.ceil(t.TOTAL) + 1);

  const series = seriesScenes(t, { commentLine: 13 });
  const wave = (id: string, color: string, w: number) => `<path id="${id}" d="" stroke="${color}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;

  const scenes = [
    clip('abertura', `
      <div style="position:absolute;inset:0;background:${NIGHT}"></div>
      ${stars('abertura', 180, 1)}
      <svg class="art" viewBox="0 0 ${W} ${H}">${moon('ab-moon', 760, 1330, 150)}</svg>
      <div id="ab-flash" style="position:absolute;inset:0;background:#fff;opacity:0"></div>
      <div class="vignette"></div>
      <div class="badge">HISTÓRIAS DO TABOCAL</div>
      <div id="ab-ese" class="big gold ese">E SE...?</div>
      <div id="ab-title" class="big title-card">A <span class="gold">LUA</span><br><span class="red">SUMISSE?</span></div>`, 'none'),

    clip('tabocal', `
      <div style="position:absolute;inset:0;background:${NIGHT}"></div>
      ${stars('tabocal', 140, 3)}
      <svg class="art" viewBox="0 0 ${W} ${H}">
        ${moon('tb-moon', 760, 470, 120)}
        ${nightVillage()}
        ${tito(480, 1440, 1.25, false, true)}
      </svg>
      <div id="tb-dark" style="position:absolute;inset:0;background:#000;opacity:0"></div>
      ${tag('TABOCAL · 21H', 'id="tb-tag"')}
      <div id="tb-gone" class="big red" style="position:absolute;top:330px;width:100%;font-size:170px;opacity:0;text-shadow:0 10px 0 rgba(0,0,0,.5)">SUMIU.</div>`),

    clip('mare', `
      <div style="position:absolute;inset:0;background:linear-gradient(180deg,#7fc3f0,#d6eefc)"></div>
      <svg class="art" viewBox="0 0 ${W} ${H}">
        <circle cx="840" cy="330" r="90" fill="#fff3c4"/>
        <rect x="0" y="820" width="1080" height="1100" fill="#e9d29a"/>
        <path id="mr-sea" d="" fill="#2f86c9"/>
        <g transform="translate(140 1450)">
          <rect x="-40" y="-60" width="880" height="390" rx="36" fill="rgba(5,6,12,.78)"/>
          <text x="0" y="0" font-family="Montserrat" font-weight="900" font-size="38" fill="#5ec8ff">COM LUA</text>
          <text x="0" y="170" font-family="Montserrat" font-weight="900" font-size="38" fill="#ffc83d">SEM LUA</text>
          <g transform="translate(240 -10)">${wave('mr-w1', '#5ec8ff', 9)}</g>
          <g transform="translate(240 160)">${wave('mr-w2', '#ffc83d', 9)}</g>
        </g>
      </svg>
      ${tag('MARÉS MAIS FRACAS')}`),

    clip('vida', `
      <div style="position:absolute;inset:0;background:linear-gradient(180deg,#8fd0f5,#e6f5ff)"></div>
      <svg class="art" viewBox="0 0 ${W} ${H}">
        <path d="M0 900 Q540 860 1080 900 L1080 1920 L0 1920 Z" fill="#e3c88d"/>
        <path d="M0 900 Q540 860 1080 900 L1080 1000 Q540 960 0 1000 Z" fill="#3b8fd0"/>
        ${crab(260, 1180, 1.1)}${crab(760, 1090, 0.8)}${crab(560, 1300, 0.95)}
        <g id="vi-bird" transform="translate(300 520)"><path d="M-70 0 q35 -40 70 0 q35 -40 70 0" stroke="#223" stroke-width="12" fill="none" stroke-linecap="round"/></g>
        <g id="vi-bird2" transform="translate(720 420)"><path d="M-50 0 q25 -30 50 0 q25 -30 50 0" stroke="#223" stroke-width="10" fill="none" stroke-linecap="round"/></g>
        <g transform="translate(540 1600)" id="vi-clock"><circle r="110" fill="#fff" stroke="#05060c" stroke-width="12"/><line id="vi-hand" x1="0" y1="0" x2="0" y2="-80" stroke="#ff4d4d" stroke-width="12" stroke-linecap="round"/><line x1="0" y1="0" x2="55" y2="0" stroke="#05060c" stroke-width="12" stroke-linecap="round"/></g>
      </svg>
      ${tag('PERDERAM O RITMO')}`),

    clip('corais', `
      <div style="position:absolute;inset:0;background:linear-gradient(180deg,#0b3d63,#041a2e)"></div>
      <div id="co-beam" style="position:absolute;left:330px;top:0;width:420px;height:1500px;background:linear-gradient(180deg,rgba(255,248,220,.45),rgba(255,248,220,0));clip-path:polygon(35% 0,65% 0,100% 100%,0 100%)"></div>
      <svg class="art" viewBox="0 0 ${W} ${H}">
        <path d="M0 1500 Q540 1430 1080 1500 L1080 1920 L0 1920 Z" fill="#3a2f2a"/>
        ${[[180, '#ff7a8a'], [400, '#ffb347'], [640, '#c77dff'], [880, '#ff7a8a']].map(([x, c], i) => `<g transform="translate(${x} 1500)">${Array.from({ length: 5 }, (_, k) => `<path d="M0 0 Q${(k - 2) * 30} -${120 + (k % 2) * 60} ${(k - 2) * 55} -${200 + ((k + i) % 3) * 50}" stroke="${c}" stroke-width="${22 - k}" fill="none" stroke-linecap="round"/>`).join('')}</g>`).join('')}
        ${Array.from({ length: 5 }, (_, i) => `<g class="fish" transform="translate(${150 + i * 180} ${700 + (i % 3) * 180})"><ellipse rx="44" ry="20" fill="#ffd166"/><path d="M40 0 l30 -20 v40 z" fill="#ffd166"/><circle cx="-24" cy="-4" r="5" fill="#111"/></g>`).join('')}
      </svg>
      <canvas data-hf-particles="bubbles" data-count="40" data-colors="#cfefff" data-seed="6" data-start="corais.start" data-end="corais.end" style="position:absolute;inset:0;width:100%;height:100%"></canvas>
      <div id="co-dark" style="position:absolute;inset:0;background:#000;opacity:0"></div>
      ${tag('SEM A LUZ DA LUA')}`),

    series.html.chamada,

    clip('ancora', `
      <div style="position:absolute;inset:0;background:${SPACE}"></div>
      ${stars('ancora', 160, 4)}
      <svg class="art" viewBox="0 0 ${W} ${H}">
        ${SHADE_DEF}
        <ellipse cx="540" cy="760" rx="420" ry="160" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="4" stroke-dasharray="14 14"/>
        ${earth('an-earth', 540, 760, 220, 23.5, 'an-axis')}
        <g id="an-orbit">${moon('an-moon', 960, 760, 60)}</g>
        <line id="an-rope" x1="540" y1="760" x2="960" y2="760" stroke="#ffc83d" stroke-width="5" stroke-dasharray="10 10" opacity=".7"/>
      </svg>
      <div class="card" style="top:170px;padding:26px"><div class="big gold" style="font-size:96px">A LUA É UMA ÂNCORA</div><div style="font:900 40px Montserrat;margin-top:8px">INCLINAÇÃO DA TERRA: <span class="gold">23,5°</span></div></div>`),

    clip('eixo', `
      <div style="position:absolute;inset:0;background:${SPACE}"></div>
      ${stars('eixo', 160, 5)}
      <svg class="art" viewBox="0 0 ${W} ${H}">${SHADE_DEF}${earth('ei-earth', 540, 780, 250, 23.5, 'ei-axis')}</svg>
      <div class="card" style="top:170px;padding:26px"><div id="ei-years" class="big gold" style="font-size:100px">HOJE</div><div style="font:900 40px Montserrat;margin-top:6px">SEM A LUA, O EIXO BALANÇA</div></div>`),

    clip('clima', `
      <div id="cl-hot" style="position:absolute;left:0;right:0;top:0;height:960px;background:linear-gradient(180deg,#ff8a3d,#ffcf7a)"></div>
      <div id="cl-cold" style="position:absolute;left:0;right:0;top:960px;height:960px;background:linear-gradient(180deg,#245d8f,#6fb2e0)"></div>
      <svg class="art" viewBox="0 0 ${W} ${H}">
        <circle cx="780" cy="300" r="140" fill="#fff3c4"/><circle cx="780" cy="300" r="210" fill="rgba(255,243,196,.3)"/>
        <path d="M0 860 Q200 780 420 840 T1080 800 L1080 960 L0 960 Z" fill="#d9a35a"/>
        <path d="M0 1700 L200 1500 L330 1620 L520 1380 L700 1600 L860 1480 L1080 1700 L1080 1920 L0 1920 Z" fill="#ffffff"/>
        <path d="M520 1380 L470 1440 L520 1430 L570 1450 Z" fill="#dbeefa"/>
      </svg>
      <canvas data-hf-particles="snow" data-count="120" data-colors="#ffffff" data-seed="8" data-start="clima.start" data-end="clima.end" style="position:absolute;left:0;top:960px;width:100%;height:960px"></canvas>
      <div id="cl-l1" class="big" style="position:absolute;top:470px;width:100%;font-size:110px;color:#fff;text-shadow:0 8px 0 rgba(0,0,0,.25)">ERAS DE <span class="red">CALOR</span></div>
      <div id="cl-l2" class="big" style="position:absolute;top:1010px;width:100%;font-size:110px;color:#fff;text-shadow:0 8px 0 rgba(0,0,0,.25)">ERAS DE <span style="color:#bfe9ff">GELO</span></div>`),

    clip('eclipse', `
      <div style="position:absolute;inset:0;background:${SPACE}"></div>
      ${stars('eclipse', 120, 7)}
      <svg class="art" viewBox="0 0 ${W} ${H}">
        <g transform="translate(540 560)"><circle r="260" fill="rgba(255,200,61,.18)"/><circle r="200" fill="rgba(255,200,61,.3)"/><circle r="160" fill="#ffd166"/></g>
        <circle id="ec-disc" cx="140" cy="560" r="162" fill="#05060c"/>
        <g id="ec-x" opacity="0" stroke="#ff4d4d" stroke-width="30" stroke-linecap="round"><line x1="350" y1="370" x2="730" y2="750"/><line x1="730" y1="370" x2="350" y2="750"/></g>
      </svg>
      <div id="ec-cal" class="card" style="top:930px;padding:30px 20px">
        <div style="font:900 44px Montserrat;margin-bottom:18px">FASES DA LUA</div>
        <div style="display:flex;justify-content:center;gap:22px">${[0, 1, 2, 3, 4, 5, 6, 7].map((k) => `<div class="phase" style="width:80px;height:80px;border-radius:50%;background:${k === 0 ? '#2a2f45' : k === 4 ? '#f4efd9' : `linear-gradient(${k < 4 ? 90 : 270}deg,#2a2f45 ${50 - k * 6}%,#f4efd9 ${50 - k * 6}%)`}"></div>`).join('')}</div>
      </div>`),

    clip('calma', `
      <div style="position:absolute;inset:0;background:${NIGHT}"></div>
      ${stars('calma', 160, 9)}
      <svg class="art" viewBox="0 0 ${W} ${H}">
        ${moon('cm-moon', 780, 600, 130)}
        ${nightVillage()}
        <rect x="300" y="1300" width="20" height="300" fill="#4a3424"/><rect x="820" y="1300" width="20" height="300" fill="#4a3424"/>
        <path d="M310 1330 Q570 1560 830 1330" stroke="#c4492f" stroke-width="16" fill="none"/>
        <path d="M330 1350 Q570 1540 810 1350 Q570 1480 330 1350 Z" fill="#e2763a"/>
        <g transform="translate(570 1420) rotate(-6)"><ellipse cx="40" cy="0" rx="120" ry="38" fill="#ff7a3d"/><circle cx="-100" cy="-14" r="46" fill="#e8b28a"/><path d="M-148 -20 Q-140 -64 -100 -64 Q-58 -64 -54 -24 Z" fill="#1f6f43"/><path d="M-118 -12 q8 6 16 0 M-92 -12 q8 6 16 0" stroke="#222" stroke-width="4" fill="none"/></g>
        <g id="cm-z" font-family="Anton" fill="#ffc83d"><text class="z" x="470" y="1300" font-size="60">Z</text><text class="z" x="520" y="1240" font-size="76">Z</text><text class="z" x="580" y="1170" font-size="92">Z</text></g>
      </svg>
      <div id="cm-card" class="card" style="top:180px;opacity:0"><div class="big gold" style="font-size:96px">A GRAVIDADE<br>PRENDE A LUA</div></div>`),

    series.html.comenta,
    series.html.final,
  ];

  const js = `
  const spin = (id, deg) => {
    const el = T(id);
    if (el.dataset.base === undefined) el.dataset.base = el.getAttribute('transform') || '';
    el.setAttribute('transform', el.dataset.base + ' rotate(' + deg.toFixed(2) + ')');
  };
  const wavePath = (id, amp, phase, len = 560, k = 2) => {
    let d = '';
    for (let x = 0; x <= len; x += 10) d += (x ? ' L' : 'M') + x + ' ' + (amp * Math.sin((x / len) * Math.PI * 2 * k - phase)).toFixed(1);
    T(id).setAttribute('d', d);
  };

  reg('abertura', (tl) => {
    const gone = ${rel('abertura', at(0) + 2.6)};
    tl.from('#ab-ese', { scale: 1.9, duration: 0.6, ease: 'back.out(1.6)' }, 0)
      .from('#ab-title', { y: 80, opacity: 0, duration: 0.6 }, ${rel('abertura', at(0) + 1.0)})
      .to('#ab-flash', { opacity: 0.6, duration: 0.08 }, gone).to('#ab-flash', { opacity: 0, duration: 0.5 }, gone + 0.08)
      .to('#ab-moon', { scale: 0, opacity: 0, transformOrigin: '50% 50%', duration: 0.35, ease: 'power3.in' }, gone);
  });

  reg('tabocal', (tl) => {
    const gone = ${rel('tabocal', moonGone)};
    tl.to('#tb-moon', { scale: 0, opacity: 0, transformOrigin: '50% 50%', duration: 0.4, ease: 'power3.in' }, gone)
      .to('#tb-dark', { opacity: 0.55, duration: 1.2 }, gone + 0.2)
      .fromTo('#tb-gone', { opacity: 0, scale: 1.6 }, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2)' }, gone + 0.3)
      .to('#tb-gone', { opacity: 0, duration: 0.4 }, gone + 2.4);
  });

  reg('vida', (tl) => {
    tl.to('.crab', { rotation: (i) => [25, -30, 18][i], transformOrigin: '50% 50%', duration: 0.5, yoyo: true, repeat: 7, ease: 'sine.inOut', stagger: 0.15 }, 0.3)
      .fromTo('#vi-bird', { x: 0, y: 0 }, { x: 260, y: -120, duration: ${S.vida!.dur}, ease: 'none' }, 0)
      .fromTo('#vi-bird2', { x: 0, y: 0 }, { x: -220, y: 80, duration: ${S.vida!.dur}, ease: 'none' }, 0);
  });

  reg('corais', (tl) => {
    tl.to('#co-beam', { opacity: 0, duration: 1.4 }, ${rel('corais', at(5) + 2.4)})
      .to('#co-dark', { opacity: 0.5, duration: 1.6 }, ${rel('corais', at(5) + 3.0)})
      .fromTo('.fish', { x: 0 }, { x: (i) => (i % 2 ? -220 : 220), duration: ${S.corais!.dur}, ease: 'sine.inOut' }, 0);
  });

  reg('ancora', (tl) => {
    tl.from('#an-earth', { scale: 0.6, opacity: 0, transformOrigin: '50% 50%', duration: 0.7 }, 0);
  });

  reg('clima', (tl) => {
    tl.from('#cl-l1', { y: -60, opacity: 0, duration: 0.5 }, ${rel('clima', at(9) + 2.0)})
      .from('#cl-l2', { y: 60, opacity: 0, duration: 0.5 }, ${rel('clima', at(9) + 3.4)});
  });

  reg('eclipse', (tl) => {
    tl.to('#ec-disc', { attr: { cx: 540 }, duration: 1.6, ease: 'power1.inOut' }, 0.2)
      .to('#ec-disc', { opacity: 0, duration: 0.5 }, 1.9)
      .to('#ec-x', { opacity: 1, duration: 0.3 }, 2.1)
      .from('#ec-cal', { y: 80, opacity: 0, duration: 0.5 }, ${rel('eclipse', at(10) + 2.6)})
      .to('.phase', { opacity: 0.12, duration: 0.3, stagger: 0.12 }, ${rel('eclipse', at(10) + 5.0)});
  });

  reg('calma', (tl) => {
    const back = ${rel('calma', moonBack)};
    tl.fromTo('#cm-card', { opacity: 0, y: -40 }, { opacity: 1, y: 0, duration: 0.5 }, ${rel('calma', at(11) + 1.6)})
      .from('#cm-moon', { scale: 0, opacity: 0, transformOrigin: '50% 50%', duration: 1.2, ease: 'back.out(1.4)' }, back)
      .fromTo('.z', { y: 0, opacity: 0 }, { y: -90, opacity: 1, duration: 1.2, stagger: 0.3, repeat: 4, ease: 'sine.out' }, back + 1.2);
  });

  hf.onFrame((t) => {
    // marés: com Lua (amplitude grande) x só o Sol (~1/3)
    const mr = t - ${S.mare!.start};
    wavePath('mr-w1', 60, mr * 3);
    wavePath('mr-w2', 20, mr * 3);
    const sea = 860 - 18 * Math.sin(mr * 1.2);
    T('mr-sea').setAttribute('d', 'M0 ' + sea.toFixed(1) + ' Q540 ' + (sea - 30).toFixed(1) + ' 1080 ' + sea.toFixed(1) + ' L1080 1050 Q540 1020 0 1050 Z');
    // relógio da maré girando descompassado
    spin('vi-hand', (t - ${S.vida!.start}) * 140);
    // âncora: a Lua orbita e a inclinação fica firme
    const an = t - ${S.ancora!.start};
    const a = an * 0.6, mx = 540 + 420 * Math.cos(a), my = 760 + 160 * Math.sin(a);
    T('an-moon').setAttribute('transform', 'translate(' + mx.toFixed(1) + ' ' + my.toFixed(1) + ')');
    T('an-rope').setAttribute('x2', mx.toFixed(1)); T('an-rope').setAttribute('y2', my.toFixed(1));
    // eixo: sem Lua, a oscilação cresce (tempo acelerado: milhões de anos)
    const ei = Math.max(0, t - ${S.eixo!.start});
    const amp = Math.min(38, 4 + ei * 7);
    spin('ei-earth', amp * Math.sin(ei * 2.2));
    const my_ = Math.round(Math.min(ei / ${S.eixo!.dur}, 1) * 10);
    T('ei-years').textContent = my_ === 0 ? 'HOJE' : my_ === 1 ? '1 MILHÃO DE ANOS' : my_ + ' MILHÕES DE ANOS';
    // clima alterna entre calor e gelo
    const cl = t - ${S.clima!.start};
    T('cl-hot').style.filter = 'saturate(' + (1 + 0.6 * Math.max(0, Math.sin(cl * 1.6))).toFixed(2) + ')';
  });
  ${series.js}`;

  const narr = path.relative(DIR, n.audio).split(path.sep).join('/');
  await writeEpisode(DIR, {
    title: 'E SE...? EP03 — E se a Lua sumisse?', lines: LINES, t, scenesHtml: scenes, scriptJs: js, captions: shiftedCaptions(n),
    output: 'renders/ep03-e-se-a-lua-sumisse.mp4',
    audio: [
      { id: 'narracao', src: narr, start: 1.2, role: 'narration' },
      { id: 'grilos', src: 'assets/grilos.mp3', start: 0, duration: r3(moonGone + 0.6), volume: 0.5, fadeIn: 0.5, fadeOut: 0.6, role: 'sfx' },
      { id: 'grilos-voltam', src: 'assets/grilos.mp3', start: r3(moonBack), mediaStart: 20, duration: r3(S.calma!.end - moonBack), volume: 0.4, fadeIn: 1.5, fadeOut: 1.2, role: 'sfx' },
      { id: 'trilha', src: 'assets/trilha.mp3', start: 0, duration: t.TOTAL, volume: 0.55, fadeIn: 1.5, fadeOut: 2.5, role: 'music', duckUnder: 'narration' },
    ],
  });
  console.log(`ok: ${path.relative(process.cwd(), DIR)} (${t.TOTAL}s)`);
}

await main();

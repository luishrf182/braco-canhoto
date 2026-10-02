// Auditoria visual: screenshots nas 5 resoluções + checagem de rolagem e alvos de toque.
// Uso: node e2e/auditoria.mjs F1 hoje=hoje explorar=explorar exercicio=exercicio/x:sem-rolagem
//      (rode `npm run build` antes; rotas SEM barra inicial, o Git Bash as converte). "!" no início = primeiro acesso.
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';

const [fase = 'F0', ...specs] = process.argv.slice(2);
const RESOLUCOES = [
  [360, 640],
  [390, 844],
  [844, 390],
  [768, 1024],
  [1280, 720],
];
const ESCURO_EM = new Set(['390x844', '1280x720']);
const PORTA = 4173;
const BASE = `http://localhost:${PORTA}/braco-canhoto/`;

const telas = (specs.length ? specs : ['hoje=hoje', 'ajustes=ajustes']).map((s) => {
  const [nome, resto] = s.split('=');
  const [rotaBruta, flag] = resto.split(':');
  const novo = rotaBruta.startsWith('!');
  return {
    nome,
    rota: '/' + (novo ? rotaBruta.slice(1) : rotaBruta).replace(/^\/+/, ''),
    semRolagem: flag === 'sem-rolagem',
    novo,
  };
});

const pasta = `docs/screenshots/${fase}`;
mkdirSync(pasta, { recursive: true });

const servidor = spawn('npx', ['vite', 'preview', '--port', String(PORTA), '--strictPort'], {
  shell: true,
  stdio: 'ignore',
});

async function esperarServidor() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(BASE);
      if (r.ok) return;
    } catch {
      // ainda subindo
    }
    await new Promise((ok) => setTimeout(ok, 500));
  }
  throw new Error('vite preview não respondeu');
}

const PROGRESSO_CALIBRADO = (tema) =>
  JSON.stringify({
    schemaVersion: 1,
    atualizadoEm: new Date().toISOString(),
    ajustes: { calibrado: true, tema, avisoIosVisto: true, diagnosticoVisto: true },
  });

const relatorio = [];
let falhas = 0;

try {
  await esperarServidor();
  const navegador = await chromium.launch();
  for (const tela of telas) {
    for (const [w, h] of RESOLUCOES) {
      const temas = ESCURO_EM.has(`${w}x${h}`) ? ['claro', 'escuro'] : ['claro'];
      for (const tema of temas) {
        const ctx = await navegador.newContext({
          viewport: { width: w, height: h },
          hasTouch: w < 768,
          isMobile: w < 768,
        });
        const valor = PROGRESSO_CALIBRADO(tema);
        if (!tela.novo) {
          await ctx.addInitScript((v) => {
            if (!localStorage.getItem('braco-canhoto:progresso'))
              localStorage.setItem('braco-canhoto:progresso', v);
          }, valor);
        }
        const pagina = await ctx.newPage();
        const erros = [];
        pagina.on('pageerror', (e) => erros.push(String(e)));
        pagina.on('console', (m) => m.type() === 'error' && erros.push(m.text()));
        await pagina.goto(BASE + '#' + tela.rota);
        await pagina.waitForTimeout(400);
        const medidas = await pagina.evaluate(() => {
          const raiz = document.scrollingElement ?? document.documentElement;
          const rolaveis = [...document.querySelectorAll('*')].filter((el) => {
            const s = getComputedStyle(el);
            return /(auto|scroll)/.test(s.overflowY) && el.scrollHeight > el.clientHeight + 1;
          });
          const pequenos = [...document.querySelectorAll('button, a[href], input, select, summary')]
            .filter((el) => {
              const r = el.getBoundingClientRect();
              return r.width > 0 && (r.width < 44 || r.height < 44);
            })
            .map((el) =>
              (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().slice(0, 30),
            );
          return {
            rolagemH: raiz.scrollWidth > raiz.clientWidth + 1,
            rolagemV: raiz.scrollHeight > raiz.clientHeight + 1 || rolaveis.length > 0,
            pequenos,
          };
        });
        const sufixo = tema === 'escuro' ? '-escuro' : '';
        const arquivo = `${pasta}/${tela.nome}-${w}x${h}${sufixo}.png`;
        await pagina.screenshot({ path: arquivo });
        const ok =
          !medidas.rolagemH && !(tela.semRolagem && medidas.rolagemV) && erros.length === 0;
        if (!ok) falhas++;
        relatorio.push({ tela: tela.nome, resolucao: `${w}x${h}`, tema, ok, ...medidas, erros });
        await ctx.close();
      }
    }
  }
  await navegador.close();
} finally {
  servidor.kill();
  if (process.platform === 'win32')
    spawn('taskkill', ['/pid', String(servidor.pid), '/T', '/F'], { stdio: 'ignore' });
}

writeFileSync(`${pasta}/relatorio.json`, JSON.stringify(relatorio, null, 2));
for (const r of relatorio) {
  const avisos = [
    r.rolagemH && 'ROLAGEM HORIZONTAL',
    r.rolagemV && 'rolagem vertical',
    r.pequenos.length && `alvos<44px: ${r.pequenos.join(' | ')}`,
    r.erros.length && `erros: ${r.erros.join(' | ')}`,
  ].filter(Boolean);
  console.log(`${r.ok ? '✅' : '❌'} ${r.tela} ${r.resolucao} ${r.tema} ${avisos.join(' · ')}`);
}
console.log(falhas ? `${falhas} falha(s)` : 'auditoria ok');
process.exit(falhas ? 1 : 0);

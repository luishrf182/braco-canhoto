// Verificação do áudio (F2): Tone.js só carrega após "Tocar"; destaque acompanha o som; sem erros.
// Uso: npm run build && node e2e/audio.mjs
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';

const PORTA = 4174;
const BASE = `http://localhost:${PORTA}/braco-canhoto/`;
const servidor = spawn('npx', ['vite', 'preview', '--port', String(PORTA), '--strictPort'], {
  shell: true,
  stdio: 'ignore',
});

let ok = true;
const falhar = (m) => {
  ok = false;
  console.log('❌ ' + m);
};

try {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(BASE)).ok) break;
    } catch {
      // subindo
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  const nav = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await nav.newContext({ viewport: { width: 1280, height: 720 } });
  await ctx.addInitScript(() => {
    localStorage.setItem(
      'braco-canhoto:progresso',
      JSON.stringify({ schemaVersion: 1, ajustes: { calibrado: true, diagnosticoVisto: true } }),
    );
  });
  const p = await ctx.newPage();
  const scripts = [];
  const erros = [];
  p.on('request', (r) => r.resourceType() === 'script' && scripts.push(r.url()));
  p.on('pageerror', (e) => erros.push(String(e)));
  p.on('console', (m) => m.type() === 'error' && erros.push(m.text()));

  await p.goto(BASE + '#/explorar');
  await p.waitForTimeout(800);
  const antes = scripts.length;
  if (scripts.some((u) => /esm-|tone/i.test(u) && !/index-/.test(u)))
    falhar('Tone.js carregou antes do primeiro "Tocar"');
  else console.log(`✅ abertura sem Tone.js (${antes} script(s))`);

  // Explorar começa em C7M (acorde + nota a nota); mede o destaque andando.
  await p.getByRole('button', { name: 'Tocar' }).click();
  await p.waitForFunction(() => document.querySelector('[aria-label="Parar"]'), null, {
    timeout: 10000,
  });
  const depois = scripts.slice(antes);
  if (!depois.length) falhar('nenhum chunk carregado após Tocar');
  else console.log(`✅ chunk de áudio carregado sob demanda (${depois.length})`);

  // Amostra o destaque ao longo do tempo: deve andar.
  const vistos = new Set();
  for (let i = 0; i < 20; i++) {
    const idx = await p.evaluate(() => {
      const g = document.querySelector('svg g[class*="ativo"]');
      return g ? g.getAttribute('class') + '@' + g.querySelector('text')?.getAttribute('x') : null;
    });
    if (idx) vistos.add(idx);
    await p.waitForTimeout(150);
  }
  if (vistos.size < 3) falhar(`destaque não avançou (${vistos.size} posições)`);
  else console.log(`✅ destaque avançou por ${vistos.size} posições`);

  // Muda o BPM durante a execução.
  await p.getByRole('button', { name: 'Aumentar BPM' }).click();
  await p.waitForTimeout(300);
  const estado = await p.evaluate(() => (window.__estadoAudio ??= null));
  void estado;
  const parar = p.getByRole('button', { name: 'Parar' });
  if (await parar.count()) await parar.click();

  // Base sintetizada (F7): cadência com bateria, pad e baixo; o acorde atual avança.
  await p.goto(BASE + '#/exercicio/cadencia-1');
  await p.getByRole('button', { name: 'Contar' }).click();
  for (let i = 0; i < 10; i++) await p.getByRole('button', { name: 'Aumentar BPM' }).click();
  await p.getByRole('button', { name: 'Tocar' }).click();
  await p.waitForFunction(() => document.querySelector('[aria-label="Parar"]'), null, {
    timeout: 10000,
  });
  const acordesVistos = new Set();
  for (let i = 0; i < 40; i++) {
    const atual = await p.evaluate(
      () => document.querySelector('[aria-current="step"] strong')?.textContent,
    );
    if (atual) acordesVistos.add(atual);
    await p.waitForTimeout(150);
  }
  if (acordesVistos.size < 3)
    falhar(`base: acorde atual não avançou (${[...acordesVistos].join(', ')})`);
  else
    console.log(
      `✅ base tocou e destacou ${acordesVistos.size} acordes (${[...acordesVistos].join(' ')})`,
    );
  // Trocar a levada durante a execução não quebra.
  await p.locator('select').selectOption('rock');
  await p.waitForTimeout(800);
  await p.getByRole('button', { name: 'Parar' }).click();

  const relevantes = erros.filter((e) => !/AudioContext was not allowed/i.test(e));
  if (relevantes.length) falhar('erros: ' + relevantes.join(' | '));
  else console.log('✅ sem erros de console');
  await nav.close();
} finally {
  servidor.kill();
  if (process.platform === 'win32')
    spawn('taskkill', ['/pid', String(servidor.pid), '/T', '/F'], { stdio: 'ignore' });
}
process.exit(ok ? 0 : 1);

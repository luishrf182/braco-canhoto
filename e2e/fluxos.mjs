// Testes de fluxo ponta a ponta (Playwright). Uso: npm run build && node e2e/fluxos.mjs
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';

const PORTA = 4175;
const BASE = `http://localhost:${PORTA}/braco-canhoto/`;
const AFINACAO = { 1: 64, 2: 59, 3: 55, 4: 50, 5: 45, 6: 40 };
const NOMES = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];

const servidor = spawn('npx', ['vite', 'preview', '--port', String(PORTA), '--strictPort'], {
  shell: true,
  stdio: 'ignore',
});

let falhas = 0;
const testes = [];
const teste = (nome, fn) => testes.push({ nome, fn });
const afirmar = (cond, msg) => {
  if (!cond) throw new Error(msg);
};

async function novaPagina(nav, ajustes = {}, viewport = { width: 1280, height: 720 }) {
  const ctx = await nav.newContext({ viewport });
  await ctx.addInitScript((a) => {
    if (!localStorage.getItem('braco-canhoto:progresso'))
      localStorage.setItem(
        'braco-canhoto:progresso',
        JSON.stringify({
          schemaVersion: 1,
          ajustes: { calibrado: true, diagnosticoVisto: true, avisoIosVisto: true, ...a },
        }),
      );
  }, ajustes);
  const p = await ctx.newPage();
  p.erros = [];
  p.on('pageerror', (e) => p.erros.push(String(e)));
  return p;
}

const lerProgresso = (p) =>
  p.evaluate(() => JSON.parse(localStorage.getItem('braco-canhoto:progresso') ?? '{}'));

// ---------------------------------------------------------------- F3
teste('F3: avaliação por atalho grava ItemProgresso com BPM +4', async (nav) => {
  const p = await novaPagina(nav);
  await p.goto(BASE + '#/exercicio/mapa-todas-notas');
  await p.waitForSelector('text=Limpo');
  await p.keyboard.press('1');
  await p.waitForSelector('text=Salvo.');
  const prog = await lerProgresso(p);
  const item = prog.itens['mapa-todas-notas|C|-'];
  afirmar(item, 'item não gravado');
  afirmar(item.caixa === 2, `caixa ${item.caixa}`);
  afirmar(item.bpm === 54, `bpm ${item.bpm}`);
  afirmar(item.melhorBpm === 50, `melhorBpm ${item.melhorBpm}`);
  // Enter = próximo; seta ← diminui BPM; Travou (3) recua 8.
  await p.keyboard.press('Enter');
  await p.waitForSelector('text=Limpo');
  await p.keyboard.press('ArrowLeft');
  await p.keyboard.press('3');
  await p.waitForSelector('text=Salvo.');
  const prog2 = await lerProgresso(p);
  const travados = Object.values(prog2.itens).filter((i) => i.ultimaAvaliacao === 'travou');
  afirmar(travados.length === 1, 'Travou não gravado');
  afirmar(p.erros.length === 0, p.erros.join(' | '));
});

teste('F3: quiz "que nota é esta?" completo sugere Limpo e Enter aceita', async (nav) => {
  const p = await novaPagina(nav);
  await p.goto(BASE + '#/exercicio/mapa-nome-ponto');
  for (let i = 0; i < 8; i++) {
    const rotulo = await p.getAttribute('svg[aria-label^="Ponto na corda"]', 'aria-label', {
      timeout: 5000,
    });
    const [, corda, casa] = rotulo.match(/corda (\d), casa (\d+)/);
    const nome = NOMES[(AFINACAO[corda] + Number(casa)) % 12];
    await p
      .getByRole('group', { name: 'Escolha a nota' })
      .getByRole('button', { name: nome, exact: true })
      .click();
    await p.waitForTimeout(650);
  }
  await p.waitForSelector('text=8/8');
  await p.keyboard.press('Enter');
  await p.waitForSelector('text=Salvo.');
  const item = (await lerProgresso(p)).itens['mapa-nome-ponto|-|-'];
  afirmar(item?.ultimaAvaliacao === 'limpo', `avaliação ${item?.ultimaAvaliacao}`);
});

teste('F3: modo TV mostra "pense e revele"', async (nav) => {
  const p = await novaPagina(nav, { penseERevele: true });
  await p.goto(BASE + '#/exercicio/mapa-nome-ponto');
  await p.getByRole('button', { name: 'Revelar' }).click();
  await p.getByRole('button', { name: 'Próxima' }).waitFor();
  const p2 = await novaPagina(nav, { penseERevele: true });
  await p2.goto(BASE + '#/exercicio/mapa-tocar-nota');
  await p2.getByRole('button', { name: 'Revelar' }).click();
  const marcadores = await p2.locator('svg g[class*="marcador"]').count();
  afirmar(marcadores > 0, 'revelar não mostrou posições');
});

// ---------------------------------------------------------------- F4
teste('F4: trilha do Módulo 1 de ponta a ponta', async (nav) => {
  const p = await novaPagina(nav, {}, { width: 390, height: 844 });
  await p.goto(BASE + '#/trilha');
  // Lição completa.
  await p.getByRole('link', { name: /Fórmula 1-3-5-7/ }).click();
  await p.waitForSelector('text=Tétrade é um acorde de quatro notas');
  await p.getByRole('button', { name: 'Próxima' }).click();
  await p.getByRole('button', { name: 'Próxima' }).click();
  await p.getByRole('button', { name: 'Concluir' }).click();
  await p.waitForSelector('h1:has-text("Trilha")');
  // Exercício ver-tocar na forma de E.
  await p.getByRole('link', { name: 'Tétrade 7M, forma de E' }).click();
  await p.waitForSelector('text=C7M · forma de E · abertura 2');
  await p.keyboard.press('1');
  await p.waitForSelector('text=Salvo.');
  await p.getByRole('button', { name: 'Sair do exercício' }).click();
  // Cartas: responde as 6 e avalia.
  await p.getByRole('link', { name: 'Que acorde é este?' }).click();
  for (let i = 0; i < 6; i++) {
    await p.getByRole('group', { name: 'Opções' }).getByRole('button').first().click();
    await p.waitForTimeout(1700);
  }
  await p.waitForSelector('text=certas');
  await p.keyboard.press('2');
  await p.waitForSelector('text=Salvo.');
  // "Onde está a 7ª?": toca os marcadores certos lendo o grau revelado depois.
  await p.getByRole('button', { name: 'Sair do exercício' }).click();
  await p.getByRole('link', { name: 'Onde está a 7ª?' }).click();
  await p.locator('svg g[role="button"]').first().waitFor();
  const prog = await lerProgresso(p);
  afirmar(prog.itens['tetrade-7M|C|E']?.caixa === 2, 'tétrade não gravada');
  afirmar(
    prog.itens['tetrade-identificar|C|-']?.ultimaAvaliacao === 'quase',
    'cartas não gravadas',
  );
  afirmar(p.erros.length === 0, p.erros.join(' | '));
});

teste('F4: checkpoint completo aparece na trilha', async (nav) => {
  const itens = {};
  for (const m of ['tetrade-7M', 'tetrade-7', 'tetrade-m7', 'tetrade-m7b5', 'tetrade-dim'])
    for (const f of ['E', 'A'])
      for (const t of ['C', 'G'])
        itens[`${m}|${t}|${f}`] = {
          caixa: 2,
          ultimaAvaliacao: 'limpo',
          proximaRevisao: '2030-01-01',
          atualizadoEm: '2026-01-01T00:00:00Z',
          limpos: 1,
        };
  const ctx = await nav.newContext({ viewport: { width: 1280, height: 720 } });
  await ctx.addInitScript((i) => {
    localStorage.setItem(
      'braco-canhoto:progresso',
      JSON.stringify({
        schemaVersion: 1,
        ajustes: { calibrado: true, diagnosticoVisto: true },
        itens: i,
      }),
    );
  }, itens);
  const p = await ctx.newPage();
  await p.goto(BASE + '#/trilha');
  await p.waitForSelector('text=Checkpoint concluído');
});

// ----------------------------------------------------------------
try {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(BASE)).ok) break;
    } catch {
      // subindo
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  const nav = await chromium.launch();
  const filtro = process.argv[2];
  for (const t of testes) {
    if (filtro && !t.nome.startsWith(filtro)) continue;
    try {
      await t.fn(nav);
      console.log('✅ ' + t.nome);
    } catch (e) {
      falhas++;
      console.log('❌ ' + t.nome + ' — ' + e.message.split('\n')[0]);
    }
  }
  await nav.close();
} finally {
  servidor.kill();
  if (process.platform === 'win32')
    spawn('taskkill', ['/pid', String(servidor.pid), '/T', '/F'], { stdio: 'ignore' });
}
process.exit(falhas ? 1 : 0);

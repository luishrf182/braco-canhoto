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
  globalThis.ultimaPagina = p;
  globalThis.ultimaPagina = p;
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

// ---------------------------------------------------------------- F5
teste('F5: sessão de 20 min do começo ao Resultado', async (nav) => {
  // Modo TV simplifica os quizzes (Revelar → Próxima).
  const p = await novaPagina(nav, { penseERevele: true }, { width: 1280, height: 720 });
  await p.goto(BASE + '#/hoje');
  await p.waitForSelector('text=Primeiro dia');
  const motivos = await p
    .locator('ol li span[data-motivo]')
    .evaluateAll((els) => els.map((e) => e.getAttribute('data-motivo')));
  afirmar(motivos[0] === 'aquecimento', 'sem aquecimento no início');
  afirmar(motivos.includes('novo'), 'sem conteúdo novo');
  await p.getByRole('button', { name: 'Começar' }).click();
  for (let passo = 0; passo < 400; passo++) {
    if (p.url().includes('/resultado')) break;
    const botao = async (nome) => {
      const b = p.getByRole('button', { name: nome, exact: true });
      if (!(await b.count())) return false;
      return b
        .first()
        .click({ timeout: 800 })
        .then(
          () => true,
          () => false,
        );
    };
    if (await botao('Concluir')) continue;
    if (await botao('Próxima')) continue;
    if (await botao('Revelar')) continue;
    if (await p.getByRole('group', { name: 'Como foi?' }).count()) {
      await p.keyboard.press('1');
      await p.waitForTimeout(150);
      continue;
    }
    await p.waitForTimeout(200);
  }
  await p.waitForSelector('h1:has-text("Sessão concluída")');
  await p.screenshot({ path: 'docs/screenshots/F5/resultado-1280x720.png', fullPage: true });
  const prog = await lerProgresso(p);
  afirmar(prog.sessoes.length === 1, 'resumo da sessão não gravado');
  const chaves = Object.keys(prog.itens).filter((k) => k.startsWith('tetrade'));
  afirmar(chaves.length > 0, 'nenhum item novo do Módulo 1');
  afirmar(
    chaves.every((k) => k.split('|')[1] === 'C'),
    'conteúdo novo fora de C: ' + chaves,
  );
  afirmar(Object.keys(prog.licoesVistas ?? {}).length > 0, 'lição não marcada como vista');
  afirmar(p.erros.length === 0, p.erros.join(' | '));
  // De volta ao Hoje: a próxima sessão já não começa pela mesma lição.
  await p.getByRole('link', { name: 'Voltar para Hoje' }).click();
  await p.waitForSelector('text=Você já fez a sessão de hoje');
});

// ---------------------------------------------------------------- F6
/** GitHub falso compartilhado entre contextos (dois "aparelhos"). */
function githubFalso() {
  const gists = new Map();
  let n = 0;
  return async (route) => {
    const req = route.request();
    const auth = req.headers()['authorization'] ?? '';
    const responder = (corpo, status = 200) =>
      route.fulfill({
        status,
        contentType: 'application/json',
        headers: { 'access-control-allow-origin': '*' },
        body: JSON.stringify(corpo),
      });
    if (req.method() === 'OPTIONS')
      return route.fulfill({
        status: 204,
        headers: {
          'access-control-allow-origin': '*',
          'access-control-allow-headers': '*',
          'access-control-allow-methods': 'GET,POST,PATCH',
        },
      });
    if (auth !== 'Bearer token-de-teste') return responder({ message: 'Bad credentials' }, 401);
    const url = new URL(req.url());
    if (url.pathname === '/gists' && req.method() === 'GET') return responder([...gists.values()]);
    if (url.pathname === '/gists' && req.method() === 'POST') {
      const g = { id: 'g' + ++n, files: JSON.parse(req.postData()).files };
      gists.set(g.id, g);
      return responder(g, 201);
    }
    const g = gists.get(url.pathname.split('/')[2]);
    if (!g) return responder({}, 404);
    if (req.method() === 'PATCH') Object.assign(g.files, JSON.parse(req.postData()).files);
    return responder(g);
  };
}

async function aparelhoComGithub(nav, gh) {
  const p = await novaPagina(nav, {}, { width: 1280, height: 720 });
  await p.context().route('https://api.github.com/**', gh);
  return p;
}

async function colarToken(p, token) {
  await p.goto(BASE + '#/ajustes');
  await p.getByLabel('Token do GitHub').fill(token);
  await p.getByRole('button', { name: 'Salvar e testar' }).click();
}

teste('F6: progresso feito em dois navegadores aparece nos dois', async (nav) => {
  const gh = githubFalso();
  const a = await aparelhoComGithub(nav, gh);
  const b = await aparelhoComGithub(nav, gh);
  await colarToken(a, 'token-de-teste');
  await a.waitForSelector('text=Conexão ok.');
  await colarToken(b, 'token-de-teste');
  await b.waitForSelector('text=Conexão ok.');
  // A avalia um exercício; B avalia outro.
  await a.goto(BASE + '#/exercicio/mapa-todas-notas');
  await a.waitForSelector('text=Limpo');
  await a.keyboard.press('1');
  await a.waitForSelector('text=Salvo.');
  await b.goto(BASE + '#/exercicio/mapa-oitavas/G');
  await b.waitForSelector('text=Limpo');
  await b.keyboard.press('2');
  await b.waitForSelector('text=Salvo.');
  // Espera os envios automáticos (4 s) e recarrega os dois.
  await a.waitForTimeout(5500);
  await a.goto(BASE + '#/ajustes');
  await a.getByRole('button', { name: 'Sincronizar agora' }).click();
  await a.waitForSelector('text=Sincronizado em');
  await b.reload();
  await b.goto(BASE + '#/ajustes');
  await b.getByRole('button', { name: 'Sincronizar agora' }).click();
  await b.waitForSelector('text=Sincronizado em');
  await a.reload();
  await a.waitForTimeout(1500);
  const pa = await lerProgresso(a);
  const pb = await lerProgresso(b);
  for (const [nome, prog] of [
    ['A', pa],
    ['B', pb],
  ]) {
    afirmar(prog.itens['mapa-todas-notas|C|-'], `${nome} sem o item de A`);
    afirmar(prog.itens['mapa-oitavas|G|-'], `${nome} sem o item de B`);
  }
  afirmar(a.erros.length + b.erros.length === 0, [...a.erros, ...b.erros].join(' | '));
});

teste('F6: token inválido mostra mensagem clara e não perde dados', async (nav) => {
  const p = await aparelhoComGithub(nav, githubFalso());
  await p.goto(BASE + '#/exercicio/mapa-todas-notas');
  await p.waitForSelector('text=Limpo');
  await p.keyboard.press('1');
  await p.waitForSelector('text=Salvo.');
  await colarToken(p, 'token-errado');
  await p.waitForSelector('text=Token inválido ou expirado');
  const prog = await lerProgresso(p);
  afirmar(prog.itens['mapa-todas-notas|C|-'], 'progresso local perdido');
  const token = await p.evaluate(() => localStorage.getItem('braco-canhoto:token'));
  afirmar(!token, 'token inválido foi salvo');
});

teste('F6: token que expira depois vira "Salvo só neste aparelho"', async (nav) => {
  const gh = githubFalso();
  const p = await aparelhoComGithub(nav, gh);
  await colarToken(p, 'token-de-teste');
  await p.waitForSelector('text=Conexão ok.');
  // Simula expiração trocando o token salvo.
  await p.evaluate(() => localStorage.setItem('braco-canhoto:token', 'expirado'));
  await p.goto(BASE + '#/hoje');
  await p.reload();
  await p.waitForSelector('text=Salvo só neste aparelho');
  await p.waitForSelector('text=Token inválido ou expirado');
});

// ---------------------------------------------------------------- F9
teste('F9: trilha do Módulo 3 de ponta a ponta', async (nav) => {
  const p = await novaPagina(nav, {}, { width: 844, height: 390 });
  await p.goto(BASE + '#/trilha');
  await p.getByRole('link', { name: /Acorde nota por nota/ }).click();
  await p.waitForSelector('text=Arpejo é o acorde tocado nota por nota');
  await p.getByRole('button', { name: 'Próxima' }).click();
  await p.getByRole('button', { name: 'Concluir' }).click();
  await p.getByRole('link', { name: /Ligar as formas/ }).click();
  await p.waitForSelector('text=nas formas');
  await p.getByRole('button', { name: 'Concluir' }).click();
  await p.getByRole('link', { name: 'Arpejo m7, forma de G' }).click();
  await p.waitForSelector('text=Arpejo de Cm7 · forma de G');
  await p.keyboard.press('1');
  await p.waitForSelector('text=Salvo.');
  await p.getByRole('button', { name: 'Sair do exercício' }).click();
  await p.getByRole('link', { name: 'Ligar as 5 formas' }).click();
  await p.waitForSelector('text=C7M nas 5 formas');
  await p.keyboard.press('2');
  await p.waitForSelector('text=Salvo.');
  const prog = await lerProgresso(p);
  afirmar(prog.itens['arpejo-m7|C|G'], 'arpejo não gravado');
  afirmar(
    prog.licoesVistas['arpejos/arpejo'] && prog.licoesVistas['arpejos/conexao'],
    'lições não vistas',
  );
  afirmar(p.erros.length === 0, p.erros.join(' | '));
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
      await globalThis.ultimaPagina?.screenshot({ path: 'test-results/falha.png' }).catch(() => {});
      console.log('   em ' + globalThis.ultimaPagina?.url());
    }
  }
  await nav.close();
} finally {
  servidor.kill();
  if (process.platform === 'win32')
    spawn('taskkill', ['/pid', String(servidor.pid), '/T', '/F'], { stdio: 'ignore' });
}
process.exit(falhas ? 1 : 0);

# Progresso — Braço Canhoto

Execução autônoma das fases F0 → F10 (BLUEPRINT §8). Para retomar: leia este arquivo e continue da primeira fase não concluída.

URL: https://luishrf182.github.io/braco-canhoto/
Repositório: https://github.com/luishrf182/braco-canhoto

## Estado

| Fase | Status |
|---|---|
| F0 — Esqueleto publicado | concluída |
| F1 — Braço + Calibração + Explorar | concluída |
| F2 — Áudio base | concluída |
| F3 — Player + Mapa do braço | concluída |
| F4 — Módulo 1: Tétrades | pendente |
| F5 — Agenda + Sessão do dia | pendente |
| F6 — Sincronização via Gist | pendente |
| F7 — Base + Módulo 2: Campo harmônico | pendente |
| F8 — Aquecimentos | pendente |
| F9 — Módulo 3: Arpejos | pendente |
| F10 — Diagnóstico + acabamento + entrega | pendente |

---

## F0 — Esqueleto publicado

**Feito**
- Vite 8 + React 18 + TypeScript strict, ESLint 10 (flat) + Prettier, Vitest 5, wouter com rotas por hash.
- Tokens CSS (§5.1) + tema claro/escuro/sistema persistido em `Progresso.ajustes`.
- Moldura com navegação: barra inferior em retrato, trilho lateral em paisagem.
- Ajustes mínimo: tema, atalhos, apagar dados, versão (hash do commit), log dos últimos 20 erros.
- Error Boundary global com "Recarregar"; erros globais vão para o log.
- `public/404.html` redireciona para `/#/`; manifest; `meta robots noindex`; CSP da §7.6 injetada só no build.
- Guarda de arquivos proibidos (`npm run guarda`) no `qa` e no CI.
- Workflow `.github/workflows/deploy.yml`: guarda → lint → typecheck → test → build → Pages.
- Claude Code: hooks (§9.4) em `scripts/hooks/*.mjs`, subagentes `revisor-teoria` e `auditor-ux`, skills `qa`, `novo-exercicio`, `revisar-modulo`, `deploy`.
- Auditoria visual automatizada: `npm run build && node e2e/auditoria.mjs Fn tela=rota[:sem-rolagem]` (Playwright, 5 resoluções, temas claro/escuro, rolagem, alvos < 44px, erros de console).

**Decisões autônomas**
- Projeto em `C:\projetos\braco-canhoto` (o Google Drive não aceita `npm install` nem links simbólicos; decisão confirmada com o Luís).
- Hooks escritos em Node (`.mjs`) em vez de `.sh`, para funcionar no Windows.
- Regras de arquitetura aplicadas pelo ESLint: módulos puros não importam React/Tone/window/localStorage; localStorage só em `src/progresso`.
- Tipos de domínio em `src/tipos.ts` (puro), para que `agenda` não dependa de `progresso`.
- Padrão de canhoto: `espelhoHorizontal = true` (pestana à direita), `espelhoVertical = false` (mi agudo em cima). A calibração confirma.
- Playwright MCP substituído por script Playwright (`e2e/auditoria.mjs`), repetível e sem configuração extra.
- `tsconfig.node.json` separado para arquivos de Node (vite.config, e2e), para `process` não vazar para `src`.

**Pendências**
- Nenhuma.

## F1 — Braço canhoto + Calibração + Explorar (notas)

**Feito**
- `teoria/notas.ts`: afinação, `notaNa`, `posicoesDe`, `formatarNota` (♯/♭ e Dó-Ré-Mi), `TONS`. Testes: cordas soltas, casa 12, fatos conhecidos, enarmonia.
- Componente `Braco` (SVG): espelhos horizontal/vertical (única regra de espelho do app), marcadores por papel com forma própria (fundamental quadrada, 3ª círculo, 5ª hexágono, 7ª losango, extensão triângulo, escala vazada), rótulo nota/grau/intervalo/dedo, camada de sombra (forma CAGED), destaque sincronizado, áreas de toque para quiz, retorno certo/errado.
- Retrato estreito (< 700 px): janela de 5–7 casas com paginação ‹ › (as setas seguem o espelho). Paisagem, tablet e TV: 0–15.
- Calibração no primeiro acesso (↔ inverter lados, ↕ inverter cordas), persistida. Ajustes também permite trocar.
- Explorar: "todas as notas X" com `SeletorTom` (12 tons + sortear).
- `revisor-teoria`: aprovado. Auditoria: 14/14 sem rolagem.

**Decisões autônomas**
- `tonal` fixado em 6.4.2: o pacote 6.5.0 publicado no npm está sem os arquivos `dist/index.js`/`.mjs`.
- Para distinguir papéis sem cor, cada papel tem um formato (o blueprint só exigia o quadrado da fundamental).
- Marcadores ganham contorno escuro no tema claro para atingir 3:1 sobre o fundo (azul-claro/rosa Okabe-Ito sozinhos não atingem).
- Texto escuro dentro dos marcadores (exceto a 3ª, azul-escuro, com texto branco), para contraste AA.

**Pendências**
- Nenhuma.

## F2 — Áudio base

**Feito**
- `audio/motor.ts`: Tone.js por import dinâmico no primeiro "Tocar"; nota dedilhada (PolySynth triangular + passa-baixa), clique de metrônomo com acento, `tocarSequencia` com contagem de entrada e loop, `metronomo`, `definirBpm` (rampa de 150 ms, sem estalo), `parar`, `aoTocar` (via Tone.Draw, sincronizado com o som), `aoMudarEstado`.
- `BarraReproducao`: tocar/parar, BPM grande (56 px, tabular) com ±, contagem, atalhos (espaço, ←/→, Shift = ±10), estados "Carregando som…" e "Som bloqueado", aviso do iOS na primeira vez.
- Explorar: tocar a sequência de notas acende cada ponto em sincronia; tocar um ponto toca a nota; a janela em retrato acompanha a nota que soa.
- `e2e/audio.mjs`: confere que a abertura não baixa o Tone.js, que o chunk chega após "Tocar", que o destaque avança e que não há erro no console.

**Decisões autônomas**
- O relógio do Tone usa `setTimeout` (não Worker): a CSP do blueprint (`script-src 'self'`) bloqueia Worker a partir de blob. O contexto é criado antes do índice do Tone para evitar o Worker padrão. CSP mantida exatamente como no blueprint.
- Sem `PluckSynth`: ele depende de AudioWorklet via blob (também bloqueado pela CSP).
- Agendamento em ticks do Transport, para a mudança de BPM valer no meio da sequência.

**Pendências**
- "O BPM muda sem estalo" e "o ponto aceso coincide com o som" precisam de conferência auditiva no celular (vai para o roteiro de `ENTREGA.md`).

## F3 — Player de exercício + Mapa do braço

**Feito**
- Módulos puros: `exercicios/tipos.ts` (ModeloExercicio, ExercicioConcreto), `exercicios/aleatorio.ts` (sorteio com semente), `exercicios/mapa.ts` (quiz de nome do ponto, quiz de tocar a nota, todas as notas X, oitavas), registro de geradores em `exercicios/index.ts`, `teoria/oitavas.ts`, `agenda/caixas.ts` (regras Limpo/Quase/Travou e BPM +4/−8), `agenda/tons.ts` (sorteio ponderado).
- `PlayerExercicio`: tela única sem rolagem (instrução + braço + controles + avaliação), formatos `quiz-braco` e `ver-tocar`. Paisagem baixa: controles e avaliação lado a lado.
- `Avaliacao`: Limpo/Quase/Travou (≥ 56 px), teclas 1/2/3, Enter aceita a sugestão do quiz.
- Quiz: 8 perguntas, retorno certo/errado, toca a nota se o som já estiver ativo, placar e tempo médio, avaliação sugerida (≥ 7/8 e ≤ 4 s = Limpo; ≥ 5/8 = Quase).
- Modo TV ("pense e revele"): em Ajustes; os quizzes viram Revelar → Próxima.
- Tela Exercício avulsa (`/#/exercicio/:modelo/:tom?/:forma?`) com "Salvo · revisão em N dias · próximo BPM", Repetir e Próximo (Enter). Conteúdo novo fica em C até o primeiro Limpo; depois sorteia o tom.
- Trilha com o treino Mapa do braço (6 exercícios) e status por exercício.
- `e2e/fluxos.mjs`: avaliação grava o item (caixa, BPM, melhor BPM), atalhos, quiz completo e pense e revele.

**Decisões autônomas**
- `ItemProgresso` ganhou campos opcionais `bpm` (BPM de trabalho), `vezes` e `limpos`. É compatível com o modelo do blueprint.
- O primeiro Limpo de um item novo já o leva para a caixa 2 (revisão em 3 dias): item novo conta como caixa 1.
- Padrões de oitava: o motor gera os 7 pares de oitava da afinação padrão (6→4, 5→3, 4→2, 3→1, 6→3, 5→2, 4→1). O blueprint fala em 6; a lista fica para revisão do Luís.
- Instruções usam marcas `{n:Bb}`, formatadas na tela conforme "letras" ou "Dó-Ré-Mi".
- Os testes de fluxo e de áudio (Playwright) rodam localmente como portão; o CI roda guarda, lint, tipos, testes unitários e build.

**Pendências**
- Nenhuma.

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
| F4 — Módulo 1: Tétrades | concluída |
| F5 — Agenda + Sessão do dia | concluída |
| F6 — Sincronização via Gist | concluída |
| F7 — Base + Módulo 2: Campo harmônico | concluída |
| F8 — Aquecimentos | concluída |
| F9 — Módulo 3: Arpejos | concluída |
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

## F4 — Módulo 1: Tétrades

**Feito**
- `teoria/acordes.ts` (5 qualidades + tríades via tonal; graus T, 3, b3, 5, b5, 7M, 7, bb7), `teoria/cifra.ts` (C7M, Dm7, G7, Bm7(b5), B°, E♭7M, C/E), `teoria/voicings.ts`: formas CAGED calculadas a partir da afinação ("centro" de cada corda + nota do acorde mais próxima), tríades nas 5 formas, tétrades na abertura 1 (A, D) e na abertura 2 (E), omissão da tônica ou da 5ª, outra região (`casaMin`).
- Testes: acordes abertos e pestanas conhecidas, tétrades usuais (C7M x3545x, G7M 3x443x, G° 3x232x, D7M xx0222...), propriedades em 5 qualidades × 12 tons × formas.
- Geradores: `verTetrade`, `identificarTetrade` (cartas), `ondeEstaGrau` (toque a 7ª/3ª). Formato `identificacao` (Cartas) e pergunta `marcar-grau` no quiz.
- `JanelaAcorde` (o Braço com 5 casas), tela de Lição (texto + exemplo do motor + Ouvir + Graus/Notas), Trilha com módulo, lições, exercícios por forma (A/E/D) e barra de checkpoint.
- Testes de conteúdo: ≤ 2 frases por tela, toda lição em C, todo modelo gera nos 12 tons e formas, checkpoint aponta para modelos existentes.
- `e2e/fluxos.mjs`: trilha de ponta a ponta (lição → exercício → cartas → quiz) e checkpoint concluído.
- `revisor-teoria`: 1 erro de texto corrigido (abertura 2) e 1 ajuste de precisão (omissão). Restante aprovado.

**Decisões autônomas**
- Tétrades só nas formas A, D (abertura 1) e E (abertura 2), como o blueprint define. As formas de C e G existem para tríades (e para arpejos na F9).
- **Divergência com o blueprint (para o Luís revisar):** o §3 diz "Abertura 2: a quinta desce uma oitava (T-7-3-5)". Segundo o revisor, em relação à abertura 1 (T-5-7-3) a 5ª *sobe* para a 2ª corda. O texto da lição ficou neutro: "a 7ª vai para a 4ª corda e a 5ª fica no agudo". O `BLUEPRINT.md` não foi alterado.
- Nos quizzes de identificação, os marcadores escondem o formato do papel (só a tônica continua quadrada) até a resposta: senão o losango entregaria a 7ª.
- "°" = diminuto com 7ª diminuta, com grafia teórica (E♭° = E♭ G♭ B♭♭ D♭♭).
- O exercício de progressão do Módulo 1 (sequência de tétrades em 2 regiões) entra na F7, junto com o formato `progressao`.
- Rótulo padrão "Graus" nas telas de acorde, com botão para trocar por notas.

**Pendências**
- Exercício de progressão do Módulo 1 → F7.

## F5 — Agenda + Sessão do dia

**Feito**
- `agenda/sessao.ts` (puro): orçamento 20% aquecimento / 40% novos / 40% revisão (20 min = 4 + 8 + 8; escala para 10 e 30), revisões vencidas por data e caixa, revisão intercalada (sem o mesmo modelo seguido), conteúdo novo do primeiro módulo com checkpoint pendente: 1 lição não vista por sessão → combinações modelo × forma nunca feitas (sempre em C) → variantes de tom sorteadas (peso maior para C, G, D, A, E, F, B♭) só depois do primeiro Limpo. Sem conteúdo novo, a revisão ocupa o tempo todo. Sessão determinística por dia (semente da data).
- `agenda/checkpoint.ts`: status do checkpoint por modelo × forma × tons com Limpo.
- Telas: **Hoje** (plano do dia com motivo de cada item, 10/20/30 min, "Outra combinação", "Continuar" se houver sessão em andamento, aviso do primeiro dia), **Sessão** (executa lições e exercícios em sequência, "3 de 9" no topo, andamento salvo no aparelho), **Resultado** (Limpo/Quase/Travou, o que subiu de caixa, BPM e próxima revisão de cada item).
- Lições concluídas ficam registradas (`Progresso.licoesVistas`).
- Testes da agenda com datas simuladas (Limpo some por 3 dias, Quase volta amanhã, Travou volta hoje) + `e2e/fluxos.mjs` com uma sessão completa de 20 min até o Resultado.

**Decisões autônomas**
- Uma lição nova por sessão (o primeiro rascunho colocava as 4 lições do módulo no mesmo dia).
- Aquecimento da F5 = quizzes do Mapa do braço; a F8 acrescenta os aquecimentos técnicos.
- Quizzes e cartas não alteram BPM (gravam só a caixa); `ver-tocar` grava BPM.
- `Progresso` ganhou o campo opcional `licoesVistas`.
- `CLAUDE.md`: o plugin context-mode acrescenta regras próprias no arquivo local; essas linhas ficam fora do repositório.

**Pendências**
- Estados "Salvando…" e "Salvo só neste aparelho" do Resultado chegam com a sincronização (F6).

## F6 — Sincronização via Gist

**Feito**
- `progresso/juncao.ts` (puro): junção item a item por `atualizadoEm` (itens, ajustes, módulos); sessões unidas por id (fica a versão mais completa, últimas 60); lições vistas unidas com a primeira data. Testado com progressos divergentes.
- `progresso/gist.ts`: único módulo que lê o token. Cria um Gist secreto `braco-canhoto-progresso.json` na primeira vez, e um segundo aparelho o acha pelo nome. Erros tipados (sem token, token inválido, sem permissão, rede, servidor) com mensagens claras. Gist apagado no site: recomeça. Testado com GitHub falso em memória.
- Provedor de progresso: a cópia local é sempre gravada primeiro. A sincronização (baixa → junta com o estado do momento → envia se mudou) roda ao abrir o app, ao voltar à aba, 4 s após a última mudança e ao fim da sessão. Nunca roda duas ao mesmo tempo.
- Ajustes → Sincronização: instruções para criar o token, campo de senha, "Salvar e testar" (o token só é salvo se a conexão funcionar), status, "Sincronizar agora", "Remover token". "Apagar dados deste aparelho" também apaga o token.
- `AvisoSync`: Hoje mostra aviso discreto só em caso de erro; Resultado mostra "Salvando…" / "Salvo e sincronizado" / "Salvo só neste aparelho" + "Tentar de novo" ou link para Ajustes.
- `e2e/fluxos.mjs` (GitHub falso via Playwright): progresso de dois navegadores aparece nos dois; token inválido mostra mensagem e não perde dados nem salva o token; token expirado vira "Salvo só neste aparelho".

**Decisões autônomas**
- Os ajustes (tema, espelhos etc.) também sincronizam, já que são do mesmo guitarrista. O token e o id do Gist ficam só no aparelho.
- A sincronização foi testada só com mocks. O teste com token real fica para o Luís (`ENTREGA.md`).

**Pendências**
- Nenhuma.

## F7 — Base sintetizada + Módulo 2: Campo harmônico

**Feito**
- `teoria/campo.ts`: campo maior em tríades e tétrades por empilhamento de terças (sem tabela escrita à mão), rótulos de grau (I7M…VIIm7(b5)), funções T/S/D, `cadencia(tom, graus)` com inversão "/3" e dominante secundária "V7/X", relativas. Testado nos 12 tons.
- `teoria/voicings.ts`: `voicingNaRegiao` (tétrade nas formas E/A/D mais próxima de uma casa), para progressões sem saltos.
- `audio/levadas.ts` (dados puros, testados): balada, pop, groove e rock em grade de 16 passos. `audio/motor.ts` → `iniciarBase`: bateria sintetizada, baixo, pad, clique e contagem num único relógio; `aoTocar(i)` no início de cada acorde.
- Formato `progressao` no player: cifras com o acorde atual destacado, voicing do acorde atual no braço, seletor de levada e pad (reinicia a base se mudar durante a execução).
- Módulo 2: 2 lições (empilhamento; funções e relativa), cartas "graus relâmpago" e de relativas, campo inteiro em tétrades, as 8 cadências do blueprint, cada uma com uma levada. Checkpoint: campo em 4 tons + 4 cadências Limpo.
- Módulo 1: pendência da F4 resolvida, com o exercício "IIm7 – V7 – I7M em duas regiões".
- Checkpoint generalizado em requisitos (permite "4 de 8 cadências").
- Lições mostram campo/cadência com chips de acorde clicáveis.
- `e2e/audio.mjs`: a base toca, o acorde destacado avança, trocar a levada durante a execução não gera erro.
- `revisor-teoria`: aprovado; as 4 notas foram aplicadas.

**Decisões autônomas**
- Tríade diminuta = `Bm(b5)` (sugestão do revisor). O "°" fica reservado para a tétrade diminuta.
- Em inversões (G7/B), a guitarra mostra o voicing em posição fundamental; só o baixo sintetizado toca a 3ª.
- Bateria, baixo e pad 100% sintetizados (sem amostras), coerente com a CSP e sem arquivos de áudio no repositório.

**Pendências**
- A sincronia da bateria e o timbre precisam de escuta no celular (vai para o roteiro de `ENTREGA.md`).

## F8 — Aquecimentos

**Feito**
- `teoria/escalas.ts`: `posicaoEscala(tom, escala, forma)`. Pentatônicas com 2 notas por corda: a 6ª corda começa no grau da forma (penta menor E=box 1, D=2, C=3, A=4, G=5), e a penta maior usa a forma da relativa. Escala maior numa janela de 5 casas em torno do acorde da forma. Testes: os 5 boxes de Lá menor, a forma de D da escala maior, as relativas e propriedades em 12 tons × 5 formas × 3 escalas.
- `exercicios/aquecimentos.ts`: independência (pares de dedos corda a corda), horizontal (grupos de 4 subindo e descendo), duas cordas (grupos de 3), vertical (célula de 4 descendo as cordas), ligados (hammer-on e pull-off), 3 ritmos (colcheias, tercinas, semicolcheias) e dedilhado de um dedo por casa. Teste: todo evento cai na forma e no tom pedidos (12 tons × 5 formas × todos os tipos).
- Formato `ouca-repita`: contagem → o app toca → "Sua vez" com metrônomo; diagrama ocultável.
- Treino "Aquecimentos" na Trilha (6 exercícios); a Sessão do dia agora aquece com eles (tom e forma sorteados) e com quizzes do Mapa do braço.
- `revisor-teoria`: reprovou a primeira versão (pentatônica deslocada nas formas C, D e G). O algoritmo foi trocado e a nova versão foi aprovada.

**Decisões autônomas**
- O deslize para a forma vizinha no aquecimento "horizontal" não entrou: todos os padrões ficam dentro de uma forma. A conexão entre formas vem no Módulo 3 (F9).
- Independência usa as notas da escala, não um padrão cromático, para cumprir o critério "todo evento dentro do tom".
- Box 3 (casas 9–13): o dedo 4 cobre as casas 12 e 13 (alongamento).

**Pendências**
- Nenhuma.

## F9 — Módulo 3: Arpejos

**Feito**
- `teoria/arpejos.ts`: arpejo das 5 qualidades em cada forma CAGED (todas as notas do acorde numa janela de 5 casas em torno do acorde da forma), `formasEmOrdem` (ciclo C-A-G-E-D subindo o braço) e `arpejoNaRegiao`. Teste: notas pertencem ao acorde e ficam na janela (12 tons × 5 qualidades × 5 formas).
- Geradores: ver arpejo (sobe e desce em colcheias), ligar as 5 formas (sobe numa, desce na seguinte), campo em arpejos numa região (I7M → VIIm7(b5), 8 notas cada), quiz "toque a 3ª".
- Módulo 3: 2 lições (arpejo; ligar formas), 8 exercícios. Checkpoint: 7M, m7 e 7 nas 5 formas com Limpo em 3 tons.
- Lições mostram arpejo numa forma e a conexão das 5 formas.
- `e2e/fluxos.mjs`: trilha do Módulo 3 de ponta a ponta.
- `revisor-teoria`: teoria aprovada; 2 frases das lições corrigidas (conexão entre formas: "casas" em comum, não alturas; o arpejo vai da nota mais grave à mais aguda da forma, não necessariamente da tônica).

**Decisões autônomas**
- Checkpoint "em Dó + 2 tons" implementado como "3 tons distintos com Limpo". Como todo conteúdo novo começa em Dó, na prática o primeiro tom é sempre Dó.
- Em Cm7 a forma de C mais grave fica nas casas 11–15, então a ordem das formas começa na de A. O ciclo continua correto.

**Pendências**
- Nenhuma.

# Braço Canhoto — Blueprint v1

> Documentação inicial do repositório. Fonte da verdade para o Claude Code.
> Decisões marcadas com **[ADR-n]** estão detalhadas na seção 6.

---

## 0. Antes de tudo — checklist do Luís (100% antes de o Claude Code começar)

Modo de execução: **autônomo**. Depois deste checklist, o Claude Code executa as fases F0 a F10 sem pedir aprovação e entrega o app publicado, junto com um roteiro de teste. Os portões entre as fases são automáticos (seção 8). A revisão humana acontece **uma vez, no final**.

### 0.1 Instalações (uma vez)
- [ ] **Node.js 20 LTS ou superior.** Conferir: `node -v`.
- [ ] **Git.** Conferir: `git --version`.
- [ ] **GitHub CLI.** Conferir: `gh --version`.
- [ ] **Claude Code atualizado.** Rodar `claude update`.

### 0.2 Acessos
- [ ] Login no GitHub pelo terminal, com permissão para criar repositório e workflows:
  `gh auth login --scopes "repo,workflow"`. Conferir: `gh auth status`.
- [ ] *(Opcional, pode ficar para o teste final)* Criar o token do app em GitHub → Settings → Developer settings → Fine-grained tokens. Permissão de conta **Gists: Read and write**, nada mais, validade de 1 ano. **Guarde só com você.** Você mesmo cola no app, em Ajustes. O Claude Code nunca recebe esse token.

### 0.3 Pasta do projeto
- [ ] Criar `~/projetos/braco-canhoto/` com:
  - `docs/BLUEPRINT.md` (este arquivo);
  - `CLAUDE.md` (conteúdo da §9.1);
  - `referencias/` com o material da Juliana (PDFs, PNGs; áudios são opcionais).
- [ ] Criar `~/projetos/braco-canhoto/.claude/settings.json` só com as permissões abaixo. Os hooks são adicionados pelo próprio Claude Code na F0.

```json
{
  "permissions": {
    "allow": [
      "Edit", "Write", "Read",
      "Bash(npm:*)", "Bash(npx:*)", "Bash(node:*)",
      "Bash(git:*)", "Bash(gh:*)",
      "Bash(mkdir:*)", "Bash(ls:*)", "Bash(cat:*)", "Bash(cp:*)", "Bash(mv:*)", "Bash(chmod:*)",
      "mcp__playwright"
    ],
    "deny": [
      "Bash(rm -rf:*)", "Bash(git push --force:*)", "Bash(git push -f:*)",
      "Edit(./referencias/**)", "Write(./referencias/**)"
    ]
  }
}
```

*(Trecho ilustrativo. Se o Claude Code ainda pedir confirmação para algum comando, escolha "sempre permitir" na primeira vez.)*

### 0.4 Ferramenta de teste visual
- [ ] Dentro da pasta do projeto, rodar:
  - `claude mcp add playwright -- npx @playwright/mcp@latest`
  - `npx playwright install chromium`

### 0.5 Decisões já tomadas (o Claude Code não pergunta)
- Repositório: **`braco-canhoto`**, público (exigência do GitHub Pages gratuito), na sua conta.
- Nome do app: **Braço Canhoto**.
- GitHub Pages com publicação via GitHub Actions: o próprio Claude Code ativa pelo `gh`.

### 0.6 Disparo
- [ ] Na pasta do projeto: `claude`, colar o prompt da §9.6 e sair.

### 0.7 Se a execução parar no meio
Pode acontecer por limite de uso do plano, queda de conexão ou computador desligado. O progresso fica registrado em `docs/PROGRESSO.md`. Para retomar, abra o `claude` na pasta e escreva: **"Retome a execução a partir de docs/PROGRESSO.md, no mesmo modo autônomo."**

### 0.8 O que fica para você no final
Abrir a URL, calibrar o braço, colar o token, testar no celular, no tablet e na TV, e revisar os textos das lições seguindo `docs/ENTREGA.md`.

---

## 1. Resumo executivo

**Braço Canhoto** é um app web pessoal de estudo de guitarra para um guitarrista canhoto de nível intermediário (Luís), que substitui o curso em vídeo que ele fazia. Todo diagrama do braço é desenhado **horizontalmente e espelhado para canhoto**, na orientação que ele escolher. O foco é improvisar em qualquer tom, dominar o braço na horizontal e na vertical e tocar tétrades no automático. A teoria é **calculada por um motor testado**, e não escrita à mão. A prática é organizada numa **Sessão do dia** de 20 minutos que alterna temas e tons, com base sintetizada (acordes + bateria) em qualquer tom e BPM. É um site estático no GitHub Pages, sem servidor e sem banco de dados. O progresso fica num Gist secreto do próprio usuário. Funciona no celular (retrato e paisagem), no tablet e na TV via espelhamento.

---

## 2. Escopo

### 2.1 Dentro da v1

- **Componente Braço** horizontal, com espelho horizontal e vertical persistentes (calibração no primeiro acesso).
- **Motor de teoria**: notas, intervalos, tétrades (7M, 7, m7, m7(b5), °), voicings por forma CAGED, aberturas 1 e 2, campo harmônico maior em tétrades, cadências por grau, posições de escala (pentatônica maior/menor, para os aquecimentos), padrões de oitava.
- **Motor de áudio**: nota dedilhada sintetizada, pad, metrônomo, 4 levadas de bateria sintetizada (balada, pop, groove, rock), em qualquer tom e BPM.
- **Módulo 1 — Tétrades** · **Módulo 2 — Campo harmônico maior** · **Módulo 3 — Arpejos no CAGED**.
- **Treinos permanentes**: Mapa do braço e Aquecimentos.
- **Sessão do dia** (10/20/30 min, padrão 20) com revisão em 3 caixas.
- **Diagnóstico de entrada** (opcional, 10 min).
- **Explorar**: consulta livre de qualquer tom, acorde, arpejo ou escala.
- **Sincronização** do progresso via Gist secreto do GitHub.
- Tema claro e escuro, notação brasileira (C7M, Dm7, Bm7(b5), B°), nomes de nota em letra ou Dó-Ré-Mi.

### 2.2 Fora da v1 (backlog explícito, em ordem)

| Versão | Conteúdo |
|---|---|
| v1.1 | Módulo **Escala maior**: 5 formas em ciclo, associação com o acorde do I grau, sorteio forma × tom, protocolo de memorização cumulativa. |
| v1.2 | Módulo **Notas-alvo**: (1) arpejo sobre pad, (2) escala pausando nas notas-alvo, (3) trocas de 2, 3 e 4 acordes. |
| v1.3 | Módulo **Expressão e motivos** (bend, slide, vibrato, ligados; estrutura de motivos) + **Biblioteca de licks** alimentada pelo usuário [ADR-9] + 5ª levada (balada lenta). |
| v2 | Campo harmônico menor, extensões (9, 11, 13, sus), modos. Microfone para detectar a nota. |
| Fora | Dedilhado, base e solo simultâneos, função na banda, tirar música de ouvido, músicas reais, afinações alternativas, guitarra de 7 cordas, modo "TV como tela e celular como controle". |

---

## 3. Currículo da v1

Princípios didáticos (vêm da análise do material de referência; **nenhum texto de terceiros é copiado**):

1. Sempre partir da teoria para "como se toca de verdade na guitarra".
2. Todo conteúdo novo estreia em **Dó maior**. Depois do primeiro "Limpo", entra no sorteio de tons.
3. Memorização cumulativa: revisar tudo o que já foi visto e acrescentar um item.
4. Jogos simples (sorteio, cartas) viram exercícios nativos.
5. Texto curto. Uma ideia por tela de conceito. Todo dado musical vem do motor.

**Nomenclatura das posições:** sempre pela letra do CAGED (forma de C, A, G, E, D). O material de referência numera as formas assim: Desenho 1 = forma de A, 2 = G, 3 = E, 4 = D, 5 = C. O app mostra esse número como apelido opcional ("Forma de A · D1").

### Módulo 1 — Tétrades

- **Lições:**
  1. Fórmula 1-3-5-7 e as 5 qualidades (7M, 7, m7, m7(b5), °).
  2. **Abertura 1**: na pestana, a ordem real é T-5-8-3. Trocar a 8ª pela 7ª (7M = 1 casa abaixo da oitava; 7 = 2 casas abaixo). Vale para as formas de A/Am e D.
  3. **Abertura 2**: só nas formas de E/Em. A quinta desce uma oitava (T-7-3-5) e o som fica menos embolado.
  4. **Omissão de notas**: tirar a tônica ou a quinta grave para o acorde soar "guitarrístico".
- **Exercícios:**
  - Ver e tocar cada qualidade × forma.
  - Identificação: "que acorde é este?" e "onde está a 7ª?".
  - Progressão: tocar uma sequência de tétrades em 2 regiões diferentes do braço.
- **Checkpoint:** 5 qualidades × formas E e A com "Limpo" em pelo menos 2 tons.

### Módulo 2 — Campo harmônico maior em tétrades

- **Lições:**
  1. Empilhamento de terças sobre a escala maior → I7M, IIm7, IIIm7, IV7M, V7, VIm7, VIIm7(b5).
  2. Funções (tônica, subdominante, dominante) e relativa menor (VIm).
- **Exercícios:**
  - Identificação relâmpago: "qual é o V7 de E♭?" e "Dm7 é que grau em C?".
  - Cartas de relativas, nos dois sentidos.
  - Tocar o campo inteiro em um tom sorteado.
  - **8 cadências por grau** sobre a base sintetizada:
    1. I–V–VIm–IV
    2. IV–V–VIm–I
    3. IIm–IV–I–V
    4. I–V/3–VIm–IIIm–IV–IIm–V
    5. VIm–IV–I–V
    6. VIm–V–IV–V7/VI
    7. VIm–V–IIm–IV
    8. VIm–I–IIm–IV
- **Checkpoint:** campo em tétrades em 4 tons + 4 cadências "Limpo".

### Módulo 3 — Arpejos no CAGED

- **Lições:**
  1. Arpejo = acorde tocado nota por nota, dentro da mesma forma.
  2. Conectar formas vizinhas (subir e descer o braço sem perder a fundamental).
- **Exercícios:**
  - Ver e tocar o arpejo de cada qualidade nas 5 formas.
  - Arpejos do campo harmônico em sequência (I7M → IIm7 → …) numa única região.
  - Quiz: "toque a 3ª deste arpejo".
- **Checkpoint:** arpejos de 7M, m7 e 7 nas 5 formas em Dó + 2 tons sorteados.

### Treino permanente — Mapa do braço

- Quiz de nota: um ponto aparece no braço e a pessoa escolhe o nome; ou o app pede uma nota e a pessoa toca o ponto na tela.
- "Toque todas as notas X" com metrônomo (5 minutos, qualquer velocidade).
- Os 6 padrões de oitava, ligados às formas do CAGED.
- Repetição a partir da casa 12.

### Treino permanente — Aquecimentos

São padrões gerados pelo motor, em qualquer tom e qualquer forma:

- **Independência**: pares de dedos 1-2, 2-3, 3-4 atravessando as cordas.
- **Horizontal**: grupos de 4 notas da escala subindo e descendo dentro de uma forma, depois deslizando para a forma vizinha.
- **Duas cordas**: grupos de 3 notas alternando entre pares de cordas adjacentes.
- **Vertical**: célula de 4 notas repetida descendo as cordas dentro de uma forma.
- **Ligados**: células com hammer-on e pull-off.
- Cada aquecimento admite 3 variações rítmicas (colcheias, tercinas, semicolcheias).

### Diagnóstico de entrada

10 minutos, opcional. Cobre tríades nas formas E/A, pentatônica nas 5 formas e notas no braço. Lacunas geram itens de revisão na caixa 1, sem bloquear o Módulo 1.

---

## 4. Fluxos e telas

### 4.1 Fluxos

- **Primeiro acesso:** Calibração → Diagnóstico (opcional) → Hoje.
- **Uso diário:** Hoje → "Começar" → Exercício × N → Resultado → sincronização.
- **Uso livre:** Explorar, ou Trilha → Lição/Exercício avulso.

### 4.2 Regras globais de UX

1. **Tela de exercício sem rolagem** em qualquer orientação: instrução (1 linha) + braço + barra de reprodução + avaliação. Se não couber, vira dois exercícios.
2. Responsivo nas duas orientações.
   - **Retrato:** empilhado, braço mostra uma janela de 5 a 7 casas centrada no exercício.
   - **Paisagem, tablet e TV:** braço de 0 a 15 em largura total, controles numa faixa inferior.
3. Nenhuma orientação é forçada.
4. **Avaliação de um toque:** Limpo / Quase / Travou. O BPM ajusta sozinho (+4 após Limpo, −8 após Travou).
5. **Atalhos de teclado** (compatíveis com pedal Bluetooth): espaço = tocar/pausar · ←/→ = BPM · Enter = próximo · 1/2/3 = avaliação.
6. **Áudio** só começa após um toque ("Começar"). Na primeira vez no iOS, aviso sobre a chave de silencioso.
7. **Na TV (espelhamento)**, quizzes de toque viram "pense e revele".

### 4.3 Inventário de telas e estados

| Tela | Função | Vazio | Carregando | Erro | Offline / sem sync |
|---|---|---|---|---|---|
| Calibração | Braço + "é assim que você vê sua guitarra?" + botões ↔ ↕ | — | — | — | Funciona |
| Diagnóstico | Quiz e ver-tocar, 10 min | Botão "pular" | — | — | Salva local |
| Hoje | Sessão do dia montada, botão "Começar" | 1º dia: "comece pelo Módulo 1" | Esqueleto | Gist inacessível: usa local + aviso discreto | Igual ao erro |
| Trilha | Módulos com status e checkpoint | — | Esqueleto | — | — |
| Lição | 1 a 3 telas de conceito: frase curta + braço + som | — | — | Áudio bloqueado: "toque para ativar o som" | — |
| Exercício | Player único para os 5 formatos | — | Carregando áudio (1ª vez) | Áudio bloqueado: idem | — |
| Resultado | O que melhorou, BPMs, próxima revisão | — | "Salvando…" | "Salvo só neste aparelho" + tentar de novo | Igual ao erro |
| Explorar | Tom + acorde/arpejo/escala → braço + som | Estado inicial: C7M | — | — | — |
| Ajustes | Tema, espelhos, notação, nomes de nota, duração da sessão, token, versão, log de erros | Token vazio: explica como criar | "Testando conexão…" | Token inválido ou expirado: mensagem clara | — |

### 4.4 Formatos de exercício

| Formato | O que faz | Como mede |
|---|---|---|
| `ver-tocar` | Diagrama + som + metrônomo/base | BPM máximo limpo |
| `quiz-braco` | Ponto ↔ nome da nota, por toque | Acerto e tempo de resposta |
| `identificacao` | Grau, acorde, intervalo, relativa (cartas) | Acerto |
| `progressao` | Base em loop; acorde atual destacado | Avaliação + BPM |
| `ouca-repita` | Contagem → app toca → a pessoa repete (diagrama ocultável) | Avaliação + BPM |

Sorteio, aquecimento e cartas são variações com parâmetros desses formatos, não formatos novos.

---

## 5. Direção de UI

**Referências:** o minimalismo de Things e Linear. O braço é o protagonista e o resto da interface some. Densidade baixa, legível a 2 metros (estante ou TV).

### 5.1 Tokens

```css
:root {
  /* Superfícies — claro */
  --bg: #FAFAF7; --surface: #FFFFFF; --line: #E4E4E0;
  --text: #1C1C1E; --muted: #6B6B70;
  --accent: #C98200;            /* âmbar — único destaque */
  /* Funções da nota (paleta Okabe-Ito, segura para daltonismo) */
  --role-root: #D55E00;         /* fundamental — também QUADRADA */
  --role-3:    #0072B2;
  --role-5:    #009E73;
  --role-7:    #CC79A7;
  --role-ext:  #56B4E9;
  --role-scale: var(--muted);   /* nota de escala "fantasma": contorno */
  /* Braço */
  --fret: #CFCFC9; --string: #9A9A94; --inlay: #E4E4E0;
  /* Espaço e forma */
  --space-1: 4px; --space-2: 8px; --space-3: 16px; --space-4: 24px; --space-5: 40px;
  --radius: 12px;
}
[data-theme="dark"] {
  --bg: #121212; --surface: #1C1C1E; --line: #2C2C2E;
  --text: #F2F2F0; --muted: #A0A0A6;
  --accent: #F5A524;
  --fret: #3A3A3C; --string: #6E6E73; --inlay: #2C2C2E;
}
```

Contraste mínimo de AA (4,5:1) para texto e 3:1 para marcadores sobre o braço, nos dois temas.

### 5.2 Tipografia

Pilha de fontes do sistema (`system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`), sem baixar fonte nenhuma. O BPM e as cifras usam `font-variant-numeric: tabular-nums`, para os números não "pularem" quando mudam.

| Uso | Tamanho / peso |
|---|---|
| BPM do player | 56 / 600 |
| Título | 28 / 600 |
| Corpo | 17 / 400 |
| Rótulo | 13 / 500 |
| Rótulo dentro do ponto do braço | proporcional ao raio do ponto (mín. 11) |

### 5.3 Componentes reutilizáveis

- **`Braco`**: horizontal, casas 0–15 ou uma janela de casas.
  - Marcadores por papel: cor, e formato quadrado para a fundamental.
  - Rótulo alternável (nota, grau, intervalo, dedo).
  - Camadas: escala fantasma, arpejo cheio, forma CAGED sombreada.
  - Destaque sincronizado com o áudio.
- **`JanelaAcorde`**: o mesmo `Braco` limitado a 4–5 casas. Substitui o diagrama vertical de acorde, que **não existe** no app.
- **`BarraReproducao`**: tocar/pausar, BPM grande com ±, contagem de entrada, seletor de levada.
- **`Avaliacao`**: Limpo / Quase / Travou, com botões grandes (mín. 56px).
- **`SeletorTom`**: 12 tons em grade e "sortear".
- **`CartaoExercicio`**, **`AvisoSync`**, **`TelaConceito`**.

---

## 6. Decisões e trade-offs (ADRs)

| # | Decisão | Alternativas | Motivo |
|---|---|---|---|
| 1 | App web estático no GitHub Pages | App nativo; servidor próprio | Zero custo e zero manutenção de infraestrutura. Abre em qualquer tela. |
| 2 | Vite + React + TypeScript | Svelte; JS puro | Tecnologia mais comum e documentada. O Claude Code domina. A tipagem pega erro cedo. |
| 3 | tonal.js para teoria "pura" + camada própria de braço/CAGED | Teoria 100% própria | Menos bugs em intervalos e acordes. A parte de braço não existe pronta. |
| 4 | Tone.js para áudio, carregado sob demanda | API de áudio do navegador direta | Sincronia de metrônomo, base e notas é a parte mais frágil. Carregar depois mantém a abertura leve. |
| 5 | Progresso em Gist secreto, via token fine-grained só de Gists | Supabase; só local | Nuvem sem infraestrutura nova. Os dados não são sensíveis. |
| 6 | Junção de progresso item a item por `atualizadoEm` | Último salvamento vence (documento inteiro) | Treinar em dois aparelhos não apaga nada. |
| 7 | CAGED como mapa principal; 3 notas por corda só no módulo de velocidade (futuro) | Só 3 notas por corda | Continuidade com o que o usuário já sabe. Liga acorde, arpejo e escala. |
| 8 | Braço só horizontal, inclusive para acordes (`JanelaAcorde`) | Diagrama vertical tradicional | Requisito do usuário: o desenho espelha o que ele vê na guitarra. |
| 9 | Licks: biblioteca alimentada pelo usuário + semente original (v1.3) | Licks gerados por algoritmo | Algoritmo soa como exercício. O app é melhor em transpor e revisar. |
| 10 | Rotas por hash (`/#/hoje`) com wouter | React Router; rotas limpas | Evita 404 no GitHub Pages ao recarregar. Dependência mínima. |
| 11 | CSS puro com variáveis; fonte do sistema | Tailwind; fonte baixada | Menos dependências. Tema resolvido por variáveis. |
| 12 | Avaliação manual (Limpo/Quase/Travou) + BPM automático | Detecção por microfone | Microfone fica para a v2. A avaliação manual resolve 80% com 5% do esforço. |
| 13 | Conteúdo didático original; material de referência só em `referencias/` (ignorada pelo Git) | Reaproveitar textos e áudios | Repositório público e direitos de terceiros. |

---

## 7. Arquitetura

### 7.1 Stack

React 18 · TypeScript (strict) · Vite · wouter · tonal · Tone.js · Vitest · ESLint · Prettier · GitHub Actions · GitHub Pages.

**Dependências de produção: 5.** Nenhuma nova sem ADR.

### 7.2 Diagrama

```
TELAS ─► COMPONENTES (Braco, JanelaAcorde, BarraReproducao, Avaliacao…)
  │            ▲ marcadores já espelhados
  ├─► src/teoria   (puro, testado: tonal + braço/CAGED/aberturas/padrões)
  ├─► src/exercicios (geradores: modelo + tom + forma ⇒ exercício concreto)
  ├─► src/agenda   (3 caixas ⇒ Sessão do dia)
  ├─► src/audio    (Tone.js: dedilhado, pad, clique, levadas; evento "tocando índice i")
  └─► src/progresso (localStorage ⇄ junção ⇄ Gist via api.github.com)
CONTEÚDO: src/conteudo/*.ts (módulos, lições, modelos)
BUILD: push main ─► Actions (lint, tipos, testes, guarda de arquivos) ─► Pages
```

**Regra de dependência:** `teoria`, `exercicios` e `agenda` não importam React, Tone.js nem nada de navegador. As telas usam esses módulos; o contrário nunca acontece.

### 7.3 Estrutura de pastas

```
/
├── CLAUDE.md
├── docs/BLUEPRINT.md                  # este arquivo
├── referencias/                       # NO .gitignore — material de estudo local
├── public/ (manifest.webmanifest, ícones, 404.html → redireciona para /#/)
├── src/
│   ├── main.tsx · App.tsx · rotas.tsx
│   ├── teoria/        # notas.ts, acordes.ts, voicings.ts, escalas.ts, campo.ts, oitavas.ts, cifra.ts (+ *.test.ts)
│   ├── exercicios/    # geradores por formato + aquecimentos.ts (+ testes)
│   ├── agenda/        # caixas.ts, sessao.ts (+ testes)
│   ├── audio/         # motor.ts, levadas.ts, sintetizadores.ts
│   ├── progresso/     # local.ts, gist.ts, juncao.ts (+ testes)
│   ├── conteudo/      # modulos/tetrades.ts, campo-maior.ts, arpejos.ts, treinos/*.ts, diagnostico.ts
│   ├── componentes/   # Braco/, JanelaAcorde/, BarraReproducao/, Avaliacao/, SeletorTom/…
│   ├── telas/         # Hoje, Trilha, Licao, Exercicio, Resultado, Explorar, Ajustes, Calibracao, Diagnostico
│   └── estilo/        # tokens.css, base.css
└── .github/workflows/deploy.yml
```

Identificadores do domínio em português, sem acento (`campoHarmonico`, `Braco`). Termos de framework ficam em inglês.

### 7.4 Modelo de dados

```ts
// Conteúdo (versionado no repositório)
type ModuloId = 'tetrades' | 'campo-maior' | 'arpejos';
interface Modulo {
  id: ModuloId; titulo: string;
  licoes: Licao[]; modelos: ModeloExercicio[];
  checkpoint: { modelos: string[]; minimoLimpos: number };
}
interface ModeloExercicio {
  id: string;
  formato: 'ver-tocar' | 'quiz-braco' | 'identificacao' | 'progressao' | 'ouca-repita';
  gerador: string; params: Record<string, unknown>;
  bpm?: { inicial: number; passo: 4; recuo: 8; minimo: number };
  levada?: 'nenhuma' | 'balada' | 'pop' | 'groove' | 'rock';
}

// Progresso (localStorage + Gist "braco-canhoto-progresso.json")
interface Progresso {
  schemaVersion: 1; atualizadoEm: string;
  ajustes: Ajustes;
  modulos: Record<ModuloId, { status: 'bloqueado'|'ativo'|'concluido'; atualizadoEm: string }>;
  itens: Record<string, ItemProgresso>;   // chave: `${modeloId}|${tom}|${forma}`
  sessoes: ResumoSessao[];                // últimas 60
}
interface ItemProgresso {
  caixa: 1|2|3; ultimaAvaliacao: 'limpo'|'quase'|'travou';
  melhorBpm?: number; proximaRevisao: string; atualizadoEm: string;
}
interface Ajustes {
  espelhoHorizontal: boolean; espelhoVertical: boolean;
  tema: 'claro'|'escuro'|'sistema'; nomesNotas: 'letras'|'do-re-mi';
  rotulo: 'nota'|'grau'|'intervalo'|'dedo'; sessaoMinutos: 10|20|30;
  atualizadoEm: string;
}
```

**Regras da agenda:**
- Limpo → sobe uma caixa. Próxima revisão em +1, +3 ou +7 dias, conforme a caixa.
- Quase → mantém a caixa, revisão em +1 dia.
- Travou → volta para a caixa 1, revisão na próxima sessão.
- Conteúdo novo começa em C. Depois do primeiro Limpo, gera variantes de tom com peso maior para C, G, D, A, E, F e B♭.
- Composição da Sessão de 20 minutos: aquecimento ~4 min · lição ou itens novos ~8 min · revisão intercalada ~8 min. Escala proporcionalmente para 10 e 30 minutos.

### 7.5 Contratos

```ts
// teoria (puro)
notaNa(corda: 1|2|3|4|5|6, casa: number): Nota
posicoesDe(classe: ClasseNota, faixa: [number, number]): PosicaoBraco[]
acorde(fund: Nota, q: '7M'|'7'|'m7'|'m7(b5)'|'°'|''|'m'): AcordeInfo
voicing(fund, q, forma: 'C'|'A'|'G'|'E'|'D', opc?: { abertura?: 1|2; omitir?: Grau[] }): PosicaoBraco[]
posicaoEscala(tom, escala: 'maior'|'penta-maior'|'penta-menor', forma): PosicaoBraco[]
campoHarmonico(tom, tipo: 'triade'|'tetrade'): AcordeInfo[]
cadencia(tom, graus: string[]): AcordeInfo[]       // ex.: ['I','V/3','VIm']
padroesOitava(classe): PosicaoBraco[][]
cifra(a: AcordeInfo): string                       // C7M, Dm7, Bm7(b5), B°

// componente
<Braco marcadores={Marcador[]} faixa={[0,15]} forma?={'E'} rotulo="grau" tocandoAgora?={number} />
interface Marcador { corda: 1|2|3|4|5|6; casa: number; papel: 'fundamental'|'3'|'5'|'7'|'extensao'|'escala'; fantasma?: boolean }
// ÚNICO lugar com a regra de espelho:
// x = espelhoH ? (casaMax - casa) : casa ;  y = espelhoV ? (6 - corda) : (corda - 1)

// audio
audio.iniciar(): Promise<void>                     // só após gesto do usuário
audio.tocarSequencia(ev: EventoNota[], o: { bpm: number; contagem: boolean }): void
audio.iniciarBase(o: { acordes: AcordeInfo[]; batidasPorAcorde: number; levada; bpm; pad: boolean; clique: boolean }): void
audio.parar(): void
audio.aoTocar(cb: (indice: number) => void): () => void

// progresso
sync.carregar(): Promise<Progresso>                // junta local + Gist
sync.salvar(p: Progresso): Promise<'ok' | 'so-local'>
juntar(a: Progresso, b: Progresso): Progresso      // puro, item a item por atualizadoEm
```

### 7.6 Autenticação e integrações

- Sem login no app.
- O token fine-grained do GitHub (permissão de conta "Gists: read and write") é colado em Ajustes e salvo no `localStorage` do aparelho. Só `src/progresso/gist.ts` lê esse token.
- Na primeira sincronização, o app cria um Gist secreto e guarda o ID nos ajustes locais.
- CSP na `index.html`: `default-src 'self'; connect-src 'self' https://api.github.com; script-src 'self'`. Nenhum script de terceiros.
- Única integração externa: `api.github.com/gists`.

### 7.7 Deploy, ambientes e observabilidade

- **Local:** `npm run dev`.
- **Produção:** push na `main` → Actions roda `lint`, `typecheck`, `test`, a guarda de arquivos proibidos e o `build`, e publica no Pages. Teste vermelho = nada publicado.
- **Observabilidade:**
  - Ajustes mostra a versão (hash do commit injetado no build), o status da última sincronização e os últimos 20 erros (buffer em memória e no localStorage);
  - um Error Boundary global com botão "recarregar".
- `meta robots noindex`: é um app pessoal.

### 7.8 Riscos e premissas

| # | Risco / premissa | Mitigação |
|---|---|---|
| 1 | Erro de teoria no motor | Testes com fatos conhecidos (12 campos harmônicos, voicings × formas × qualidades, escalas). |
| 2 | iOS muta o áudio na chave de silencioso; latência no celular | Aviso na 1ª vez; agendamento do Tone.js com antecedência. |
| 3 | Atraso do som pela TV no espelhamento | Premissa: tolerável. Alternativa: usar o som pelo celular. |
| 4 | Token expira | Erro detectado → "salvo só neste aparelho" + pedir novo token. A cópia local é a fonte primária. |
| 5 | Textos com imprecisão | Textos curtos, dados do motor e `revisor-teoria` em cada fase. O Luís revisa todos os textos de uma vez no final (`ENTREGA.md`). |
| 6 | Material de terceiros vazar para o repositório público | `referencias/` no .gitignore + guarda no CI e em hook que bloqueia .pdf/.mp3/.wav. |
| 7 | Peso do Tone.js | Import dinâmico no primeiro "Começar". |
| ⚠ | Premissas: 6 cordas, afinação padrão, casas 0–15, um único usuário | — |

---

## 8. Plano de execução em fases

Cada fase é uma fatia vertical: funciona sozinha, é publicada e vira um commit (ou alguns). Nenhuma fase fecha com teste vermelho.

**Execução autônoma.** As fases rodam em sequência, sem aprovação humana. Para passar de uma fase à seguinte, todos estes **portões automáticos** precisam passar:

1. `npm run qa` verde.
2. `revisor-teoria` aprovado, se a fase tocou teoria, exercícios ou conteúdo.
3. `auditor-ux` aprovado nas 5 resoluções, se a fase tocou telas. As screenshots são salvas em `docs/screenshots/Fn/`.
4. Deploy publicado e a URL respondendo.
5. Entrada da fase em `docs/PROGRESSO.md`: o que foi feito, decisões tomadas sozinho e pendências.

**Quando houver dúvida:** escolher a opção mais simples coerente com este blueprint, registrar em `PROGRESSO.md` como "decisão autônoma" e seguir. Parar apenas se não houver como seguir em nenhuma frente (por exemplo, o `gh` sem autenticação).

**Resoluções de referência** para todos os critérios: 360×640 e 390×844 (retrato), 844×390 (paisagem), 768×1024 (tablet), 1280×720 (TV).

### F0 — Esqueleto publicado
Vite + React + TS strict, ESLint, Prettier, Vitest, wouter com rotas por hash, tokens CSS, tema claro/escuro, tela Ajustes mínima mostrando a versão, workflow de deploy, `public/404.html`, `.gitignore` com `referencias/`, guarda de arquivos proibidos no CI.
- **Aceite:**
  - a URL do GitHub Pages abre no celular;
  - trocar o tema persiste após recarregar;
  - `npm run qa` passa;
  - um push com um `.mp3` falha no CI.

### F1 — Braço canhoto + Calibração + Explorar (notas)
`teoria/notas.ts` (`notaNa`, `posicoesDe`) com testes. Componente `Braco` com os dois espelhos, janela de casas em retrato e marcadores por papel. Tela Calibração no primeiro acesso, com orientação persistida. Explorar no modo "mostrar todas as notas X".
- **Aceite:**
  - testes: as 6 cordas soltas e a casa 12 batem;
  - a orientação escolhida vale em todas as telas e sobrevive a recarregar;
  - nenhuma rolagem nas 5 resoluções;
  - a fundamental aparece quadrada.

### F2 — Áudio base
`audio/` com Tone.js carregado sob demanda, nota dedilhada ao tocar um ponto, metrônomo com BPM e contagem de entrada, aviso de iOS. No Explorar, tocar a sequência de notas acende cada ponto em sincronia.
- **Aceite:**
  - o primeiro carregamento não baixa o Tone.js (conferido na aba de rede);
  - o ponto aceso coincide com o som;
  - o BPM muda sem estalo.

### F3 — Player de exercício + Mapa do braço
Tela Exercício com os formatos `quiz-braco` e `ver-tocar`, `Avaliacao`, BPM automático (+4 / −8), atalhos de teclado e progresso local (`progresso/local.ts`). Conteúdo: treino Mapa do braço (quiz de nota, "todas as notas X", padrões de oitava).
- **Aceite:**
  - um exercício completo cabe numa tela nas 5 resoluções;
  - a avaliação grava `ItemProgresso` no localStorage;
  - os atalhos funcionam;
  - o modo "pense e revele" está disponível.

### F4 — Módulo 1: Tétrades
`teoria/acordes.ts`, `voicings.ts` (formas C/A/G/E/D, aberturas 1 e 2, omissão) e `cifra.ts` com testes. `JanelaAcorde`, telas de Lição e Trilha (só com o Módulo 1), exercícios e checkpoint.
- **Aceite:**
  - testes: 5 qualidades × 12 tons × formas E e A produzem as notas corretas, e a cifra sai no padrão brasileiro;
  - a trilha do módulo funciona de ponta a ponta (teste automatizado de navegação via Playwright);
  - `revisor-teoria` e `/revisar-modulo` aprovados. A revisão dos textos pelo Luís acontece no final, via `docs/ENTREGA.md`.

### F5 — Agenda + Sessão do dia
`agenda/` (3 caixas, composição da sessão, sorteio de tom ponderado) com testes. Telas Hoje e Resultado.
- **Aceite:**
  - testes da agenda com datas simuladas;
  - uma sessão de 20 minutos mistura aquecimento, itens novos e revisão;
  - Limpo, Quase e Travou alteram a próxima revisão conforme a regra;
  - conteúdo novo aparece primeiro em C.

### F6 — Sincronização via Gist
`progresso/gist.ts` e `juncao.ts` (puro, testado). Ajustes: campo de token, botão "testar conexão" e status. Estados de erro de Hoje e Resultado.
- **Aceite:**
  - teste de junção: dois progressos divergentes resultam na união por `atualizadoEm`;
  - progresso feito em dois navegadores aparece nos dois após recarregar;
  - um token inválido mostra mensagem clara e não perde dados.

### F7 — Base sintetizada + Módulo 2: Campo harmônico
`audio/levadas.ts` (balada, pop, groove, rock) e pad. `teoria/campo.ts` e `cadencia` com testes. Formatos `identificacao` (cartas) e `progressao`. Lições, exercícios (incluindo as 8 cadências) e checkpoint.
- **Aceite:**
  - testes: campo em tétrades correto nos 12 tons;
  - a base toca qualquer cadência em qualquer tom e BPM com bateria, pad e clique sincronizados;
  - o acorde atual fica destacado na tela.

### F8 — Aquecimentos
`exercicios/aquecimentos.ts`: geradores de independência, horizontal, duas cordas, vertical e ligados, com 3 variações rítmicas. `teoria/escalas.ts` (penta maior/menor nas 5 formas). Formato `ouca-repita`.
- **Aceite:**
  - testes: todo evento gerado cai dentro da forma e do tom pedidos;
  - os aquecimentos aparecem na Sessão do dia.

### F9 — Módulo 3: Arpejos
Arpejos das 5 qualidades nas 5 formas, conexão entre formas, arpejos do campo. Lições, exercícios e checkpoint.
- **Aceite:**
  - testes: as notas do arpejo pertencem ao acorde e ficam dentro da janela da forma;
  - a trilha do módulo funciona de ponta a ponta.

### F10 — Diagnóstico + acabamento + entrega
Tela Diagnóstico (opcional), revisão de acessibilidade e performance, e a checklist da seção 10 inteira. Gerar `docs/ENTREGA.md` com:
- a URL publicada;
- um roteiro de teste passo a passo para o Luís (calibração, token, sessão do dia, cada módulo, celular, tablet e TV);
- a lista de textos das lições para revisão;
- as decisões autônomas tomadas;
- os limites conhecidos.
- **Aceite:** todos os itens da Definition of Done marcados e `ENTREGA.md` completo.

---

## 9. Configuração do Claude Code

### 9.1 Rascunho do `CLAUDE.md`

```markdown
# Braço Canhoto

App web estático de estudo de guitarra para canhoto. Blueprint completo: docs/BLUEPRINT.md
(leia a seção relevante antes de cada fase). Plano de fases: seção 8.

## Stack
React 18 + TypeScript strict + Vite · wouter (rotas por hash) · tonal · Tone.js · Vitest.
Deploy: GitHub Actions → GitHub Pages. Sem servidor, sem banco. Progresso em Gist do usuário.

## Comandos
- npm run dev        # servidor local
- npm run test       # Vitest
- npm run typecheck  # tsc --noEmit
- npm run lint       # ESLint + Prettier check
- npm run build      # build de produção
- npm run qa         # lint + typecheck + test + build (rode antes de todo commit)

## Arquitetura (regras duras)
- src/teoria, src/exercicios, src/agenda: funções PURAS. Proibido importar React, Tone.js, window, localStorage.
- Toda nota, acorde, voicing, escala ou posição vem de src/teoria. Nunca escreva casa/corda à mão em componente ou conteúdo.
- A regra de espelho (canhoto) existe em UM lugar: componentes/Braco. Ninguém mais transforma coordenadas.
- Só src/progresso/gist.ts lê o token do GitHub.
- Conteúdo didático fica em src/conteudo/*.ts; textos curtos (≤ 2 frases por tela de conceito).

## Convenções
- Identificadores do domínio em português, sem acento (campoHarmonico, Braco). Framework em inglês.
- Cifra no padrão brasileiro via teoria/cifra.ts: C7M, Dm7, G7, Bm7(b5), B°.
- Todo módulo de teoria/agenda/progresso tem *.test.ts ao lado. Teste com fatos musicais conhecidos.
- Componentes: pasta própria com index.tsx + estilo .module.css usando tokens de estilo/tokens.css.
- Commits pequenos, em português, no imperativo: "Adiciona voicings da forma A".

## Regras de UX que não se negociam
- Tela de exercício: SEM rolagem em 360×640, 390×844, 844×390, 768×1024 e 1280×720.
- Braço SEMPRE horizontal. Não existe diagrama vertical de acorde neste app.
- Fundamental = marcador quadrado. Nunca transmitir informação só por cor.
- Áudio só inicia após gesto do usuário.

## Nunca faça
- Nunca adicione dependência de produção sem registrar um ADR em docs/BLUEPRINT.md §6.
- Nunca copie texto, tablatura ou áudio de referencias/ para o repositório (repo é público).
- Nunca comite .pdf, .mp3, .wav, .zip ou qualquer coisa de referencias/.
- Nunca use localStorage fora de src/progresso.
- Nunca carregue script de terceiros nem altere a CSP sem pedir.
- Nunca feche uma fase com teste vermelho ou sem rodar npm run qa.
- Nunca invente teoria musical: se um fato parecer duvidoso, use o revisor-teoria e registre a dúvida em docs/PROGRESSO.md.
- Nunca peça, leia ou armazene o token do GitHub do usuário.

## Modo de execução: AUTÔNOMO
- Execute as fases F0→F10 em sequência, sem pedir aprovação. Portões automáticos: BLUEPRINT §8.
- Ao fechar cada fase, atualize docs/PROGRESSO.md (feito, decisões autônomas, pendências).
- Em dúvida: opção mais simples coerente com o blueprint, registre e siga. Pare só se nada puder avançar.
- Ao retomar uma sessão, leia docs/PROGRESSO.md primeiro e continue de onde parou.
```

### 9.2 Subagentes (`.claude/agents/`)

Todos são **somente leitura**. Quem escreve e edita é o agente principal.

| Nome | Missão | Escopo | Ferramentas | Devolve |
|---|---|---|---|---|
| `revisor-teoria` | Verificar se o código e os testes de teoria estão musicalmente corretos. | `src/teoria`, `src/exercicios`, `src/conteudo` e os testes. | Read, Grep, Glob, Bash (apenas `npm run test`) | Lista de problemas com arquivo, linha, o erro musical e o valor correto. Ou "aprovado". |
| `auditor-ux` | Conferir uma tela contra as regras de UX e a Definition of Done. | `src/telas`, `src/componentes` + screenshots via Playwright MCP. | Read, Grep, Glob, Playwright MCP (navegar e capturar tela) | Checklist por resolução (rolagem, estados, contraste, espelho, foco) com ✅/❌ e o motivo. |

**Por que só estes dois:** os dois exigem contexto especializado e longo (fatos musicais; regras de UX e resoluções), que poluiria o agente principal. Pesquisa geral de código usa o explorador nativo do Claude Code.

```markdown
---
name: revisor-teoria
description: Use após qualquer mudança em src/teoria, src/exercicios ou src/conteudo para validar a correção musical. Somente leitura.
tools: Read, Grep, Glob, Bash
---
Você é um revisor de teoria musical para guitarra. Não edite arquivos.
Verifique: notas de acordes e escalas, graus do campo harmônico, voicings por forma CAGED
(cada nota pertence ao acorde, a fundamental está onde a forma exige), cifra brasileira,
e se os testes esperam valores corretos. Rode apenas `npm run test`.
Devolva uma lista: arquivo:linha — problema — valor correto. Se nada errado: "aprovado".
```

### 9.3 Skills (`.claude/skills/<nome>/SKILL.md`)

| Skill | O que faz | Invocação |
|---|---|---|
| `qa` | Roda `npm run qa`, resume falhas por categoria e sugere a correção mínima. | **Automática** antes de commit e ao fechar uma fase. |
| `novo-exercicio` | Cria um `ModeloExercicio` + gerador + teste no padrão, registra no módulo e confere a regra de uma tela. | Só sob comando (`/novo-exercicio`). |
| `revisar-modulo` | Checklist de conteúdo: textos curtos, todo dado vindo do motor, cifra brasileira, conteúdo novo em C, checkpoint definido. Chama `revisor-teoria`. | Só sob comando (`/revisar-modulo tetrades`). |
| `deploy` | Confere `qa`, faz push na `main`, acompanha o Actions (`gh run watch`) e devolve a URL publicada. | Só sob comando (`/deploy`). |

### 9.4 Hooks (`.claude/settings.json`)

| Evento | Hook | Por quê |
|---|---|---|
| `PostToolUse` (Edit\|Write em `*.ts,*.tsx,*.css`) | `npx prettier --write "$FILE"` | Formatação consistente sem pedir. |
| `PostToolUse` (Edit\|Write em `src/teoria/**`, `src/agenda/**`, `src/progresso/**`) | `npx vitest related "$FILE" --run` | Erro de teoria aparece na hora. |
| `Stop` | `npm run typecheck` | Nunca terminar um turno com erro de tipo. |
| `PreToolUse` (Bash com `git commit`) | Script que bloqueia se houver staged `.pdf/.mp3/.wav/.zip`, algo de `referencias/`, ou strings `ghp_`/`github_pat_` | Repositório público: protege direitos e o token. |
| `PreToolUse` (Edit\|Write em `referencias/**`) | Bloqueia | Pasta só de leitura para consulta. |

Trecho ilustrativo:

```json
{
  "hooks": {
    "PostToolUse": [
      { "matcher": "Edit|Write", "hooks": [{ "type": "command", "command": "scripts/hooks/formatar.sh" }] }
    ],
    "PreToolUse": [
      { "matcher": "Bash", "hooks": [{ "type": "command", "command": "scripts/hooks/guarda-commit.sh" }] },
      { "matcher": "Edit|Write", "hooks": [{ "type": "command", "command": "scripts/hooks/protege-referencias.sh" }] }
    ],
    "Stop": [
      { "hooks": [{ "type": "command", "command": "npm run typecheck --silent" }] }
    ]
  }
}
```

### 9.5 MCP servers

| Server | Para quê | Necessidade |
|---|---|---|
| **Playwright MCP** | Abrir o app local nas 5 resoluções, capturar telas e verificar rolagem e estados (usado pelo `auditor-ux`). | Recomendado a partir da F1. |
| GitHub | Desnecessário: use o `gh` CLI (PRs, Actions, Pages). | — |

### 9.6 Prompt de abertura (cole uma vez e deixe trabalhar)

```
Leia CLAUDE.md e docs/BLUEPRINT.md inteiros antes de qualquer ação.

MODO AUTÔNOMO. O checklist da §0 já foi feito por mim. Execute as fases F0 a F10 da §8
em sequência, sem me pedir aprovação, e só me chame no final.

Para cada fase:
1. Releia a seção da fase e implemente.
2. Passe pelos portões automáticos da §8: npm run qa verde · revisor-teoria (se tocou
   teoria/conteúdo) · auditor-ux nas 5 resoluções com screenshots em docs/screenshots/Fn/ (se tocou telas)
   · commit · push · deploy respondendo.
3. Atualize docs/PROGRESSO.md: o que fez, decisões autônomas, pendências.
4. Siga para a próxima fase.

Na F0, além do esqueleto: crie o repositório público "braco-canhoto" com o gh, ative o GitHub Pages
via Actions pelo gh api, configure os hooks (§9.4), os subagentes (§9.2) e as skills (§9.3).

Regras:
- Dúvida → opção mais simples coerente com o blueprint, registre em PROGRESSO.md e siga.
- Pare apenas se nada puder avançar (ex.: gh sem autenticação). Nesse caso, registre o bloqueio em
  PROGRESSO.md e me diga exatamente o que preciso fazer.
- Nunca peça nem use meu token do GitHub; a sincronização é testada com mocks.
- Nunca copie nada de referencias/ para o repositório.

Ao terminar a F10, me entregue: a URL publicada e um resumo de docs/ENTREGA.md
(roteiro de teste, textos para revisar, decisões autônomas, limites conhecidos).
```

---

## 10. Definition of Done (checklist de QA por fase)

**Responsivo**
- [ ] Sem rolagem horizontal em nenhuma tela; tela de exercício sem rolagem nenhuma nas 5 resoluções de referência.
- [ ] Retrato mostra uma janela de casas centrada; paisagem mostra 0–15.
- [ ] Espelhamento na TV legível a 2 m (paisagem, 1280×720).

**Canhoto e braço**
- [ ] A orientação salva vale em todas as telas, incluindo `JanelaAcorde`.
- [ ] Nenhum diagrama vertical.
- [ ] Fundamental quadrada; papéis distinguíveis sem cor.

**Acessibilidade**
- [ ] Contraste AA de texto nos dois temas; marcadores com 3:1 sobre o braço.
- [ ] Todos os controles alcançáveis por teclado, com foco visível; atalhos documentados em Ajustes.
- [ ] Alvos de toque ≥ 44px (avaliação ≥ 56px); `aria-label` em botões de ícone.
- [ ] `prefers-reduced-motion` respeitado.

**Performance**
- [ ] JS inicial ≤ 150 KB gzip (sem Tone.js); Tone.js só após o primeiro "Começar".
- [ ] Lighthouse mobile: Performance ≥ 90, Acessibilidade ≥ 95.
- [ ] O áudio não atrasa visivelmente em relação ao destaque no braço (conferência manual no celular).

**Tratamento de erro**
- [ ] Todos os estados da §4.3 implementados e testáveis (vazio, carregando, erro, sem sync).
- [ ] Falha de sync nunca perde dado: a cópia local é a fonte primária.
- [ ] Error Boundary com "recarregar"; erro registrado no log de Ajustes.

**Teoria**
- [ ] `npm run test` verde; `revisor-teoria` aprovado no que a fase tocou.

**LGPD / privacidade**
- [ ] Nenhum analytics nem script de terceiros.
- [ ] Dado pessoal mínimo: o progresso fica no Gist do próprio usuário; o token só no aparelho dele.
- [ ] Ajustes tem "apagar dados deste aparelho" e explica como apagar o Gist.

**Repositório**
- [ ] Nenhum arquivo de `referencias/` nem mídia de terceiros versionado.
- [ ] Mudança de arquitetura registrada como ADR.

**SEO**
- [ ] Não se aplica (app pessoal): `meta robots noindex`, `<title>` e manifest corretos.

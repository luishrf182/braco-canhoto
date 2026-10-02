# Progresso — Braço Canhoto

Execução autônoma das fases F0 → F10 (BLUEPRINT §8). Para retomar: leia este arquivo e continue da primeira fase não concluída.

URL: https://luishrf182.github.io/braco-canhoto/
Repositório: https://github.com/luishrf182/braco-canhoto

## Estado

| Fase | Status |
|---|---|
| F0 — Esqueleto publicado | concluída |
| F1 — Braço + Calibração + Explorar | pendente |
| F2 — Áudio base | pendente |
| F3 — Player + Mapa do braço | pendente |
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

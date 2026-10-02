# Braço Canhoto

App web estático de estudo de guitarra para canhoto. Blueprint completo: docs/BLUEPRINT.md
(leia a seção relevante antes de cada fase). Plano de fases: seção 8. Progresso: docs/PROGRESSO.md.

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

## Ambiente (Windows)
- A pasta está no Google Drive (escolha do usuário). Se o npm travar por bloqueio de arquivo, tente de novo.
- `gh` fica em "C:\Program Files\GitHub CLI\gh.exe" e pode não estar no PATH do shell.

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

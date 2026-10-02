# Braço Canhoto — Entrega da v1

**URL:** https://luishrf182.github.io/braco-canhoto/
**Repositório:** https://github.com/luishrf182/braco-canhoto (público; sem nada de `referencias/`)
**Código local:** `C:\projetos\braco-canhoto`. O Google Drive não aceita `npm install`; a pasta antiga no Drive tem só um LEIAME.

Fases F0–F10 concluídas, cada uma com `npm run qa` verde, deploy publicado e registro em `docs/PROGRESSO.md`. As fases de teoria e conteúdo passaram pelo `revisor-teoria`, e as fases de tela pela auditoria nas 5 resoluções (screenshots em `docs/screenshots/Fn/`).

---

## 1. Roteiro de teste (≈ 40 min)

### No computador (10 min)
1. Abra a URL. A tela **"É assim que você vê sua guitarra?"** aparece.
   - Use ↔ e ↕ até o desenho bater com a sua guitarra, olhando de cima na posição de tocar.
   - Toque em "Sim, é assim".
2. **Diagnóstico** (opcional): faça ou pule.
   - Avalie com sinceridade. O que você marcar como Quase ou Travou volta como revisão.
3. **Hoje**: confira o plano (aquecimento, lição nova, exercícios em Dó). Teste 10, 20 e 30 min e "Outra combinação". Toque em **Começar**.
4. Na sessão, teste os **atalhos**: espaço (tocar/pausar), ← → (BPM), 1/2/3 (Limpo/Quase/Travou), Enter (aceitar a sugestão do quiz).
5. No fim, o **Resultado** mostra o que melhorou e a próxima revisão de cada item.

### Sincronização (5 min)
6. Crie o token: GitHub → Settings → Developer settings → Fine-grained tokens. Permissão de conta **Gists: Read and write**, nada mais, validade de 1 ano.
7. Cole o token em **Ajustes → Sincronização → Salvar e testar**. Deve aparecer "Conexão ok".
   - Confira em gist.github.com que surgiu um Gist secreto `braco-canhoto-progresso.json`.
8. Teste o erro: remova o token e cole um inválido. A mensagem tem que ser clara e o progresso não pode sumir.

### No celular (15 min)
9. Abra a URL no celular e cole o mesmo token. O progresso do computador deve aparecer.
10. **Retrato:** o braço mostra uma janela de 5 a 7 casas, com ‹ › para paginar. **Paisagem:** casas 0–15. Nenhuma tela de exercício pode rolar.
11. **Som:**
    - No iPhone, desligue a chave de silencioso (aparece um aviso na primeira vez).
    - Em Explorar → Notas → ▶, confira se o ponto aceso coincide com o som.
    - Mude o BPM durante a execução: não pode haver estalo.
    - Numa cadência (Trilha → Módulo 2), confira se bateria, baixo e pad estão sincronizados e se o timbre está aceitável.
12. **Orientação:** confira em Explorar → Acorde e numa lição que o desenho bate com a guitarra na mão.

### Tablet e TV (10 min)
13. Tablet (768×1024): o layout tem que ficar confortável nas duas orientações.
14. TV por espelhamento:
    - Ative **Ajustes → Modo TV**. Os quizzes viram "Revelar → Próxima".
    - O texto deve ser legível a 2 m.
    - Se o som atrasar na TV, use o som pelo celular.

### Cada módulo (rápido)
15. **Trilha → Módulo 1:** as 4 lições, uma tétrade em cada forma (A, E, D), "Que acorde é este?", "Onde está a 7ª?" e a progressão em duas regiões.
16. **Módulo 2:** lições, graus relâmpago, relativas, campo inteiro e pelo menos 2 cadências com levadas diferentes.
17. **Módulo 3:** lições, arpejo em 2 formas, "Ligar as 5 formas" e "Toque a 3ª".
18. **Treinos:** Mapa do braço (quiz, oitavas, casa 12+) e Aquecimentos (5 padrões, ritmo sorteado, Ocultar diagrama).

---

## 2. Textos das lições para revisar

Todos são originais, com no máximo 2 frases por tela; os dados musicais de cada tela vêm do motor. Para corrigir um texto, edite o arquivo indicado, na linha `texto:`.

### Módulo 1 — Tétrades (src/conteudo/modulos/tetrades.ts)

**Fórmula 1-3-5-7**

1. Tétrade é um acorde de quatro notas: tônica, 3ª, 5ª e 7ª. Você chega nelas empilhando terças a partir da tônica.

2. 7M e 7 têm 3ª maior; m7 e m7(b5) têm 3ª menor. A diferença entre 7M e 7 está só na 7ª.

3. No m7(b5) a 5ª desce meio tom. No ° (diminuto) a 7ª também desce, e as quatro notas ficam à mesma distância.

**Abertura 1**

1. Na pestana da forma de A, as cordas 5 a 2 tocam tônica, 5ª, oitava e 3ª. Repare na oitava na 3ª corda.

2. Troque a oitava pela 7ª: uma casa abaixo para 7M, duas casas abaixo para 7. A 1ª e a 6ª corda ficam mudas.

3. A mesma troca funciona na forma de D, nas quatro cordas mais agudas.

**Abertura 2**

1. Na forma de E, a 7ª vai para a 4ª corda e a 5ª fica no agudo: tônica, 7ª, 3ª e 5ª. A 5ª corda fica muda.

2. As notas ficam mais espalhadas e o acorde soa menos embolado nos graves.

**Omitir notas**

1. Sem a tônica grave, o acorde fica mais leve e deixa espaço para o baixo. A 3ª e a 7ª carregam o som do acorde.

2. Em 7M, 7 e m7, tirar a 5ª também funciona: ela é justa e quase não muda o caráter do acorde.

### Módulo 2 — Campo harmônico maior (src/conteudo/modulos/campo-maior.ts)

**Empilhar terças na escala**

1. Pegue a escala maior e, a partir de cada nota, empilhe terças pulando uma nota da escala. Saem sete tétrades, uma por grau.

2. A sequência de qualidades é sempre a mesma: I7M, IIm7, IIIm7, IV7M, V7, VIm7 e VIIm7(b5). Muda só o tom.

**Funções e relativa menor**

1. I, IIIm e VIm têm função de tônica: repouso. IIm e IV preparam (subdominante); V7 e VIIm7(b5) pedem resolução (dominante).

2. O VIm é a relativa menor: usa as mesmas notas do tom maior. Am é a relativa de C.

### Módulo 3 — Arpejos no CAGED (src/conteudo/modulos/arpejos.ts)

**Acorde nota por nota**

1. Arpejo é o acorde tocado nota por nota, dentro da mesma forma do braço. Você usa as notas do acorde em todas as cordas, não só as do desenho de acorde.

2. A mesma ideia vale para qualquer forma: suba da nota mais grave à mais aguda e volte. A tônica, em quadrado, é a sua referência.

**Ligar as formas**

1. As cinco formas se encaixam ao longo do braço: as casas mais altas de uma forma são as mais baixas da seguinte, com notas em comum. Assim você sobe e desce sem perder a tônica.

---

## 3. Decisões autônomas (resumo; detalhes em `PROGRESSO.md`)

**Ambiente e ferramentas**
- O projeto saiu do Google Drive para `C:\projetos\braco-canhoto` (confirmado com você).
- Hooks em Node (Windows). A auditoria visual usa um script Playwright (`e2e/auditoria.mjs`) no lugar do Playwright MCP.
- `tonal` fixado em 6.4.2 (o pacote 6.5.0 no npm está quebrado).
- Tone.js com relógio por `setTimeout`: a CSP do blueprint bloqueia Worker por blob. A CSP ficou exatamente como no blueprint.

**Braço e visual**
- Cada papel no braço tem um formato próprio (fundamental quadrada, 3ª círculo, 5ª hexágono, 7ª losango), não só cor.
- Os tokens `--string`/`--nut` do tema claro foram escurecidos (#9A9A94 → #85857F) para 3:1 de contraste.

**Teoria e conteúdo**
- Tétrades nas formas A e D (abertura 1) e E (abertura 2), como no blueprint.
- **⚠ Divergência no blueprint §3:** "Abertura 2: a quinta desce uma oitava". Segundo o revisor, em relação à abertura 1 a 5ª *sobe* para a 2ª corda. O texto da lição ficou correto; o `BLUEPRINT.md` não foi alterado.
- O ° é a tétrade diminuta (dim7); a tríade diminuta é escrita Bm(b5).
- 7 padrões de oitava, não 6: são todos os pares de oitava da afinação padrão a até 3 casas.
- Em inversões (G7/B), a guitarra mantém o voicing em posição fundamental e só o baixo sintetizado toca a 3ª.
- Checkpoint do Módulo 3 "em Dó + 2 tons" = 3 tons distintos com Limpo (o primeiro é sempre Dó).

**Prática e progresso**
- Uma lição nova por sessão. Quizzes e cartas não mudam BPM.
- O diagnóstico registra só as lacunas.
- Os ajustes (tema, espelhos) sincronizam entre aparelhos. O token fica só no aparelho.

## 4. Limites conhecidos
- **Escuta real não verificada:** a sincronia som × destaque, a ausência de estalo no BPM e o timbre da base precisam ser conferidos no celular. Os testes automatizados conferem só a ordem e o avanço.
- **Sincronização testada só com GitHub falso** (mocks). O teste com token real é o passo 7 do roteiro.
- Telas Hoje/Trilha não têm "esqueleto" de carregamento: os dados são locais e abrem na hora, e a sincronização roda em segundo plano.
- O aquecimento "horizontal" não desliza para a forma vizinha; a ligação entre formas está no Módulo 3.
- Premissas: 6 cordas, afinação padrão, casas 0–15, um único usuário.
- Backlog da v1.1 em diante: ver BLUEPRINT §2.2.

## 5. Definition of Done (§10)

**Responsivo**
- [x] Sem rolagem horizontal; telas de exercício sem rolagem nas 5 resoluções (auditoria F10: 13 telas × 7 combinações).
- [x] Retrato com janela de casas; paisagem 0–15.
- [ ] Legível na TV a 2 m: verificar no passo 14.

**Canhoto e braço**
- [x] A orientação salva vale em todas as telas, inclusive `JanelaAcorde`; sobrevive a recarregar (teste F10).
- [x] Nenhum diagrama vertical.
- [x] Fundamental quadrada; papéis distinguíveis sem cor.

**Acessibilidade**
- [x] Contraste AA de texto e 3:1 dos marcadores nos dois temas (`npm run contraste`, no `qa`).
- [x] Controles por teclado com foco visível; atalhos documentados em Ajustes.
- [x] Alvos de toque ≥ 44 px (avaliação ≥ 56 px); `aria-label` nos botões de ícone.
- [x] `prefers-reduced-motion` respeitado.

**Performance**
- [x] JS inicial ≈ 90 KB gzip (sem Tone.js); Tone.js só após o primeiro ▶ (`e2e/audio.mjs`).
- [x] Lighthouse mobile (build local): Performance 100, Acessibilidade 100, Boas práticas 100.
- [ ] O áudio não atrasa em relação ao destaque: verificar no passo 11.

**Tratamento de erro**
- [x] Estados da §4.3 implementados: vazio, áudio bloqueado, sem sync, token inválido, "Salvo só neste aparelho".
- [x] Falha de sync nunca perde dado: a cópia local é gravada primeiro (teste F6).
- [x] Error Boundary com "Recarregar"; erros vão para o log em Ajustes.

**Teoria**
- [x] `npm run test` verde (115 testes); `revisor-teoria` aprovado em todas as fases.

**LGPD / privacidade**
- [x] Nenhum analytics nem script de terceiros; CSP do blueprint.
- [x] Progresso só no Gist do usuário; o token só no aparelho.
- [x] Ajustes tem "Apagar dados deste aparelho" e explica como apagar o Gist.

**Repositório**
- [x] Nada de `referencias/` nem mídia versionado; a guarda bloqueia no CI (testado com .mp3 na F0).
- [x] Decisões registradas (ADR-1..13 sem mudança de arquitetura; desvios listados acima).

**SEO**
- [x] `noindex`, `<title>` e manifest.

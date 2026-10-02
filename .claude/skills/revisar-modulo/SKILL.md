---
name: revisar-modulo
description: Checklist de conteúdo de um módulo (textos curtos, dados do motor, cifra brasileira, conteúdo novo em C, checkpoint). Só sob comando (/revisar-modulo tetrades).
disable-model-invocation: true
---
Argumento: id do módulo (tetrades | campo-maior | arpejos).

Confira em src/conteudo/modulos/<id>.ts:
- [ ] cada tela de conceito tem ≤ 2 frases;
- [ ] nenhum dado musical escrito à mão (notas, casas, cordas): tudo vem de src/teoria;
- [ ] cifras geradas por teoria/cifra.ts (C7M, Dm7, G7, Bm7(b5), B°);
- [ ] conteúdo novo estreia em C;
- [ ] checkpoint definido (modelos + minimoLimpos) conforme BLUEPRINT §3;
- [ ] nada copiado de referencias/.

Depois, chame o subagente revisor-teoria sobre o módulo. Devolva o checklist com ✅/❌ e a resposta do revisor.

---
name: novo-exercicio
description: Cria um ModeloExercicio + gerador + teste no padrão do projeto e registra no módulo. Só sob comando (/novo-exercicio).
disable-model-invocation: true
---
Argumentos: módulo e descrição do exercício.

1. Escolha um dos 5 formatos (BLUEPRINT §4.4). Nunca crie formato novo: use parâmetros.
2. Crie/estenda o gerador em src/exercicios/ (puro, sem React/Tone/window) e um teste ao lado.
3. Todo dado musical vem de src/teoria. Nenhuma casa/corda escrita à mão.
4. Registre o ModeloExercicio no módulo em src/conteudo/modulos/.
5. Conteúdo novo estreia em C.
6. Confira que o exercício cabe numa tela sem rolagem (instrução de 1 linha + braço + barra + avaliação).
7. Rode a skill qa.

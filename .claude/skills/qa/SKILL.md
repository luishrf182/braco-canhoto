---
name: qa
description: Roda npm run qa (guarda, lint, tipos, testes, build), resume falhas por categoria e sugere a correção mínima. Use automaticamente antes de todo commit e ao fechar uma fase.
---
1. Rode `npm run qa`.
2. Se passar, responda "QA verde" com o tamanho gzip do JS inicial.
3. Se falhar, agrupe as falhas por categoria (guarda, lint, prettier, tipos, testes, build), mostre arquivo:linha e a correção mínima para cada uma. Corrija e rode de novo até ficar verde.

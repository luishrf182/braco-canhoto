---
name: deploy
description: Confere qa, faz push na main, acompanha o GitHub Actions e devolve a URL publicada. Só sob comando (/deploy).
disable-model-invocation: true
---
1. Rode a skill qa. Se vermelho, pare.
2. `git push origin main`.
3. `gh run list --limit 1` para pegar o id; `gh run watch <id> --exit-status`.
4. Se falhar, `gh run view <id> --log-failed`, corrija e volte ao passo 1.
5. Confira que https://luishrf182.github.io/braco-canhoto/ responde 200 e devolva a URL.

O `gh` pode estar em "C:\Program Files\GitHub CLI\gh.exe" fora do PATH.

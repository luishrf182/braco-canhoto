// PostToolUse (Edit|Write): formata com Prettier e roda os testes relacionados
// quando o arquivo é de teoria, agenda ou progresso.
import { spawnSync } from 'node:child_process';
import { caminhoRelativo, lerEntrada } from './ler-entrada.mjs';

const entrada = await lerEntrada();
const arq = caminhoRelativo(entrada?.tool_input?.file_path);
if (!arq) process.exit(0);

if (/\.(ts|tsx|css)$/.test(arq)) {
  spawnSync('npx', ['prettier', '--write', arq], { stdio: 'ignore', shell: true });
}

if (/^src\/(teoria|agenda|progresso|exercicios)\/.*\.ts$/.test(arq)) {
  const r = spawnSync('npx', ['vitest', 'related', arq, '--run'], {
    encoding: 'utf8',
    shell: true,
  });
  if (r.status !== 0) {
    process.stderr.write(
      `Testes relacionados a ${arq} falharam:\n${(r.stdout ?? '').slice(-3000)}`,
    );
    process.exit(2);
  }
}

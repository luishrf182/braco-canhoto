// PreToolUse (Edit|Write): referencias/ é só leitura.
import { caminhoRelativo, lerEntrada } from './ler-entrada.mjs';

const entrada = await lerEntrada();
const arq = caminhoRelativo(entrada?.tool_input?.file_path);
if (/^referencias\//i.test(arq)) {
  process.stderr.write('referencias/ é somente leitura (material de terceiros).');
  process.exit(2);
}

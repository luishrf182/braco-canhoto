// PreToolUse (Bash): bloqueia `git commit` com mídia, referencias/ ou tokens no stage.
import { execSync } from 'node:child_process';
import { lerEntrada } from './ler-entrada.mjs';

const entrada = await lerEntrada();
const comando = entrada?.tool_input?.command ?? '';
if (!/\bgit\b[^|;&]*\bcommit\b/.test(comando)) process.exit(0);

const problemas = [];
let staged = [];
try {
  staged = execSync('git diff --cached --name-only', { encoding: 'utf8' })
    .split('\n')
    .filter(Boolean);
} catch {
  process.exit(0);
}

for (const arq of staged) {
  if (arq.startsWith('referencias/'))
    problemas.push(`${arq}: referencias/ não pode ser versionada`);
  if (/\.(pdf|mp3|wav|zip)$/i.test(arq)) problemas.push(`${arq}: tipo de arquivo proibido`);
}

try {
  const diff = execSync('git diff --cached -U0', { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (/^\+.*(ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|gho_[A-Za-z0-9]{20,})/m.test(diff)) {
    problemas.push('o stage contém algo com cara de token do GitHub');
  }
} catch {
  // ignora
}

if (problemas.length) {
  process.stderr.write(
    'Commit bloqueado pela guarda:\n' + problemas.map((p) => ' - ' + p).join('\n'),
  );
  process.exit(2);
}

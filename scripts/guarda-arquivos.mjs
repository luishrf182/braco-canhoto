// Guarda de arquivos proibidos (repositório público). Roda no CI e no `npm run qa`.
// Falha se algum arquivo versionado (ou adicionado) for mídia/PDF/ZIP, vier de referencias/,
// ou contiver algo com cara de token do GitHub.
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const EXTENSOES = /\.(pdf|mp3|wav|zip|flac|ogg|m4a|aac|rar|7z)$/i;
const TOKEN = /\b(ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|gho_[A-Za-z0-9]{20,})/;

const arquivos = execSync('git ls-files --cached --others --exclude-standard', { encoding: 'utf8' })
  .split('\n')
  .map((s) => s.trim())
  .filter(Boolean);

const problemas = [];
for (const arq of arquivos) {
  if (arq.startsWith('referencias/'))
    problemas.push(`${arq}: pasta referencias/ não pode ser versionada`);
  if (EXTENSOES.test(arq)) problemas.push(`${arq}: tipo de arquivo proibido`);
  if (/\.(ts|tsx|js|mjs|json|md|html|css|yml|yaml|txt)$/i.test(arq)) {
    let texto;
    try {
      texto = readFileSync(arq, 'utf8');
    } catch {
      continue;
    }
    if (TOKEN.test(texto)) problemas.push(`${arq}: parece conter um token do GitHub`);
  }
}

if (problemas.length) {
  console.error('Guarda de arquivos: BLOQUEADO');
  for (const p of problemas) console.error(' - ' + p);
  process.exit(1);
}
console.log(`Guarda de arquivos: ok (${arquivos.length} arquivos)`);

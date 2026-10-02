// Confere contraste (WCAG) dos tokens de cor nos dois temas. Uso: node scripts/contraste.mjs
import { readFileSync } from 'node:fs';

const css = readFileSync('src/estilo/tokens.css', 'utf8');
function tokens(bloco) {
  const t = {};
  for (const [, k, v] of bloco.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})/g)) t[k] = v;
  return t;
}
const claro = tokens(css.split('[data-theme')[0]);
const escuro = { ...claro, ...tokens(css.split("[data-theme='dark']")[1]) };

const lum = (hex) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const l = c.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2];
};
const razao = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

// [frente, fundo, mínimo, descrição]
const PARES = [
  ['text', 'bg', 4.5, 'texto'],
  ['text', 'surface', 4.5, 'texto em cartão'],
  ['muted', 'bg', 4.5, 'texto secundário'],
  ['muted', 'surface', 4.5, 'texto secundário em cartão'],
  ['accent-text', 'bg', 4.5, 'texto de destaque'],
  ['on-accent', 'accent', 4.5, 'botão primário'],
  ['ok', 'bg', 4.5, 'Limpo'],
  ['err', 'bg', 4.5, 'Travou'],
  ['warn', 'bg', 4.5, 'aviso'],
  ['nut', 'bg', 3, 'pestana'],
  ['string', 'bg', 3, 'cordas'],
];
const MARCADORES = ['role-root', 'role-3', 'role-5', 'role-7', 'role-ext'];

let falhas = 0;
for (const [nome, t] of [
  ['claro', claro],
  ['escuro', escuro],
]) {
  console.log(`— tema ${nome}`);
  for (const [f, b, min, d] of PARES) {
    const r = razao(t[f], t[b]);
    const ok = r >= min;
    if (!ok) falhas++;
    console.log(`${ok ? '✅' : '❌'} ${d.padEnd(28)} ${r.toFixed(2)} (mín. ${min})`);
  }
  for (const m of MARCADORES) {
    // No tema claro o marcador tem contorno escuro (#1C1C1E): vale o maior dos dois contrastes.
    const r = Math.max(razao(t[m], t.bg), nome === 'claro' ? razao('#1c1c1e', t.bg) : 0);
    const ok = r >= 3;
    if (!ok) falhas++;
    console.log(`${ok ? '✅' : '❌'} marcador ${m.padEnd(19)} ${r.toFixed(2)} (mín. 3)`);
  }
}
process.exit(falhas ? 1 : 0);

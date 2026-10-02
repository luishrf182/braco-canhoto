import { defineConfig, type Plugin } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { execSync } from 'node:child_process';

function versao(): string {
  const sha = process.env.GITHUB_SHA;
  if (sha) return sha.slice(0, 7);
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return 'local';
  }
}

// A CSP só entra no build: o servidor de desenvolvimento do Vite precisa de script inline.
// Exatamente a CSP do BLUEPRINT §7.6. Não altere sem pedir.
const CSP = "default-src 'self'; connect-src 'self' https://api.github.com; script-src 'self'";

function cspNoBuild(): Plugin {
  return {
    name: 'csp-no-build',
    apply: 'build',
    transformIndexHtml(html) {
      return html.replace(
        '<meta charset="UTF-8" />',
        `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />`,
      );
    },
  };
}

export default defineConfig({
  base: '/braco-canhoto/',
  plugins: [react(), cspNoBuild()],
  define: {
    __VERSAO__: JSON.stringify(versao()),
  },
  build: {
    target: 'es2022',
  },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});

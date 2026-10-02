/// <reference types="vite/client" />

declare const __VERSAO__: string;

declare module '*.module.css' {
  const classes: Record<string, string>;
  export default classes;
}

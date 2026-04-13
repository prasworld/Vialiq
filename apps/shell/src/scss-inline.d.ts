// Type declarations for Vite-style ?inline SCSS imports used by web-components
declare module '*.scss?inline' {
  const content: string;
  export default content;
}

export { };

declare global {
  interface Window {
    triggerExitTransition?: () => Promise<void>;
  }
}

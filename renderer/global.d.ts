export {};

declare global {
  interface Window {
    electron: {
      setClickThrough: (enabled: boolean) => void;
      getMousePos: () => Promise<{ x: number; y: number }>;
    };
  }
}
export interface CatState {
  id: string;
  x: number;
  y: number;
  anim: 'idle' | 'walk' | 'jump';
  message?: string;
}

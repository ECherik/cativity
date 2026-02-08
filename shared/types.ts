export interface Cat{
  id: string;
  x: number;
  y: number;
  anim: 'idle' | 'walk' | 'jump';
  message?: string;
}

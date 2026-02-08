export interface Cat {
  id: string;
  x: number;
  y: number;
  anim: "idle" | "walk" | "jump";
  message?: string;
  username: string;
  color: string;
}

export interface ChatMessagePayload {
  id: string;
  message: string;
}
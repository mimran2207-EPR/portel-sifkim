export interface Highlight { x: number; y: number; w: number; h: number } // percentages 0-100
export interface Step { id: string; title: string; script: string; highlight?: Highlight; tip?: string; warning?: string }
export interface Module { id: string; title: string; icon: string; steps: Step[] }

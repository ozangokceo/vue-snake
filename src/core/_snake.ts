export module Snake {
  export type SnakeElement = { x: number; y: number }
  
  export type Model = SnakeElement[]

  export type Collision = { didCollide: false } | { didCollide: true; event: string }

  export type Direction = Up | Down | Left | Right

  type Up = {
    x: 0
    y: -1
  }

  type Down = {
    x: 0
    y: 1
  }

  type Left = {
    x: -1
    y: 0
  }

  type Right = {
    x: 1
    y: 0
  }

  export type GameState = 'init' | 'playing' | 'paused' | 'stopped' | 'gameover'
}

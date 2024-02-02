export module Snake {
  type Collision = { didCollide: false } | { didCollide: true; event: string }

  type Direction = Up | Down | Left | Right

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

  // Snake implementation..
  type SnakeElement = { x: number; y: number }
  type Snake = SnakeElement[]

  type GameState = 'init' | 'playing' | 'paused' | 'stopped' | 'gameover'
}

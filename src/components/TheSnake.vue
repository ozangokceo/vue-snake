<template>
  <div style="display: flex; flex-direction: column; gap: 7px">
    <div style="display: flex; align-items: center; justify-content: space-between">
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; width: min-content">
        <div></div>
        <v-btn
          :disabled="Boolean(timerId)"
          style="width: 16px"
          color="primary"
          @click="advanceFrame('up')"
          >Up</v-btn
        >
        <div></div>
        <v-btn
          :disabled="Boolean(timerId)"
          style="width: 16px"
          color="primary"
          @click="advanceFrame('left')"
          >L</v-btn
        >
        <div></div>
        <v-btn
          :disabled="Boolean(timerId)"
          style="width: 16px"
          color="primary"
          @click="advanceFrame('right')"
          >R</v-btn
        >
        <div></div>
        <v-btn
          :disabled="Boolean(timerId)"
          style="width: 16px"
          color="primary"
          @click="advanceFrame('down')"
          >Dn</v-btn
        >
        <div></div>
      </div>

      <div style="display: flex; flex-direction: column">
        <div style="display: flex; align-items: center">
          <v-checkbox hide-details label="Show grid" v-model="showGrid"></v-checkbox>:
          {{ showGrid }}
        </div>
        <div style="display: flex; align-items: center">
          <v-checkbox hide-details label="Mark head" v-model="markHead"></v-checkbox>:
          {{ markHead }}
        </div>
      </div>
    </div>

    <div style="display: flex; gap: 7px">
      <v-btn v-if="!timerId" variant="outlined" color="primary" @click="startCanvas">Start</v-btn>
      <v-btn v-else color="warning" @click="stop">Stop</v-btn>
      <v-btn color="secondary" @click="reset()">Reset</v-btn>
      <v-select
        v-model="foodLogo"
        hide-details
        density="compact"
        style="width: 300px"
        :items="getIconItems"
      ></v-select>
    </div>

    <div class="container">
      <div class="scoreboard">
        <span style="font-weight: 500">Score:</span>&nbsp;{{ gameScore }}
      </div>
      <canvas></canvas>
      <div v-if="gameState === 'gameover'" class="message-backdrop">
        <div class="message-popup">Game over!!</div>
      </div>
    </div>
    <img v-show="false" id="vue-logo" src="@/assets/logo.svg" width="125" height="125" />
    <img v-show="false" id="apple-logo" src="@/assets/apple.png" width="125" height="125" />
    <img v-show="false" id="candle-logo" src="@/assets/candle.png" width="125" height="125" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'

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

// Constants..
const CANVAS_WIDTH = 700
const CANVAS_HEIGHT = 700

const ELEMENT_WIDTH = 15
const ELEMENT_HEIGHT = 15

const SNAKE_START = {
  x: 300,
  y: 300,
}

// Snake implementation..
type SnakeElement = { x: number; y: number }
type Snake = SnakeElement[]

// const snake = ref<Snake>([{ x: SNAKE_START.x, y: SNAKE_START.y }])
const snake = ref<Snake>(buildSnake())

type GameState = 'init' | 'playing' | 'paused' | 'stopped' | 'gameover'

// Reactives..
const x = ref<number>(SNAKE_START.x)
const y = ref<number>(SNAKE_START.y)

const foodX = ref<number>(0)
const foodY = ref<number>(0)

const direction = ref<Direction>({ x: -1, y: 0 })

const timerId = ref<number | null>(null)

const gameState = ref<GameState>('init')

const gameScore = ref<number>(0)

const showGrid = ref<boolean>(false)
const markHead = ref<boolean>(false)

const foodLogo = ref<string>('vue-logo')

// Canvas elements..
let canvas: HTMLCanvasElement | null
let ctx: CanvasRenderingContext2D | null

// Methods..
function init() {
  initCanvas()

  window.addEventListener('keydown', changeDirection)
}

function advanceFrame(direction: 'up' | 'down' | 'left' | 'right') {
  switch (direction) {
    case 'up':
      y.value -= ELEMENT_HEIGHT
      break
    case 'down':
      y.value += ELEMENT_HEIGHT
      break
    case 'left':
      x.value -= ELEMENT_WIDTH
      break
    case 'right':
      x.value += ELEMENT_WIDTH
      break
  }

  incrementSnake(x.value, y.value)
  drawCanvas(true)
}

function changeDirection(e: KeyboardEvent) {
  console.log(e.key)
  switch (e.key) {
    case 'ArrowDown':
      direction.value = { x: 0, y: 1 }
      break
    case 'ArrowUp':
      direction.value = { x: 0, y: -1 }
      break
    case 'ArrowLeft':
      direction.value = { x: -1, y: 0 }
      break
    case 'ArrowRight':
      direction.value = { x: 1, y: 0 }
      break
    default:
      break
  }
}

function renderFood() {
  let image: HTMLElement | null = document.getElementById('vue-logo')
  document.getElementById('vue-logo')

  switch (foodLogo.value) {
    case 'vue':
      image = document.getElementById('vue-logo')
      break
    case 'apple':
      image = document.getElementById('apple-logo')
      break
    case 'candle':
      image = document.getElementById('candle-logo')
      break

    default:
      break
  }

  const BUFFER = 3

  if (ctx)
    ctx.drawImage(
      image as CanvasImageSource,
      foodX.value,
      foodY.value,
      ELEMENT_WIDTH + BUFFER,
      ELEMENT_HEIGHT + BUFFER,
    )
}

function buildSnake() {
  const snake: Snake = []
  const initialLength = 10

  for (let i = 0; i < initialLength; i++) {
    snake.push({
      x: SNAKE_START.x + ELEMENT_WIDTH * i,
      y: SNAKE_START.y,
    })
  }
  return snake
}

function checkFood() {
  if (x.value === foodX.value && y.value === foodY.value) return true
}

function updateFood() {
  const coordinateX = Math.floor(Math.random() * CANVAS_WIDTH)
  const coordinateY = Math.floor(Math.random() * CANVAS_HEIGHT)

  foodX.value = Math.floor(coordinateX / ELEMENT_WIDTH) * ELEMENT_WIDTH
  foodY.value = Math.floor(coordinateY / ELEMENT_HEIGHT) * ELEMENT_HEIGHT
}

function incrementSnake(x: number, y: number) {
  snake.value.push({ x, y })
}

function updateSnake(x: number, y: number) {
  snake.value.push({ x, y })
  snake.value.shift()
}

function checkCollision(): boolean {
  let collision: boolean = false

  if (x.value + ELEMENT_WIDTH >= CANVAS_WIDTH || x.value < 0) return true
  if (y.value + ELEMENT_HEIGHT >= CANVAS_HEIGHT || y.value < 0) return true

  for (const snakeElement of snake.value) {
    if (x.value === snakeElement.x && y.value === snakeElement.y) collision = false

    const xDiff = Math.abs(x.value - snakeElement.x)
    const yDiff = Math.abs(y.value - snakeElement.y)

    // console.log(xDiff, yDiff)

    const didCollide = xDiff === 0 && yDiff === 0

    collision = didCollide
  }

  if (collision) console.warn('Collision!!')
  return false
}

function initCanvas() {
  canvas = document.querySelector('canvas')

  if (!canvas) return
  ctx = canvas.getContext('2d')

  canvas.width = CANVAS_WIDTH
  canvas.height = CANVAS_HEIGHT

  updateFood()
}

function resetCanvas() {
  if (!ctx) return

  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
}

function reset() {
  stop()

  window.removeEventListener('keypress', changeDirection)

  timerId.value = null

  gameState.value = 'init'

  x.value = SNAKE_START.x
  y.value = SNAKE_START.y

  resetCanvas()

  snake.value = buildSnake()
}

function drawCanvas(frame?: boolean) {
  if (!canvas || !ctx) return
  // console.log('Draw call..')

  resetCanvas()

  if (checkCollision()) {
    // reset()
    gameState.value = 'gameover'
  }

  if (checkFood()) {
    updateFood()
    incrementSnake(x.value, y.value)
    gameScore.value++
  }
  renderFood()

  updateSnake(x.value, y.value)

  ctx.fillStyle = 'white'

  snake.value.forEach((snakeElement) => {
    if (markHead.value && x.value === snakeElement.x && y.value === snakeElement.y) {
      ctx!.fillStyle = 'green'
    }

    if (ctx) ctx.fillRect(snakeElement.x, snakeElement.y, ELEMENT_WIDTH, ELEMENT_HEIGHT)
  })

  if (frame) return

  x.value += direction.value.x * ELEMENT_WIDTH
  y.value += direction.value.y * ELEMENT_HEIGHT
}

function startCanvas() {
  timerId.value = setInterval(drawCanvas, 200)
}

function stop() {
  if (timerId.value) clearInterval(timerId.value)
  timerId.value = null
}

// Computed
const getIconItems = computed<any>(() => {
  return [
    { title: 'Vue', value: 'vue' },
    { title: 'Apple', value: 'apple' },
    { title: 'Candle', value: 'candle' },
  ]
})

onMounted(() => {
  init()
})
</script>

<style scoped>
.red {
  background-color: red;
}
.container {
  position: relative;
  border: 1px solid var(--color-border);
  background: var(--color-background);
  overflow: hidden;
  border-radius: 8px;
  margin-top: 5px;
  padding: 5px;
}

.scoreboard {
  position: absolute;
  top: 5px;
  left: 10px;
  font-size: 18px;
}

canvas {
  border-radius: 8px;
}

.debug-container {
  display: flex;
}

.message-popup {
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  background-color: black;
  color: white;

  font-size: 18px;
  font-weight: 600;
  position: absolute;
  left: calc(50% - 150px);
  top: calc(50% - 75px);

  width: 300px;
  height: 150px;
}

.message-backdrop {
  background-color: #00000022;
  z-index: 10;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}
</style>

<template>
  <div style="display: flex; flex-direction: column; gap: 7px">
    <div class="control-board">
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
        <v-tooltip text="Toggles the grid on canvas" location="bottom">
          <template v-slot:activator="{ props: _props }">
            <v-checkbox
              density="compact"
              v-model="showGrid"
              v-bind="_props"
              hide-details
              label="Show grid"
            ></v-checkbox>
          </template>
        </v-tooltip>

        <v-tooltip
          text="Paints the snake head to a different color"
          location="bottom"
        >
          <template v-slot:activator="{ props: _props }">
            <v-checkbox
              density="compact"
              v-model="markHead"
              v-bind="_props"
              hide-details
              label="Mark head"
            ></v-checkbox>
          </template>
        </v-tooltip>

        <v-tooltip
          text="Toggles coordinate guidelines for snake head and displays realtime coordinates"
          location="bottom"
        >
          <template v-slot:activator="{ props: _props }">
            <v-checkbox
              density="compact"
              v-bind="_props"
              hide-details
              label="Head axis"
              v-model="showSnakeHeadAxis"
            ></v-checkbox>
          </template>
        </v-tooltip>
      </div>
    </div>

    <div style="display: flex; gap: 7px">
      <v-btn v-if="isGameStopped" variant="outlined" color="primary" @click="start()">Start</v-btn>
      <v-btn v-else color="warning" @click="stop()">Stop</v-btn>
      <v-btn color="secondary" @click="reset()" :disabled="!isGameStopped">Reset</v-btn>
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
      <div v-if="showSnakeHeadAxis" class="coordinates">
        <span>xCoord:</span>&nbsp;{{ x }} - <span>yCoord:</span>&nbsp;{{ y }}
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
import { watch } from 'vue';
import { onMounted, ref, computed } from 'vue';
// import type { Snake } from '../core'

type Direction = Up | Down | Left | Right;

type Up = {
  x: 0;
  y: -1;
};

type Down = {
  x: 0;
  y: 1;
};

type Left = {
  x: -1;
  y: 0;
};

type Right = {
  x: 1;
  y: 0;
};

// Constants..
const CANVAS_WIDTH = 720;
const CANVAS_HEIGHT = 720;

const ELEMENT_WIDTH = 15;
const ELEMENT_HEIGHT = 15;

const SNAKE_START = {
  x: 300,
  y: 300,
};

let time: number = 0;

// Snake implementation..
type SnakeElement = { x: number; y: number };
type Snake = SnakeElement[];

// const snake = ref<Snake>([{ x: SNAKE_START.x, y: SNAKE_START.y }])
const snake = ref<Snake>(buildSnake());

type GameState = 'play' | 'stop' | 'gameover';

// Reactives..
const x = ref<number>(SNAKE_START.x);
const y = ref<number>(SNAKE_START.y);

const foodX = ref<number>(0);
const foodY = ref<number>(0);

const direction = ref<Direction>({ x: -1, y: 0 });

const timerId = ref<number | null>(null);

const gameState = ref<GameState>('stop');

const gameScore = ref<number>(0);

const showGrid = ref<boolean>(false);
const showSnakeHeadAxis = ref<boolean>(false);
const markHead = ref<boolean>(false);

const foodLogo = ref<string>('vue-logo');

const snakeColor = ref<string>('white');

// Canvas elements..
let canvas: HTMLCanvasElement | null;
let context: CanvasRenderingContext2D | null;

// Methods..
function init() {
  initCanvas();

  window.addEventListener('keydown', changeDirection);
}

function advanceFrame(advanceDirection: 'up' | 'down' | 'left' | 'right') {
  switch (advanceDirection) {
    case 'up':
      direction.value = { x: 0, y: -1 };
      break;
    case 'down':
      direction.value = { x: 0, y: 1 };
      break;
    case 'left':
      direction.value = { x: -1, y: 0 };
      break;
    case 'right':
      direction.value = { x: 1, y: 0 };
      break;
  }

  updateSnake(x.value, y.value);
  drawCanvas(0);
}

function changeDirection(e: KeyboardEvent) {
  console.log(e.key);
  switch (e.key) {
    case 'ArrowUp':
      if (direction.value.y === 1) break;
      direction.value = { x: 0, y: -1 };
      break;
    case 'ArrowDown':
      if (direction.value.y === -1) break;
      direction.value = { x: 0, y: 1 };
      break;
    case 'ArrowLeft':
      if (direction.value.x === 1) break;
      direction.value = { x: -1, y: 0 };
      break;
    case 'ArrowRight':
      if (direction.value.x === -1) break;
      direction.value = { x: 1, y: 0 };
      break;
    default:
      break;
  }
}

function renderFood() {
  let image: HTMLElement | null = document.getElementById('vue-logo');
  document.getElementById('vue-logo');

  switch (foodLogo.value) {
    case 'vue':
      image = document.getElementById('vue-logo');
      break;
    case 'apple':
      image = document.getElementById('apple-logo');
      break;
    case 'candle':
      image = document.getElementById('candle-logo');
      break;

    default:
      break;
  }

  const BUFFER = 3;

  if (context)
    context.drawImage(
      image as CanvasImageSource,
      foodX.value,
      foodY.value,
      ELEMENT_WIDTH + BUFFER,
      ELEMENT_HEIGHT + BUFFER,
    );
}

function buildSnake() {
  const snake: Snake = [];
  const initialLength = 12;

  for (let i = initialLength; i > 0; i--) {
    snake.push({
      x: SNAKE_START.x + ELEMENT_WIDTH * i,
      y: SNAKE_START.y,
    });
  }
  return snake;
}

function checkFood() {
  if (x.value === foodX.value && y.value === foodY.value) return true;
}

function updateFood() {
  const { x: newX, y: newY } = getFoodCoordinates();

  const isOnSnake = snake.value.some((snakeElement) => {
    return snakeElement.x === newX && snakeElement.y === newY;
  });

  if (isOnSnake) updateFood();

  foodX.value = newX;
  foodY.value = newY;
}

function getFoodCoordinates(): { x: number; y: number } {
  const coordinateX = Math.floor(Math.random() * CANVAS_WIDTH * 0.9);
  const coordinateY = Math.floor(Math.random() * CANVAS_HEIGHT * 0.9);

  const x = Math.floor(coordinateX / ELEMENT_WIDTH) * ELEMENT_WIDTH;
  const y = Math.floor(coordinateY / ELEMENT_HEIGHT) * ELEMENT_HEIGHT;

  return { x, y };
}

function incrementSnake(x: number, y: number) {
  snake.value.push({ x, y });
}

function updateSnake(x: number, y: number) {
  snake.value.push({ x, y });
  snake.value.shift();
}

function checkCollision(): boolean {
  let collision: boolean = false;

  if (x.value + ELEMENT_WIDTH >= CANVAS_WIDTH || x.value < 0) return true;
  if (y.value + ELEMENT_HEIGHT >= CANVAS_HEIGHT || y.value < 0) return true;

  for (const snakeElement of snake.value) {
    if (x.value === snakeElement.x && y.value === snakeElement.y) collision = false;

    const xDiff = Math.abs(x.value - snakeElement.x);
    const yDiff = Math.abs(y.value - snakeElement.y);

    // console.log(xDiff, yDiff)

    const didCollide = xDiff === 0 && yDiff === 0;

    collision = didCollide;
  }

  if (collision) console.warn('Collision!!');
  return false;
}

function initCanvas() {
  canvas = document.querySelector('canvas');

  if (!canvas) return;
  context = canvas.getContext('2d');

  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  updateFood();
  drawCanvas(0);
}

function resetCanvas() {
  if (!context) return;

  context.fillStyle = 'black';
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function reset() {
  stop();

  window.removeEventListener('keypress', changeDirection);

  updateFood();

  timerId.value = null;

  gameState.value = 'stop';

  x.value = SNAKE_START.x;
  y.value = SNAKE_START.y;

  resetCanvas();
  drawCanvas(0);

  snake.value = buildSnake();
}

function drawCanvas(timestamp: number, frame?: boolean) {
  if (!canvas || !context) return;

  resetCanvas();

  if (checkCollision()) {
    reset();
    gameState.value = 'gameover';
  }

  if (checkFood()) {
    updateFood();
    incrementSnake(x.value, y.value);
    gameScore.value++;
  }
  renderFood();

  updateSnake(x.value, y.value);

  setFillContext(context, snakeColor.value);

  snake.value.forEach((snakeElement) => {
    if (context && markHead.value && x.value === snakeElement.x && y.value === snakeElement.y) {
      setFillContext(context, 'green');
    }

    if (context) context.fillRect(snakeElement.x, snakeElement.y, ELEMENT_WIDTH, ELEMENT_HEIGHT);
  });

  // if (frame) return;

  x.value += direction.value.x * ELEMENT_WIDTH;
  y.value += direction.value.y * ELEMENT_HEIGHT;

  if (showGrid.value) paintGrid();
  if (showSnakeHeadAxis.value) paintHeadAxis();

  // const timeDiff = timestamp - time
  // time = timestamp;

  // console.log("Time diff: ", timeDiff)

  // if (timeDiff > 5 && gameState.value === 'play') requestAnimationFrame(drawCanvas);
}

function paintGrid() {
  if (!context) return;
  setFillContext(context, 'gray');

  for (let i = 0; i < CANVAS_WIDTH; i++) {
    for (let j = 0; j < CANVAS_HEIGHT; j++) {
      if (i % ELEMENT_WIDTH === 0 || i === CANVAS_WIDTH - 1) context.fillRect(i, j, 1, 1);
      if (j % ELEMENT_WIDTH === 0 || j === CANVAS_HEIGHT - 1) context.fillRect(i, j, 1, 1);
    }
  }
}

function paintHeadAxis() {
  if (!context) return;
  setFillContext(context, 'green');

  for (let i = 0; i < CANVAS_WIDTH; i++) {
    for (let j = 0; j < CANVAS_HEIGHT; j++) {
      if (i === x.value || j === y.value) context.fillRect(i, j, 1, 1);
    }
  }
}

function setFillContext(context: CanvasRenderingContext2D, param: string) {
  context.fillStyle = param;
}

function start() {
  gameState.value = 'play';
  timerId.value = setInterval(drawCanvas, 50);
  // requestAnimationFrame(drawCanvas);
}

function stop() {
  if (timerId.value) clearInterval(timerId.value);
  gameState.value = 'stop';
  timerId.value = null;
}

// Computed
const getIconItems = computed<any>(() => {
  return [
    { title: 'Vue', value: 'vue' },
    { title: 'Apple', value: 'apple' },
    { title: 'Candle', value: 'candle' },
  ];
});

const isGameStopped = computed<boolean>(() => {
  return gameState.value === 'stop' || gameState.value === 'gameover';
});

onMounted(() => {
  init();
});

watch(showGrid, () => drawCanvas(0));
watch(showSnakeHeadAxis, () => drawCanvas(0));
watch(markHead, () => drawCanvas(0));
</script>

<style scoped>
.control-board {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 7px;
}
.container {
  position: relative;
  border: 1px solid var(--color-border);
  background: black;
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
  color: white;
}

.coordinates {
  position: absolute;
  top: 5px;
  right: 10px;
  font-size: 18px;
  color: green;
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

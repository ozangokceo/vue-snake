<template>
  <div v-for="(value, key, index) in props.stats" :key="index"> {{ key }} {{ value }}</div>
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

type SnakeElement = { x: number; y: number }
type Snake = SnakeElement[]

type Stats =
  | {
      x: number
      y: number
      foodX: number
      foodY: number
      direction: Direction
      snake: SnakeElement[]
    }
  | undefined

type Props = {
  stats?: Stats
}

const props = defineProps<Props>()

function bStats(): Stats {
  return {
    x: 0,
    y: 0,
    foodX: 0,
    foodY: 0,
    direction: { x: 1, y: 0 },
    snake: [],
  }
}
</script>

<style scoped></style>

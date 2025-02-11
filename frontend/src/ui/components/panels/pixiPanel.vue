<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Application, Graphics } from 'pixi.js';

/** キャンバスを挿入するためのコンテナ */
const canvas = ref<HTMLDivElement>();
const app = new Application();

const addStars = () => {
  const starCount: number = 20;
  const graphics = new Graphics();

  for (let index = 0; index < starCount; index++) {
    const x = (index * 0.78695 * app.screen.width) % app.screen.width;
    const y = (index * 0.9382 * app.screen.height) % app.screen.height;
    const radius = 2 + Math.random() * 3;
    const rotation = Math.random() * Math.PI * 2;
    graphics.star(x, y, 5, radius, 0, rotation).fill({ color: 0xffdf00, alpha: radius / 5 });
  }
  app.stage.addChild(graphics);
};

onMounted(async () => {
  if (canvas.value == undefined) return;
  await app.init({ background: '#021f4b', resizeTo: canvas.value });
  canvas.value.appendChild(app.canvas);
  addStars();
});
</script>
<template>
  <div ref="canvas" class="canvas-display" />
</template>
<style lang="scss" scoped>
.canvas-display {
  min-width: 100%;
  min-height: 100%;
}
</style>

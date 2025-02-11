<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import Plotly from 'plotly.js-dist-min';
import { onlyTitleLayout } from 'presenters';

interface Props {
  data?: Plotly.Data[];
  layout?: Partial<Plotly.Layout>;
}
const props = defineProps<Props>();

/** PlotlyのCanvasを挿入するHTMLElement */
const canvas = ref<Plotly.PlotlyHTMLElement>();

watch(
  () => props.data,
  () => updatePlot()
);
watch(
  () => props.layout,
  () => updatePlot()
);

/** PlotlyのCanvasを更新する */
const updatePlot = async () => {
  if (canvas.value == undefined) return;
  if (props.data == undefined || props.layout == undefined) return;
  const layout = props.data.length === 0 ? onlyTitleLayout(props.layout) : props.layout;
  await Plotly.react(canvas.value, props.data, layout, { displayModeBar: false });
};
onMounted(async () => await updatePlot());
</script>
<template>
  <div ref="canvas" class="plotly-canvas" />
</template>
<style scoped lang="scss">
.plotly-canvas {
  overflow: hidden;
}
</style>

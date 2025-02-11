<script setup lang="ts">
import Plotly from 'plotly.js-dist-min';
import PlotlyBase from 'ui/components/PlotlyBase.vue';

const trace1: Partial<Plotly.PlotData> = {
  type: 'bar',
  x: ['Feature A', 'Feature B', 'Feature C', 'Feature D', 'Feature E'],
  y: [20, 14, 23, 25, 22],
  marker: {
    color: [
      'rgba(204,204,204,1)',
      'rgba(222,45,38,0.8)',
      'rgba(204,204,204,1)',
      'rgba(204,204,204,1)',
      'rgba(204,204,204,1)',
    ],
  },
};

const data = [trace1];

const layout: Partial<Plotly.Layout> = {
  title: {
    text: 'Least Used Feature',
  },
};
</script>
<template>
  <plotly-base :data="data" :layout="layout" />
</template>

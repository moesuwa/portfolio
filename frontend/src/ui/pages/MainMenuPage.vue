<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ResolvedLayoutConfig } from 'golden-layout';
import { ElementConfig, ElementItem, createElementConfig, useGoldenLayout, PersistLayoutOptions } from 'presenters';
import PlotlyPanel from 'ui/components/panels/PlotlyPanel.vue';
import GoldenLayout from 'ui/layouts/GoldenLayout.vue';

const save = (config: ResolvedLayoutConfig): void => localStorage.set('goldenLayout', JSON.stringify(config));
const load = (): ResolvedLayoutConfig | undefined => {
  const json = localStorage.getItem('goldenLayout');
  return json != undefined ? JSON.parse(json) : undefined;
};
const persist: PersistLayoutOptions = {
  patch: save,
  load,
};
//#region ゴールデンレイアウトの設定
const layout = ref();
const configList = ref<ElementConfig[]>([]);
const elementItemList = ref<ElementItem[]>([]);

const addConfig = (componentType: { type: string; name: string }) =>
  configList.value.push(createElementConfig(componentType.type, componentType.name));
const removeConfig = (refId: string) => {
  const index = configList.value.findIndex((config) => config.refId === refId);
  configList.value.splice(index, 1);
};
const { loadLayout } = useGoldenLayout(layout, elementItemList, removeConfig, persist);
onMounted(() => {
  const loadedConfigList = loadLayout();
  if (loadedConfigList == undefined) {
    addConfig({ type: 'abc', name: 'abc' });
    addConfig({ type: 'def', name: 'def' });
    addConfig({ type: 'ghi', name: 'ghi' });
    addConfig({ type: 'jkl', name: 'jkl' });
    return;
  }
  configList.value = loadedConfigList;
});
</script>

<template>
  <golden-layout
    v-model:layout="layout"
    v-model:element-item-list="elementItemList"
    style="width: 100vw; height: 100vh"
    :config-list="configList"
  >
    <template #abc>
      <plotly-panel />
    </template>
    <template #def>
      <div style="background: yellow" />
    </template>
    <template #ghi>
      <div style="background: green" />
    </template>
    <template #jkl>
      <div style="background: pink" />
    </template>
    <template #empty>
      <div style="background: blue" />
    </template>
  </golden-layout>
</template>

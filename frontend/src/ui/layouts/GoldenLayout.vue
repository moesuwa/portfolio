<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { ElementConfig, ElementItem } from 'presenters';
import { mapFilter } from 'presenters/utils';
/** ゴールデンレイアウトのレイアウトを表示するコンポーネント */
interface Props {
  /** elementを生成するための情報 */
  configList: ElementConfig[];
  /** レイアウトを表示する領域。このコンポーネント内で生成される。 */
  layout: HTMLElement | undefined;
  /** ゴールデンレイアウト上に配置されるHTML要素。このコンポーネント内で生成される。 */
  elementItemList: ElementItem[];
  /** 背景を透過するかどうか */
  transparent?: boolean;
}
interface Emits {
  /** レイアウトを表示する領域生成イベント */
  (e: 'update:layout', value: HTMLElement | undefined): void;
  /** レイアウト上のHTML要素更新イベント */
  (e: 'update:elementItemList', value: ElementItem[]): void;
}
const props = defineProps<Props>();
const emits = defineEmits<Emits>();
const field = ref<HTMLElement>();
const elementRefList = ref<HTMLElement[]>([]);

/** レイアウトを表示する領域を生成してイベントを発生させる。 */
watch(
  () => field.value,
  () => emits('update:layout', field.value)
);
/** 親コンポーネントから要求された情報からHTML要素を生成して更新イベントを発生させる。 */
watch(
  () => props.configList,
  async () => {
    await nextTick(); // configListの変更に伴ってv-forによるDOMの再生成を待つ
    // data-referenceに設定したrefIdの一致するHTML要素を取得する
    const newElementItemList = mapFilter(elementRefList.value, (element) => {
      const config = props.configList.find((config) => config.refId === element.dataset.reference);
      if (!config) return;
      return { element, ...config };
    });
    emits('update:elementItemList', newElementItemList);
  },
  { deep: true }
);
/** レイアウト上の要素が空かどうか。 */
const isEmpty = computed(() => props.elementItemList.length === 0);
</script>
<template>
  <div class="relative-position full-size">
    <!-- GoldenLayoutを配置する領域 -->
    <div ref="field" class="absolute-full" />
    <!-- レイアウト上に表示するコンポーネントが存在しないときに表示するコンポーネント -->
    <div v-if="isEmpty" class="absolute-full">
      <slot name="empty" />
    </div>
    <!-- レイアウト上に格納するコンポーネントをv-forで動的に生成する -->
    <!-- data-referenceにrefIdを保持させて、同じrefIdのconfigとの紐づけを行う -->
    <div
      v-for="config in configList"
      :key="config.refId"
      ref="elementRefList"
      class="absolute overflow-hidden"
      :data-reference="config.refId"
    >
      <slot :name="config.type" :ref-id="config.refId" />
    </div>
  </div>
</template>
<style src="golden-layout/dist/css/goldenlayout-base.css"></style>
<style src="golden-layout/dist/css/themes/goldenlayout-light-theme.css"></style>

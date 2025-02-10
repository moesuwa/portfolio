import { Ref, onMounted, onUnmounted, ref, watch } from 'vue';
import {
  VirtualLayout,
  ComponentContainer,
  LayoutConfig,
  ResolvedComponentItemConfig,
  ItemConfig,
  ComponentItemConfig,
  LogicalZIndex,
  JsonValue,
  Side,
  ResolvedLayoutConfig,
} from 'golden-layout';
import { nanoid } from 'nanoid';
import { mapFilter } from 'presenters/utils';
import { ResizeWatcher } from 'presenters';

/** elementを生成するための情報。 */
export interface ElementConfig {
  /** 一意になる識別ID */
  refId: string;
  /** 生成するelementの種類 */
  type: string;
  /** タイトルバーに表示する文字列 */
  title?: string;
  /** 生成するelementに渡すprops */
  props?: object | null;
}

/** elementを生成するための情報と生成されたelement。 */
export interface ElementItem extends ElementConfig {
  element: HTMLElement;
}

/** ゴールデンレイアウトにするコンポーザブルの動作オプション */
interface UseGoldenLayoutOptions {
  /** ヘッダーを表示するかどうか */
  showHeader?: boolean;
}

/** レイアウトの状態を保存/読み込みするための関数 */
export interface PersistLayoutOptions {
  patch: (config: ResolvedLayoutConfig) => void;
  load: () => ResolvedLayoutConfig | undefined;
}

/**
 * ゴールデンレイアウトにするコンポーザブル
 * @param root ゴールデンレイアウトにするエレメント
 * @param elements ゴールデンレイアウトで管理するコンポーネントに配置されるエレメントのリスト
 * @param onClosed コンポーネントが閉じられたときのコールバック
 * @param persist レイアウトの状態を保存/読み込みするための関数
 * @param showHeader ヘッダーを表示するかどうか
 */
export function useGoldenLayout(
  root: Ref<HTMLElement | undefined>,
  elements: Ref<ElementItem[]>,
  onClosed: (refId: string) => void,
  persist: PersistLayoutOptions,
  { showHeader = true }: UseGoldenLayoutOptions = {}
) {
  /** 仮想レイアウト */
  // 本来はref<VirtualLayout>を使いたいが、VirtualLayoutをリアクティブなオブジェクトにすると正しく動作しない問題がある。
  // https://github.com/golden-layout/golden-layout/issues/697
  let virtualLayout: VirtualLayout | undefined = undefined;
  const isInitialized = ref<boolean>(false);

  /** 表示しているコンポーネントのrefIdリスト */
  const refIdList: string[] = [];
  /** レイアウトを保存する */
  const saveLayout = () => {
    if (virtualLayout == undefined) return;
    const resolved = virtualLayout.saveLayout();
    persist.patch(resolved);
  };

  /** 読込みしたレイアウトの情報 */
  let loadedLayoutConfig: LayoutConfig | undefined;
  /** レイアウトを読み込んでelement生成に必要な情報を生成する */
  const loadLayout = (): ElementConfig[] | undefined => {
    const resolved = persist.load();
    if (resolved == undefined) return;
    const config = LayoutConfig.fromResolved(resolved);
    if (config.root == undefined) return;

    if (virtualLayout != undefined) virtualLayout.clear();
    // elementを先に生成してもらうため、ここではloadLayoutは呼び出さない。
    loadedLayoutConfig = config; // 次のwatchでloadLayoutを呼び出すために保持しておく
    return mapFilter(enumComponent(config.root), convertToElementConfig);
  };

  /** 読み込み済みのレイアウトを初期化する */
  const reset = () => {
    if (virtualLayout == undefined) return;
    virtualLayout.clear();
    loadedLayoutConfig = undefined;
  };

  /** LayoutConfigにDHS特有の設定を反映させる */
  const validateLayoutConfig = (config: LayoutConfig): LayoutConfig => {
    if (config.header == undefined) config.header = {};
    config.header.show = showHeader ? Side.top : false;
    config.header.maximise = false;
    config.header.popout = false;
    if (config.dimensions == undefined) config.dimensions = {};
    config.dimensions.borderWidth = showHeader ? 5 : 2;
    return config;
  };

  watch(
    () => elements.value,
    () => updateLayout()
  );
  watch(
    () => isInitialized.value,
    () => updateLayout()
  );

  /** 登録されたエレメントのリストをもとにGoldenLayoutにコンポーネントを反映させる */
  const updateLayout = () => {
    if (virtualLayout == undefined) return;
    // レイアウトの読込み時の最初の設定であればloadLayoutを呼び出す。
    if (loadedLayoutConfig != undefined) {
      if (!compareRefId(loadedLayoutConfig, elements.value)) return; // loadLayoutで復元する要素がelementsに入っているか確認。
      virtualLayout.loadLayout(validateLayoutConfig(loadedLayoutConfig));
      loadedLayoutConfig = undefined;
      return;
    }
    // 新たに追加されたコンポーネントは仮想レイアウトに追加する。
    const appended = elements.value.filter((element) => !refIdList.includes(element.refId));
    appended.forEach((element) => {
      virtualLayout?.addItem(convertToComponentItemConfig(element));
    });
  };
  /** ロードしたレイアウト情報に含まれる要素がelementsに含まれているか判定する */
  const compareRefId = (storedLayout: LayoutConfig, elements: ElementConfig[]) => {
    const configList = mapFilter(enumComponent(storedLayout.root), convertToElementConfig);
    return configList.every((config) => elements.some((element) => element.refId === config.refId));
  };

  /** elementを生成するための情報からGoldenLayoutのコンポーネント情報に変換する。 */
  const convertToComponentItemConfig = (element: ElementItem): ComponentItemConfig => {
    const config: ComponentItemConfig = {
      type: 'component',
      componentType: element.type,
      componentState: { refId: element.refId, props: element.props },
      title: element.title ?? '',
    };
    return config;
  };

  /** 保存されたGoldenLayoutのコンポーネント情報からelementを生成するための情報に変換する。 */
  const convertToElementConfig = (itemConfig: ComponentItemConfig): ElementConfig | undefined => {
    if (itemConfig.componentState == undefined || !JsonValue.isJson(itemConfig.componentState)) return;
    const config: ElementConfig = {
      refId: itemConfig.componentState.refId as string,
      type: itemConfig.componentType as string,
      props: itemConfig.componentState.props as object | null,
      title: itemConfig.title ?? '',
    };
    return config;
  };

  // #region GoldenLayoutのConfig関連メソッド // 別ファイルにしてもいいかもしれない
  /** Compositeパターンで構成されているcontentからComponentItemConfigを列挙する。 */
  const enumComponent = (item: ItemConfig | undefined): ComponentItemConfig[] => {
    if (item == undefined) return [];
    if (ItemConfig.isComponent(item)) return [item];
    if (item.content == undefined) return [];
    return item.content.flatMap((content) => enumComponent(content) ?? []);
  };

  /** JsonValueがstring型か判定する。 */
  const isString = (value: JsonValue): value is string => typeof value === 'string';

  /** ComponentStateから識別IDを取得する。 */
  const getRefId = (state: ResolvedComponentItemConfig['componentState']): string => {
    if (state != undefined) {
      const refId = JsonValue.isJson(state) ? state.refId : null;
      if (refId != undefined && isString(refId)) return refId;
    }
    throw new Error("bindComponentEventListener: component's ref id is required");
  };
  // #endregion

  // #region ルート要素のサイズ変更監視関連メソッド
  /** ルート要素のサイズ */
  let rootBoundingClientRect: DOMRect;
  /** サイズ変更を取得するためのResizeObserverオブジェクト。 */
  let resizeWatcher: ResizeWatcher | undefined;
  watch(
    () => root.value,
    () => {
      if (root.value == undefined) return;
      resizeWatcher = new ResizeWatcher(root.value, (element: Element) => {
        rootBoundingClientRect = element.getBoundingClientRect();
        virtualLayout?.setSize(rootBoundingClientRect.width, rootBoundingClientRect.height);
      });
      virtualLayout = new VirtualLayout(root.value, handleBindComponentEvent, handleUnbindComponentEvent);
      virtualLayout.beforeVirtualRectingEvent = () => {
        if (root.value == undefined) return;
        rootBoundingClientRect = root.value.getBoundingClientRect();
      };
      virtualLayout.loadLayout(validateLayoutConfig({ root: undefined }));
      isInitialized.value = true;
    }
  );
  onUnmounted(() => {
    virtualLayout?.destroy();
    resizeWatcher?.dispose();
  });
  // #endregion

  // #region 仮想レイアウトとイベントハンドラ
  /** 仮想レイアウトにバインドするときのイベントハンドラ */
  const handleBindComponentEvent: VirtualLayout.BindComponentEventHandler = (
    container: ComponentContainer,
    itemConfig: ResolvedComponentItemConfig
  ): ComponentContainer.BindableComponent => {
    const refId = getRefId(itemConfig.componentState);
    refIdList.push(refId);
    const element = elements.value.find((component) => component.refId === refId)?.element;
    if (element == undefined) throw new Error(`element not found: ${refId}`);
    container.virtualRectingRequiredEvent = (container, width, height) =>
      handleContainerVirtualRectingRequiredEvent(container, width, height);
    container.virtualVisibilityChangeRequiredEvent = (container, visible) =>
      handleContainerVirtualVisibilityChangeRequiredEvent(container, visible);
    container.virtualZIndexChangeRequiredEvent = (container, logicalZIndex, defaultZIndex) =>
      handleContainerVirtualZIndexChangeRequiredEvent(container, logicalZIndex, defaultZIndex);
    container.stateRequestEvent = () => handleRequestEvent(refId);
    return {
      component: element,
      virtual: true,
    };
  };

  /** 仮想レイアウトにアンバインドするときのイベントハンドラ */
  const handleUnbindComponentEvent = (componentContainer: ComponentContainer): void => {
    const refId = getRefId(componentContainer.state);
    const index = refIdList.findIndex((id) => id === refId);
    if (index != undefined) refIdList.splice(index, 1);
    onClosed(refId);
  };

  /** ウィンドウの位置やサイズを変更時のイベントハンドラ */
  const handleContainerVirtualRectingRequiredEvent = (
    container: ComponentContainer,
    width: number,
    height: number
  ): void => {
    const element = container.component as HTMLElement; // handleBindComponentEventで必ずHTMLElementをcomponentに格納しているので型アサーションしてもいい。
    if (element == undefined) return;
    const containerBoundingClientRect = container.element.getBoundingClientRect();
    const left = containerBoundingClientRect.left - rootBoundingClientRect.left;
    const top = containerBoundingClientRect.top - rootBoundingClientRect.top;
    element.style.left = `${left}px`;
    element.style.top = `${top}px`;
    element.style.width = `${width}px`;
    element.style.height = `${height}px`;
  };

  /** 表示・非表示の切り替え時のイベントハンドラ */
  const handleContainerVirtualVisibilityChangeRequiredEvent = (
    container: ComponentContainer,
    visible: boolean
  ): void => {
    const element = container.component as HTMLElement; // handleBindComponentEventで必ずHTMLElementをcomponentに格納しているので型アサーションしてもいい。
    if (element == undefined) return;
    element.style.display = visible ? '' : 'none';
  };

  /** ZIndex変化時のイベントハンドラ */
  const handleContainerVirtualZIndexChangeRequiredEvent = (
    container: ComponentContainer,
    _logicalZIndex: LogicalZIndex,
    defaultZIndex: string
  ): void => {
    const element = container.component as HTMLElement; // handleBindComponentEventで必ずHTMLElementをcomponentに格納しているので型アサーションしてもいい。
    if (element == undefined) return;
    element.style.zIndex = defaultZIndex;
  };

  /** componentState参照時のイベントハンドラ */
  const handleRequestEvent = (refId: string): JsonValue | undefined => {
    const element = elements.value.find((element) => element.refId === refId);
    return { refId, props: element?.props };
  };
  // #endregion

  return { saveLayout, loadLayout, reset };
}

/** DhsGoldenLayoutPanel向けのオブジェクトを生成するコンポーザブル。 */
export const useGoldenLayoutPanel = (persist: PersistLayoutOptions) => {
  /** DhsGoldenLayoutPanelのelementを生成するための情報 */
  const configList = ref<ElementConfig[]>([]);
  /** DhsGoldenLayoutPanelのレイアウトを表示する領域。 */
  const layout = ref();
  /** DhsGoldenLayoutPanelのゴールデンレイアウト上に配置されるHTML要素。 */
  const elementItemList = ref<ElementItem[]>([]);
  const addConfig = (componentType: { type: string; name: string }) =>
    configList.value.push(createElementConfig(componentType.type, componentType.name));
  const removeConfig = (refId: string) => {
    const index = configList.value.findIndex((config) => config.refId === refId);
    configList.value.splice(index, 1);
  };
  const { saveLayout, loadLayout } = useGoldenLayout(layout, elementItemList, removeConfig, persist);
  onMounted(() => {
    const loadedConfigList = loadLayout();
    if (loadedConfigList == undefined) return;
    configList.value = loadedConfigList;
  });

  return { configList, layout, elementItemList, addConfig, removeConfig, saveLayout };
};

/** 新規のelementの識別IDを生成する。 */
const createRefId = () => nanoid();
/** 新規のelementを生成するための情報を生成する。 */
export const createElementConfig = (type: string, title?: string, props?: object): ElementConfig => {
  const config: ElementConfig = { refId: createRefId(), type, title: title ?? '', props: props ?? {} };
  return config;
};

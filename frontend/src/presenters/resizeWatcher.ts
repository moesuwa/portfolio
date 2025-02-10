/**
 * ResizeObserverを用いて、HTML ElementのResizeイベントを監視し、Resize発生後の最初のアニメーションフレームでコールバック通知を行う。
 * アニメーションフレームが発生するまでの間に、複数回のResizeイベントが発生しても、コールバックを呼び出すのは1度のみである。
 * コールバック処理は、必ず同期処理にすること（async/await厳禁）
 */
export class ResizeWatcher {
  /** サイズ変更を取得するためのResizeObserverオブジェクト */
  private readonly observer: ResizeObserver;
  /** requestAnimationFrameの登録ID */
  private requestId: ReturnType<typeof requestAnimationFrame> | null = null;
  /**
   * コンストラクター。なお、コンストラクターを呼び出すと必ずcallback通知を行う。
   * この時のcallbackはアニメーションフレームとは関係なく呼び出す。
   * @param element Resizeの監視対象
   * @param callback Resize発生時のコールバック
   */
  public constructor(
    private element: Element,
    private callback: (element: Element) => void
  ) {
    this.observer = new ResizeObserver(this.queueResize);
    this.observer.observe(element);
  }
  /** 廃棄処理。忘れず呼び出すこと。 */
  public dispose = () => {
    this.cancelResize();
    this.observer.unobserve(this.element);
  };
  /** requestAnimationFrameに登録する。 */
  private queueResize = () => {
    this.cancelResize();
    this.requestId = requestAnimationFrame(() => this.resize());
  };
  /** requestAnimationFrameを解除する。 */
  private cancelResize = () => {
    if (this.requestId) {
      cancelAnimationFrame(this.requestId);
      this.requestId = null;
    }
  };
  /** resize発生。 */
  private resize = () => {
    this.cancelResize();
    this.callback(this.element);
  };
}

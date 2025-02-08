import { boot } from 'quasar/wrappers';
import messages from 'i18n';
import { createI18n } from 'vue-i18n';

const i18n = createI18n({
  legacy: false,
  locale: 'ja',
  fallbackLocale: 'ja',
  globalInjection: true,
  messages,
  // i18n-tのタグを使用すると"[intlify] Not found parent scope. use the global scope."の警告が出るため、スコープにglobalを指定する。
  // https://vue-i18n.intlify.dev/guide/advanced/component#scope-resolving
  // https://github.com/intlify/vue-i18n-next/discussions/851
  useScope: 'global',
});

export default boot(({ app }) => {
  // Set i18n instance on app
  app.use(i18n);
});

// useI18nは、vue-i18nにも定義が存在するが、vue-i18nはsetupコンテキストからしか呼び出せず、
// 初期化中のawait処理の後で呼び出すとエラーとなる。
// それは不便なので、どこからでも呼び出せるよう事前定義にしておく。
export function useI18n() {
  const { t, te, d, n, ...globalApi } = i18n.global;

  return {
    t: t.bind(i18n),
    d: d.bind(i18n),
    te: te.bind(i18n),
    n: n.bind(i18n),
    ...globalApi,
  };
}

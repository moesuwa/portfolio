export default {
  extends: [
    'stylelint-config-standard-scss', // SCSS向けの標準ルール
    'stylelint-config-html', // Vue SFCの <style> タグを解析
    'stylelint-config-recess-order', // プロパティの順序をチェック
  ],

  rules: {
    'declaration-property-value-disallowed-list': [
      {
        'z-index': ['/.*/'], // プロジェクト全体で `z-index` を禁止する。
      },
    ],

    'value-keyword-case': null, // 値の大文字小文字をチェックしない（v-bindなどでscript内の変数を使うため）
    'scss/dollar-variable-pattern': null, // 変数名のパターンを無視する（v-bindなどでscript内の変数を使うため）
    'scss/load-partial-extension': 'always', // SCSSのimport時拡張子を必ず指定する
  },
  overrides: [
    {
      files: ['**/*.vue'],
      customSyntax: 'postcss-html', // Vueファイル内のCSS解析をするために継承
      rules: {},
    },
    {
      files: ['**/z-index.scss'],
      rules: {
        'declaration-property-value-disallowed-list': {
          'z-index': [], // 例外として `z-index` を許可
        },
      },
    },
  ],
};

import Plotly from 'plotly.js-dist-min';

/** Plotlyで使用する色の一覧 */
const plotlyColor = {
  background: '#081226',
  font: '#ffffff',
  default: '#ffffff',
};

/**
 * グラフを表示しないためのレイアウト
 * 表示するデータがないのにレイアウトだけ作成してしまうと、X軸やY軸の数値がめちゃくちゃな目盛船が表示されてしまうことがあるため、
 * そのような表示になってほしくない場合に使用する。
 */
export const onlyTitleLayout = (baseLayout: Partial<Plotly.Layout>): Partial<Plotly.Layout> => ({
  title: baseLayout.title ?? '',
  xaxis: {
    visible: false,
  },
  yaxis: {
    visible: false,
  },
  height: baseLayout.height ?? 0,
  width: baseLayout.width ?? 0,
  paper_bgcolor: plotlyColor.background,
  plot_bgcolor: plotlyColor.background,
  showlegend: false,
});

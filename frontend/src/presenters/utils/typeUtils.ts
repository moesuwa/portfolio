/** nullやundefinedを返すmapからnullやundefinedを取り除いた配列を返す。 */
export const mapFilter = <Src, Dst>(array: Src[], mapFunction: (src: Src) => Dst | null | undefined): Dst[] => {
  return array.map(mapFunction).filter((dst): dst is Dst => dst != undefined);
};

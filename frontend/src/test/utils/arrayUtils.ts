export const createSerialArray = (start: number, count: number): number[] =>
  Array(count)
    .fill(0) // fillしないとmapが呼び出されない。
    .map((_, index) => index + start);

export const createArray = <T>(length: number, value: T): T[] => Array(length).fill(value);

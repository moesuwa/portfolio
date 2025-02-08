import { vi, beforeAll } from 'vitest';

/**
 * PixiJSをモックする。
 * "node_modules/@pixi"のファイルでエラーが発生する場合はこれを呼び出す。
 */
export const usePixiJSMock = () => {
  beforeAll(() => {
    vi.mock('pixi.js', () => ({
      Application: vi.fn().mockImplementation(() => ({
        stage: {
          addChild: vi.fn(),
        },
      })),
      Container: vi.fn().mockImplementation(() => ({
        addChild: vi.fn(),
      })),
      TextStyle: vi.fn(),
      Graphics: vi.fn(),
      Text: vi.fn(),
    }));
  });
};

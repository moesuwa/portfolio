import { LocalStorage } from 'quasar';

/** ローカルストレージに情報を保存するキー */
export const LocalStorageKeys = {
  GoldenLayout: 'goldenLayout',
} as const;
export type LocalStorageKeys = (typeof LocalStorageKeys)[keyof typeof LocalStorageKeys];

/** LocalStorageの指定されたキーに文字列を保存するコンポーザブル。 */
export const useLocalStorage = <T>(key: LocalStorageKeys) => {
  const save = (value: T) => LocalStorage.set(key, value);
  const load = (): T | undefined => <T>LocalStorage.getItem(key) ?? undefined;
  return { save, load };
};

/** LocalStorageの指定されたキーに文字列を保存するコンポーザブル。値がない場合、defaultの値を返す。 */
export const useLocalStorageDefaultValue = <T>(key: LocalStorageKeys, defaultValue: T) => {
  const save = (value: T) => LocalStorage.set(key, value);
  const load = (): T => <T>LocalStorage.getItem(key) ?? defaultValue;
  return { save, load };
};

/** LocalStorageの指定されたキーにJSONシリアライズされた文字列を保存するコンポーザブル */
export const useLocalStorageObject = <T>(key: LocalStorageKeys) => {
  const localStorage = useLocalStorage<string>(key);
  const save = (value: T) => localStorage.save(JSON.stringify(value));
  const load = (): T | undefined => {
    const json = localStorage.load();
    return json != undefined ? JSON.parse(json) : undefined;
  };
  return { save, load };
};

import { vi } from "vitest";

interface StorageData<T> {
  value: T;
  version?: number;
}

export const setDataToStorage = <T>(
  storage: Storage,
  key: string,
  value: T,
  version?: number
): void => {
  const dataToStore: StorageData<T> = {
    value: value,
    version: version,
  };

  storage.setItem(key, JSON.stringify(dataToStore));
};

export const getDataFromStorage = <T>(
  storage: Storage,
  key: string
): StorageData<T> | null => {
  const storedData = storage.getItem(key);
  if (storedData) {
    return JSON.parse(storedData) as StorageData<T>;
  }
  return null;
};

export const removeDataFromStorage = (storage: Storage, key: string): void => {
  storage.removeItem(key);
};

export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const createAsyncMock = (storage: Storage = localStorage) => {
  const mockAsynStorage = {
    getItem: vi.fn().mockImplementation((key: string) => {
      return Promise.resolve(storage.getItem(key));
    }),
    setItem: vi.fn().mockImplementation((key: string, value: string) => {
      return Promise.resolve(storage.setItem(key, value));
    }),
    removeItem: vi.fn(),
  };
  return mockAsynStorage;
};

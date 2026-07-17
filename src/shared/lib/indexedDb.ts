const DATABASE_NAME = "dataroom";
const DATABASE_VERSION = 1;

export function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains("app")) {
        database.createObjectStore("app");
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getFromDatabase<T>(key: string): Promise<T | undefined> {
  const database = await openDatabase();

  return new Promise<T | undefined>((resolve, reject) => {
    const request = database
      .transaction("app", "readonly")
      .objectStore("app")
      .get(key);
    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(request.error);
  }).finally(() => database.close());
}

export async function setInDatabase<T>(key: string, value: T): Promise<void> {
  const database = await openDatabase();

  return new Promise<void>((resolve, reject) => {
    const request = database
      .transaction("app", "readwrite")
      .objectStore("app")
      .put(value, key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  }).finally(() => database.close());
}

export async function deleteFromDatabase(key: string): Promise<void> {
  const database = await openDatabase();

  return new Promise<void>((resolve, reject) => {
    const request = database
      .transaction("app", "readwrite")
      .objectStore("app")
      .delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  }).finally(() => database.close());
}

import axios from "axios";

const apiUrl = "https://db.ygoprodeck.com/api/v7/cardinfo.php";
const dbName = "YGoDatabase";
const storeName = "KameGame";

let db: IDBDatabase | null = null;

/**
 * Creates or opens the IndexedDB database.
 * Uses version 1 to trigger onupgradeneeded when needed.
 */
export const createDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = (e) => {
      db = (e.target as IDBOpenDBRequest).result;
      console.log("onupgradeneeded triggered");
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: "name" });
        console.log(`Object store '${storeName}' created with keyPath 'name'`);
      }
    };

    request.onsuccess = (e) => {
      db = (e.target as IDBOpenDBRequest).result;
      console.log("Database opened successfully");
      resolve(db);
    };

    request.onerror = (e) => {
      reject((e.target as IDBOpenDBRequest).error);
    };
  });
};

/**
 * Stores the card data in IndexedDB.
 * Expects the data parameter to be an array of card objects.
 */
export const storeData = (data: any[]): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Ensure the database is open
      if (!db) {
        await createDatabase();
      }
      if (!db) {
        return reject(new Error("Database not initialized"));
      }

      const transaction = db.transaction([storeName], "readwrite");
      const objectStore = transaction.objectStore(storeName);

      console.log("Data to store:", data);
      data.forEach((item) => {
        const putRequest = objectStore.put(item);

        putRequest.onerror = (e) => {
          console.error("Error storing card:", (e.target as IDBRequest).error);
          // Using optional chaining to safely reject
          reject((e.target as IDBRequest).error || new Error("Unknown error"));
        };
      });

      transaction.oncomplete = () => {
        console.log("All data stored successfully");
        resolve();
      };

      transaction.onerror = (e) => {
        console.error("Transaction error:", (e.target as IDBRequest).error);
        reject((e.target as IDBRequest).error);
      };
    } catch (err) {
      console.error("storeData error", err);
      reject(err);
    }
  });
};

/**
 * Fetches data from the YGOPRODeck API and stores it in IndexedDB.
 */
export const fetchAndStore = async (): Promise<void> => {
  try {
    const response = await axios.get(apiUrl);
    const data = response.data;
    // Assuming the API returns an object with a 'data' property that is an array of cards
    if (data?.data && Array.isArray(data.data)) {
      await storeData(data.data);
      console.log("Data has been fetched and stored", data);
    } else {
      console.error("Unexpected data format:", data);
    }
  } catch (err) {
    console.error("Error fetching or storing data:", err);
  }
};

/**
 * Retrieves a card object by its name (the key).
 */
export const getData = async (name: string): Promise<any> => {
  if (!db) {
    await createDatabase();
  }
  return new Promise((resolve, reject) => {
    if (!db) return reject(new Error("Database not initialized"));
    const transaction = db.transaction(storeName, "readonly");
    const objectStore = transaction.objectStore(storeName);
    const request = objectStore.get(name);

    request.onsuccess = (e) => {
      const result = (e.target as IDBRequest).result;
      result
        ? resolve(result)
        : reject(new Error(`Card with name ${name} not found`));
    };

    request.onerror = (e) => {
      reject(
        new Error(`Error fetching card data: ${(e.target as IDBRequest).error}`)
      );
    };
  });
};

export const getCard = async (name: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error("Database is not initialized."));
      return;
    }

    const transaction = db.transaction("cards", "readonly");
    const objectStore = transaction.objectStore("cards");
    const request = objectStore.get(name);

    request.onsuccess = () => {
      const card = request.result;
      resolve(card);
    };

    request.onerror = (err) => {
      console.error(`Error getting card information:`, err);
      reject(err);
    };
  });
};

//Search function to currently search by name. Will be updating in a seperate
export const searchCardsByKeyword = async (keyword: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error("Database is not initialized."));
      return;
    }

    const results: any[] = [];
    const transaction = db.transaction(storeName, "readonly");

    const store = transaction.objectStore(storeName);
    const request = store.openCursor();

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        const record = cursor.value;
        const nameMatches =
          record.name &&
          record.name.toLowerCase().includes(keyword.toLowerCase());
        // const descMatches =
        //   record.desc &&
        //   record.desc.toLowerCase().includes(keyword.toLowerCase());

        if (nameMatches) {
          results.push(record);
        }
        cursor.continue();
      } else {
        resolve(results);
      }
    };

    request.onerror = (event) => {
      reject((event.target as IDBRequest).error);
    };
  });
};

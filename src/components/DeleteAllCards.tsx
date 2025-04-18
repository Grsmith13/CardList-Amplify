// utils/binderUtils.ts
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";

const client = generateClient<Schema>();

export async function deleteAllCardsFromBinder() {
  try {
    const result = await client.models.Binder.list();
    const deletePromises = result.data.map((card) =>
      client.models.Binder.delete({ id: card.id })
    );
    await Promise.all(deletePromises);
    console.log("All cards deleted from the binder.");
  } catch (error) {
    console.error("Failed to delete all cards:", error);
  }
}

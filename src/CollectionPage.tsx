import React, { useState, useEffect } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import "./CollectionPage.css"; // Import the CSS file

const client = generateClient<Schema>();

export const CollectionPage = () => {
  const [todos, setTodos] = useState<Array<Schema["Binder"]["type"]>>([]);
  const [loading, setLoading] = useState(true);

  // Fetch cards when the component mounts
  useEffect(() => {
    const subscription = client.models.Binder.observeQuery().subscribe({
      next: (data) => {
        setTodos(data.items);
        setLoading(false); // Set loading to false when data is fetched
      },
      error: (err) => {
        console.error("Error fetching data:", err);
        setLoading(false); // Set loading to false if there's an error
      },
    });

    // Cleanup the subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function deleteCardFromCollection(cardID: string | undefined) {
    if (cardID) {
      try {
        // Assuming the id field is the partition key, we delete by 'id'
        const cardToDelete = todos.find((card) => card.CardID === cardID); // Find the card by its CardID
        if (cardToDelete) {
          // Delete the card from your "Binder" model using the correct property name 'id'
          await client.models.Binder.delete({ id: cardToDelete.id });

          // Update the UI state to reflect the deletion
          setTodos(
            (prevCards) =>
              prevCards.filter((card) => card.id !== cardToDelete.id) // Use 'id' to remove the card
          );

          console.log(`Card with id ${cardToDelete.id} deleted successfully.`);
        } else {
          console.error(`Card with CardID ${cardID} not found.`);
        }
      } catch (error) {
        console.error("Error deleting card:", error);
      }
    } else {
      console.error("CardID is undefined or null.");
    }
  }

  return (
    <div className="container">
      <div className="header">
        <h2>CollectionPage</h2>
      </div>

      {loading ? (
        <div className="loading">Loading your collection...</div>
      ) : (
        <div className="card-list">
          {todos.map((card, index) => (
            <div key={index} className="card-item">
              <h3>{card.Name}</h3>
              <p>
                <strong>Description:</strong> {card.Description}
              </p>
              <p>
                <strong>ATK:</strong> {card.ATK}
              </p>
              <p>
                <strong>DEF:</strong> {card.DEF}
              </p>
              <p>
                <strong>Type:</strong> {card.Type}
              </p>
              <button
                onClick={() => {
                  if (card.CardID) {
                    // Check if card.CardID is a valid string
                    deleteCardFromCollection(card.CardID);
                  } else {
                    console.error("CardID is invalid.");
                  }
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

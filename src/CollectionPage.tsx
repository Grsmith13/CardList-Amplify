import { useState, useEffect } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import "./CollectionPage.css"; // Import the CSS file

// Initialize the client for querying and mutating the data
const client = generateClient<Schema>();

export const CollectionPage = () => {
  const [todos, setTodos] = useState<Array<Schema["Binder"]["type"]>>([]); // Adjust according to your schema
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

  // Delete card from the collection by ID
  async function deleteCardFromCollection(cardID: string | undefined) {
    if (cardID) {
      try {
        // Find the card by CardID
        const cardToDelete = todos.find((card) => card.CardID === cardID);

        if (cardToDelete) {
          // Delete the card from the model
          await client.models.Binder.delete({ id: cardToDelete.id });

          // Update the UI state after deletion
          setTodos((prevCards) =>
            prevCards.filter((card) => card.id !== cardToDelete.id)
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
    <div className="collection-container">
      <div className="header">
        <h2>My Card Collection</h2>
      </div>

      {loading ? (
        <div className="loading">Loading your collection...</div>
      ) : (
        <div className="card-list">
          {todos.map((card, index) => (
            <div key={index} className="card-item">
              <h3>{card.Name}</h3>
              <p>
                <img src={card.CardImages_1_imageUrl ?? ""}></img>
              </p>
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

import { useState, useEffect } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import Pagination from "./components/Pagination";

import "./CollectionPage.css"; // Import the CSS file
import Popup from "./components/Popup";

// Initialize the client for querying and mutating the data
const client = generateClient<Schema>();

type Card = Schema["Binder"]["type"];
export const CollectionPage = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [cards, setCards] = useState<Array<Schema["Binder"]["type"]>>([]); // Adjust according to your schema

  const [loading, setLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  // Fetch cards when the component mounts
  useEffect(() => {
    const subscription = client.models.Binder.observeQuery().subscribe({
      next: (data) => {
        setCards(data.items);
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
        const cardToDelete = cards.find((card) => card.CardID === cardID);

        if (cardToDelete) {
          // Delete the card from the model
          await client.models.Binder.delete({ id: cardToDelete.id });

          // Update the UI state after deletion
          setCards((prevCards) =>
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

  const totalPrice = cards.reduce(
    (total, card) => total + (card.CardPrices_1_tcgplayerPrice ?? 0),
    0
  );

  //Pagination

  const [currentPage, setCurrentPage] = useState(1);

  //Get Current posts
  const indexofFirstPost = currentPage === 1 ? 0 : 9 + (currentPage - 2) * 18;
  const indexOfLastPost = currentPage === 1 ? 9 : indexofFirstPost + 18;
  const currentPosts = cards.slice(indexofFirstPost, indexOfLastPost);

  const totalSlots = currentPage === 1 ? 0 : 18;
  const filledPosts: ((typeof cards)[number] | null)[] = [...currentPosts];
  while (filledPosts.length < totalSlots) {
    filledPosts.push(null);
  }

  const handleCardClicked = (card: any) => {
    if (!card) return;
    setSelectedCard(card);
    setShowPopup(true);
  };

  return (
    <div className="collection-container">
      <div className="header">
        <h2>My Card Collection</h2>
        <h2 className="binder-value" style={{ padding: "20" }}>
          Total collection value is:
          {"  $" + totalPrice}
        </h2>
      </div>
      {loading ? (
        <div className="loading">Loading your collection...</div>
      ) : (
        <div className={`card-binder ${currentPage > 1 ? "two-pages" : ""}`}>
          {filledPosts.map((card, index) => (
            <div
              key={index}
              className="card-item"
              onClick={() => handleCardClicked(card)}
            >
              {card ? (
                <>
                  <div className="card-art">
                    <img
                      src={card.CardImages_1_imageUrl || ""}
                      alt="Card Art"
                    />
                  </div>
                  <div className="card-btm">
                    <div className="card-LVL-ATT">
                      <span>{card.Type}</span>
                      <span>{card.FrameType}</span>
                    </div>
                    <div className="card-ATK-DEF">
                      <span>A: {card.ATK}</span>
                      <span>D: {card.DEF}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="placeholder-card">
                  <div className="empty-slot"> </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <Popup trigger={showPopup} setTrigger={setShowPopup}>
        <h3>Are you sure you want to delete this card?</h3>
        <button
          onClick={() => {
            if (selectedCard?.CardID) {
              deleteCardFromCollection(selectedCard?.CardID);
            } else {
              console.log("card does not exist");
            }
            setShowPopup(false);
          }}
        >
          Confirm Delete
        </button>
        <button
          onClick={() => {
            setShowPopup(false);
          }}
        >
          no
        </button>
      </Popup>
      <Pagination
        totalPosts={cards.length}
        postsPerPage={currentPage === 1 ? 9 : 18}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
};

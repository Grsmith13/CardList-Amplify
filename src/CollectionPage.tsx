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

  console.log(cards);
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

  const totalSlots = currentPage === 1 ? 9 : 18;
  const filledPosts: ((typeof cards)[number] | null)[] = [...currentPosts];
  while (filledPosts.length < totalSlots) {
    filledPosts.push(null);
  }

  const handleCardClicked = (card: any) => {
    if (!card) return;
    setSelectedCard(card);
    setShowPopup(true);
  };

  const getCardBackground = (frame: any) => {
    console.log(frame);
    switch (frame) {
      case "fusion":
        return "violet";

      case "spell":
        return "darkgreen";

      case "trap":
        return "purple";

      case "ritual":
        return "blue";

      case "xyz":
        return "black";
      case "syncro":
        return "white";

      case "pendulum":
        return "green";

      default:
        console.log("Error card frame not found.");
    }
  };

  const CardLevel = (level: any) => {
    const cardLevel = level;

    const imgPath = "src\\assets\\yugioh_star2.PNG";

    return (
      <>
        {Array.from({ length: cardLevel }).map((_, index) => (
          <img
            key={index}
            src={imgPath}
            alt={`Image ${index + 1}`}
            style={{ margin: "0px", width: "25px", height: "25px" }}
          />
        ))}
      </>
    );
  };

  return (
    <div className="collection-container">
      <div className="header">
        <h2>My Card Collection</h2>
      </div>
      <h2 className="binder-value" style={{ padding: "20" }}>
        Total collection value is:
        {"  $" + totalPrice.toFixed(2)}
      </h2>
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
                  <div
                    className="card-btm"
                    style={{
                      background: getCardBackground(card?.FrameType) || "",
                    }}
                  >
                    {card?.FrameType !== "trap" &&
                    card?.FrameType !== "spell" ? (
                      <>
                        <div className="card-LVL-ATT">
                          <div className="card-LVL">
                            {CardLevel(card.Level)}
                          </div>
                          <div className="card-ATT">
                            <img
                              className="img-ATT"
                              style={{ fontSize: ".4rem" }}
                              src={`src/assets/${card?.Attribute?.toLowerCase() ?? "default"} symbol.svg`}
                              alt="Card Art"
                            />
                          </div>
                        </div>
                        <div className="card-ATK-DEF">
                          <div className="stat-box">
                            {" "}
                            <span>{card.ATK}</span>
                          </div>
                          <div className="stat-box">
                            <span>{card.DEF}</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="magic-trap-box">
                        <div
                          className="stat-box"
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            paddingTop: ".75rem",
                            paddingBottom: ".75rem",
                          }}
                        >
                          {card?.FrameType == "trap" ? (
                            <img
                              className="img-ATT"
                              style={{ fontSize: ".4rem" }}
                              src={"src\\assets\\trap symbol.svg"}
                              alt="Card Art"
                            />
                          ) : (
                            <img
                              className="img-ATT"
                              style={{ fontSize: ".4rem" }}
                              src={"src\\assets\\spell symbol.svg"}
                              alt="Card Art"
                            />
                          )}
                        </div>
                      </div>
                    )}
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
      <Pagination totalPosts={cards.length} setCurrentPage={setCurrentPage} />
    </div>
  );
};

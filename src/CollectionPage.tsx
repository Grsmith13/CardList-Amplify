import { useState, useEffect } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import Pagination from "./components/Pagination";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { getOrCreateGuestId } from "./components/CreateID";

import "./CollectionPage.css"; // Import the CSS file

// Initialize the client for querying and mutating the data
const client = generateClient<Schema>();

type Card = Schema["Binder"]["type"];

interface AppProps {
  isGuest: boolean;
}
export const CollectionPage = ({ isGuest }: AppProps) => {
  const { user } = useAuthenticator((context) => [context.user]);

  const [showPopup, setShowPopup] = useState(false);
  const [cards, setCards] = useState<Array<Schema["Binder"]["type"]>>([]); // Adjust according to your schema
  const [loading, setLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [cardInfoVisible, setCardInfoVisible] = useState(false);
  const [ownerId, setOwnerId] = useState("");

  // Fetch cards when the component mounts
  useEffect(() => {
    if (isGuest) {
      setOwnerId(getOrCreateGuestId());
    } else {
      setOwnerId(user.userId);
    }
    const subscription = client.models.Binder.observeQuery({
      filter: {
        UserID: {
          eq: ownerId,
        },
      },
    }).subscribe({
      next: (data) => {
        setCards(data.items);
        setLoading(false);
      },
      error: (err) => {
        console.error("Error fetching data:", err);
        setLoading(false);
      },
    });

    return () => subscription.unsubscribe();
  }, [ownerId]);
  useEffect(() => {
    const handleBeforeUnload = async () => {
      await deleteAllCardsFromBinder();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
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
  console.log(showPopup);
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
    setCardInfoVisible(true);
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

    return (
      <>
        {Array.from({ length: cardLevel }).map((_, index) => (
          <img
            key={index}
            src={"/assets/yugioh_star2.png"}
            alt={`Image ${index + 1}`}
            style={{ margin: "0px", width: "25px", height: "25px" }}
          />
        ))}
      </>
    );
  };

  async function deleteAllCardsFromBinder() {
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

  return (
    <>
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
                    <button
                      className="card-button"
                      onClick={(e) => {
                        setSelectedCard(card);
                        console.log("delete button clicked");
                        e.stopPropagation(); // Prevent click from triggering card details popup
                        if (card?.CardID != null) {
                          deleteCardFromCollection(card.CardID);
                        }
                      }}
                    >
                      ✕
                    </button>
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
                                src={`/assets/${card?.Attribute?.toLowerCase() ?? "default"} symbol.svg`}
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
                                src={`/assets/trap symbol.svg`}
                                alt="Card Art"
                              />
                            ) : (
                              <img
                                className="img-ATT"
                                style={{ fontSize: ".4rem" }}
                                src={`/assets/spell symbol.svg`}
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
        {cardInfoVisible && (
          <div className="card-info-box">
            <p>
              <strong>Level:</strong> {selectedCard?.Level}
            </p>
            <p>
              <strong>Type:</strong> {selectedCard?.Type}
            </p>
            <p>
              <strong>Effect:</strong> {selectedCard?.Description}
            </p>
            <p>
              <strong>Attack:</strong> {selectedCard?.ATK}
            </p>
            <p>
              <strong>Defense:</strong> {selectedCard?.DEF}
            </p>
            <p>
              <strong>$</strong> {selectedCard?.CardPrices_1_tcgplayerPrice}
            </p>
          </div>
        )}
        {/* <Popup trigger={showPopup} setTrigger={setShowPopup}>
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
        </Popup> */}
        <div className="pagination-container">
          <Pagination
            totalPosts={cards.length}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </div>
    </>
  );
};

import { Button } from "@aws-amplify/ui-react";
import { useState, useMemo, useCallback } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../amplify/data/resource";
import "./SearchPage.css";
import { Card } from "./components/Card";
import Pagination from "./components/Pagination";
import { searchCardsByKeyword } from "./components/CreateCache";

const client = generateClient<Schema>();

export const SearchPage = () => {
  const [card] = useState<any>(null);
  const [cards, setCards] = useState<any[]>([]);
  const [cardName, setCardName] = useState("");
  const [popupVisible, setPopupVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [firstSearch] = useState(
    "Welcome! Please enter the card name you are looking for."
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(9);

  const handleInputChange = (e: any) => {
    setCardName(e.target.value);
  };

  const handleButtonClick = useCallback(async () => {
    if (!cardName.trim()) return;
    try {
      setLoading(true);
      const cardData = await searchCardsByKeyword(cardName);
      setCards(cardData);
    } catch (error) {
      console.error("Error fetching card data:", error);
    } finally {
      setLoading(false);
    }
    console.log(cards);
  }, [cardName]);
  //new comment
  const handleAddCollection = (card: any) => {
    setLoading(true);
    console.log("clicked", card);
    console.log("cards[0] =", card);
    if (cards) {
      client.models.Binder.create({
        CardID: card.CardID,
        ATK: card.ATK,
        Attribute: card.Attribute,
        DEF: card.DEF,
        Description: card.Description,
        FrameType: card.FrameType,
        Level: card.Level,
        Name: card.Name,
        Race: card.Race,
        Type: card.Type,
        // CardImages_1_imageUrl: cards[0].CardImages[0]?.image_url,
      })
        .then(() => {
          console.log("Card added:", card);
          setPopupVisible(true);
          setTimeout(() => setPopupVisible(false), 2000);
        })
        .catch((error) => console.log("Error adding card:", error))
        .finally(() => setLoading(false));
    } else {
      console.log("No card to add.");
    }
  };

  const renderedContent = useMemo(() => {
    const lastPostIndex = currentPage * postsPerPage;
    const firstPostIndex = lastPostIndex - postsPerPage;
    const currentPosts = cards.slice(firstPostIndex, lastPostIndex);

    if (card) {
      return <Card cardInfo={card} />;
    }

    if (cards.length > 0) {
      return (
        <>
          {currentPosts.map((card, index) => (
            <div>
              <button onClick={() => handleAddCollection(card)}>
                +
                <Card key={index} cardInfo={card} />
              </button>
            </div>
          ))}
          <Pagination
            totalPosts={cards.length}
            postsPerPage={postsPerPage}
            setCurrentPage={setCurrentPage}
          />
        </>
      );
    }

    return (
      <div style={{ textAlign: "center", color: "white" }}>{firstSearch}</div>
    );
  }, [card, cards, currentPage, postsPerPage, firstSearch]); // ✅ Add missing dependencies

  return (
    <>
      <form
        style={{
          background: "lightgrey",
          padding: "0 1rem",
          borderTop: "1px solid black",
          borderRight: "1px solid black",
          borderLeft: "1px solid black",
        }}
        onSubmit={(e) => e.preventDefault()}
      >
        <h4>
          <strong>Card Search</strong>
        </h4>
        <input
          type="text"
          id="ygo-name"
          name="ygo-name"
          placeholder="Enter card name"
          value={cardName}
          onChange={handleInputChange}
          required
        />
        <div className="form-buttons">
          <Button onClick={handleButtonClick} type="button">
            Search
          </Button>
          <Button onClick={handleAddCollection} type="submit">
            Add
          </Button>
        </div>
      </form>

      {/* ✅ Loading Spinner */}
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}

      {/* ✅ Card Display */}
      <div className="container">{renderedContent}</div>

      {/* ✅ Popup Message */}
      {popupVisible && (
        <div className="modal">
          <div className="modal-content">
            <p>Your card has been added to your collection!</p>
            <button
              onClick={() => setPopupVisible(false)}
              className="close-btn"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

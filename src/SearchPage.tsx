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
  const [firstSearch, setFirstSearch] = useState(
    "Welcome! Please enter the card name you are looking for."
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(9);

  const handleInputChange = (e: any) => {
    setCardName(e.target.value);
  };

  const handleButtonClick = useCallback(async () => {
    setCurrentPage(1);
    if (!cardName.trim()) return;

    try {
      setLoading(true);
      const cardData = await searchCardsByKeyword(cardName);

      if (cardData.length === 0) {
        setFirstSearch(` ${cardName} is not a valid card.`);
        setCards([]);
      } else {
        setCards(cardData);
        setFirstSearch(""); // Clear any old message
      }
    } catch (error) {
      console.error("Error fetching card data:", error);
      setFirstSearch("An error occurred while fetching cards.");
    } finally {
      setLoading(false);
    }
  }, [cardName]);
  const handleAddCollection = (card: any) => {
    setLoading(true);
    const {
      id,
      name,
      attribute,
      atk,
      def,
      desc,
      level,
      race,
      type,
      frameType,
      card_images,
      card_prices,
    } = card;
    console.log("clicked", card_images[0].image_url_cropped);
    if (cards) {
      client.models.Binder.create({
        CardID: id,
        ATK: atk,
        Attribute: attribute,
        DEF: def,
        Description: desc,
        FrameType: frameType,
        Level: level,
        Name: name,
        Race: race,
        Type: type,
        CardImages_1_imageUrl: card_images[0].image_url_cropped,
        CardPrices_1_tcgplayerPrice: card_prices[0].tcgplayer_price,
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
        <div className="card-grid">
          {currentPosts.map((card, index) => (
            <button
              key={index}
              onClick={() => handleAddCollection(card)}
              style={{
                margin: 0,
                padding: 0,
                background: "none",
                border: "none",
              }}
            >
              <Card cardInfo={card} />
            </button>
          ))}
        </div>
      );
    }

    return (
      <div style={{ textAlign: "center", color: "white" }}>{firstSearch}</div>
    );
  }, [card, cards, currentPage, postsPerPage, firstSearch]);

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
        </div>
      </form>

      {/* ✅ Loading Spinner */}
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}

      {/* ✅ Card Display */}
      <div
        className="container"
        style={
          !card ? { display: "flex", justifyContent: "center" } : undefined
        }
      >
        {renderedContent}
      </div>
      {!card ? (
        <div style={{ display: "flex", justifyContent: "right" }}>
          <Pagination
            totalPosts={cards.length}
            setCurrentPage={setCurrentPage}
          />
        </div>
      ) : null}
      {/* ✅ Popup Message */}
      {popupVisible && (
        <div className="modal">
          <div className="modal-content">
            <p>Your card has been added to your collection!</p>
            <button onClick={() => setPopupVisible(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
};

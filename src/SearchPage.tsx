import { Button } from "@aws-amplify/ui-react";
import { useState, useMemo, useCallback, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../amplify/data/resource";
import "./SearchPage.css";
import { Card } from "./components/Card";
import Pagination from "./components/Pagination";
import { searchCardsByKeyword } from "./components/CreateCache";
import { getOrCreateGuestId } from "./components/CreateID";
import { useAuthenticator } from "@aws-amplify/ui-react";

const client = generateClient<Schema>();

export const SearchPage = () => {
  const { user } = useAuthenticator((context) => [context.user]);

  const isGuest = !user;
  const [card] = useState<any>(null);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [cards, setCards] = useState<any[]>([]);
  const [cardName, setCardName] = useState("");
  const [popupVisible, setPopupVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [firstSearch, setFirstSearch] = useState(
    "Welcome! Please enter the card name you are looking for."
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(9);
  const [ownerId, setOwnerId] = useState("");
  const handleInputChange = (e: any) => {
    setCardName(e.target.value);
  };

  useEffect(() => {
    if (isGuest) {
      setOwnerId(getOrCreateGuestId());
    } else {
      setOwnerId(user.userId);
    }
  }, []);

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
    console.log(ownerId, user?.userId);
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
        isGuest,
        UserID: ownerId,
      })
        .then(() => {
          console.log("Card added:", card);
          setPopupVisible(false);
        })
        .catch((error) => console.log("Error adding card:", error))
        .finally(() => setLoading(false));
    } else {
      console.log("No card to add.");
    }
  };

  const handleCardClicked = (card: any) => {
    setSelectedCard(card);

    setPopupVisible(true);
  };

  const renderedContent = useMemo(() => {
    const lastPostIndex = currentPage * postsPerPage;
    const firstPostIndex = lastPostIndex - postsPerPage;
    const currentPosts = cards.slice(firstPostIndex, lastPostIndex);

    if (cards.length > 0) {
      return (
        <div className="card-grid">
          {currentPosts.map((card, index) => (
            <button
              key={index}
              onClick={() => handleCardClicked(card)}
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
  }, [cards, currentPage, postsPerPage, firstSearch]);

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
      {cards.length > 0 && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Pagination
            totalPosts={cards.length}
            setCurrentPage={setCurrentPage}
          />
        </div>
      )}

      {/* ✅ Popup Message */}
      {popupVisible && (
        <div className="modal">
          <div className="modal-content">
            <h2>{selectedCard.name}</h2>
            <p>
              <strong>Level:</strong> {selectedCard.level}
            </p>
            <p>
              <strong>Type:</strong> {selectedCard.type}
            </p>
            <p>
              <strong>Effect:</strong> {selectedCard.desc}
            </p>
            <p>
              <strong>Attack:</strong> {selectedCard.atk}
            </p>
            <p>
              <strong>Defense:</strong> {selectedCard.def}
            </p>
            <button onClick={() => handleAddCollection(selectedCard)}>
              add
            </button>
            <button onClick={() => setPopupVisible(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
};

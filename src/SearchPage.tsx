import { Button } from "@aws-amplify/ui-react";
import { useState } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../amplify/data/resource";
import axios from "axios";
import { API_URL } from "./utils";
import "./SearchPage.css";

const client = generateClient<Schema>();

export const SearchPage = () => {
  const [card, setCard] = useState<any>(null);
  const [cardName, setCardName] = useState("");
  const [popupVisible, setPopupVisible] = useState(false); // State for the popup
  const [loading, setLoading] = useState(false); // State for loading spinner

  const [firstSearch, setFirstSearch] = useState(
    "Welcome! Please enter the card name you are looking for."
  );
  const handleInputChange = (e: any) => {
    e.preventDefault();
    setCardName(e.target.value);
  };

  const handleFetchCard = async () => {
    setLoading(true); // Set loading to true when fetching card data
    try {
      const response = await axios.get(`${API_URL}/${cardName}`);
      console.log("handleFetch card found " + cardName);
      setFirstSearch(
        "Sorry that card does not exist. Please retry entering the name."
      );
      setCard(response.data[0]);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false); // Set loading to false after fetch is done
    }
  };

  const handleAddCollection = () => {
    setLoading(true); // Set loading to true when adding the card to the collection
    if (card) {
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

        // CardImages (flattened fields, assuming card.CardImages is an array of image objects)
        CardImages_1_id: card.CardImages[0]?.id,
        CardImages_1_imageUrl: card.CardImages[0]?.image_url,
        CardImages_1_imageUrlCropped: card.CardImages[0]?.image_url_cropped,
        CardImages_1_imageUrlSmall: card.CardImages[0]?.image_url_small,

        // CardPrices (flattened fields)
        CardPrices_1_amazonPrice: card.CardPrices[0]?.amazon_price,
        CardPrices_1_cardmarketPrice: card.CardPrices[0]?.cardmarket_price,
        CardPrices_1_coolstuffincPrice: card.CardPrices[0]?.coolstuffinc_price,
        CardPrices_1_ebayPrice: card.CardPrices[0]?.ebay_price,
        CardPrices_1_tcgplayerPrice: card.CardPrices[0]?.tcgplayer_price,

        // CardSets (flattened fields)
        CardSets_1_setCode: card.CardSets[0]?.set_code,
        CardSets_1_setName: card.CardSets[0]?.set_name,
        CardSets_1_setPrice: card.CardSets[0]?.set_price,
        CardSets_1_setRarity: card.CardSets[0]?.set_rarity,
        CardSets_1_setRarityCode: card.CardSets[0]?.set_rarity_code,
      })
        .then(() => {
          console.log("Card added:", card);
          setPopupVisible(true); // Show the popup
          setTimeout(() => setPopupVisible(false), 2000); // Hide after 2 seconds
        })
        .catch((error) => {
          console.log("Error adding card:", error);
        })
        .finally(() => {
          setLoading(false); // Set loading to false after the add is complete
        });
    } else {
      console.log("No card to add.");
    }
  };

  return (
    <>
      {/* Search and Add Form */}
      <form
        style={{
          background: "lightgrey",
          padding: "0 1rem 0 1rem",
          borderTop: "1px solid black",
          borderRight: "1px solid black",
          borderLeft: "1px solid black",
        }}
        onSubmit={(e) => e.preventDefault()}
      >
        <h4>
          <strong>Card Search</strong>
        </h4>
        <label className="required" htmlFor="ygo name"></label>
        <input
          type="text"
          id="ygo name"
          name="ygo name"
          placeholder="Enter card name"
          value={cardName}
          onChange={handleInputChange}
          required
        />
        <Button onClick={handleFetchCard} type="button">
          Search
        </Button>
        <Button onClick={handleAddCollection} type="submit">
          Add
        </Button>
      </form>

      {/* Loading Spinner */}
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}

      {/* Card Display */}
      <div className="card-container">
        <div className="card-image">
          <img
            src={
              card?.CardImages[0]?.image_url_small ||
              "https://img-9gag-fun.9cache.com/photo/aZyoZDV_460s.jpg"
            }
            alt="facedown yugioh card"
          />
        </div>

        <div className="card-information">
          {card ? (
            <>
              <strong>{card.Name}</strong>
              <p>
                Attribute and Monster/Card Type: {card.Attribute}/{card.Race}/
                {card.Type}
              </p>
              <p className="card-desc">Text/Effect: {card.Description}</p>
              <p>
                ATK/{card.ATK} DEF/{card.DEF}
              </p>
            </>
          ) : (
            <p>{firstSearch}</p>
          )}
        </div>
      </div>

      {/* Modal Popup */}
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

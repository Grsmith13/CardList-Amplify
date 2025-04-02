import express from "express";
import serverless from "serverless-http";
import cors from "cors";
import { fetchCards, fetchCardByName } from "./card.js";
const app = express();
const port = 3001;

app.use(express.json());

if (process.env.DEVELOPMENT) {
  app.use(cors());
}

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/cards/:name", async (req, res) => {
  try {
    const { name } = req.params; // Extract the name from the route
    const response = await fetchCards(name);
    res.send(response); // Assuming fetchCards already returns the Items
  } catch (error) {
    console.error("Error fetching cards:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

app.get("/card", async (req, res) => {
  try {
    const cardName = req.query.name;

    if (cardName) {
      // Fetch a card by name if 'name' query parameter is present
      const card = await fetchCardByName(cardName);
      if (!card) {
        return res.status(404).send("Card not found");
      }
      res.send(card);
    } else {
      // Otherwise, fetch all cards
      const cards = await fetchCards();
      res.send(cards.Items);
    }
  } catch (err) {
    res.status(400).send(`Error fetching cards: ${err}`);
  }
});

if (process.env.DEVELOPMENT) {
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
}

export const handler = serverless(app);

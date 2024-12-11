import express from "express";
import serverless from "serverless-http";
import cors from "cors";
import { fetchCards, fetchCardByName } from "./card.js";
/* createCards, updateCards, deleteCards  */
const app = express();
const port = 3001;

app.use(express.json());

if (process.env.DEVELOPMENT) {
  app.use(cors());
}

app.get("/", (req, res) => {
  res.send("Hello World!");
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
// app.post("/card", async (req, res) => {
//   try {
//     const card = req.body;

//     const response = await createCards(card);

//     res.send(response);
//   } catch (err) {
//     res.status(400).send(`Error creating cards: ${err}`);
//   }
// });

// app.put("/card", async (req, res) => {
//   try {
//     const card = req.body;

//     const response = await updateCards(card);

//     res.send(response);
//   } catch (err) {
//     res.status(400).send(`Error updating cards: ${err}`);
//   }
// });

// app.delete("/card/:id", async (req, res) => {
//   try {
//     const { id } = req.params;

//     const response = await deleteCards(id);

//     res.send(response);
//   } catch (err) {
//     res.status(400).send(`Error deleting cards: ${err}`);
//   }
// });

if (process.env.DEVELOPMENT) {
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
}

export const handler = serverless(app);

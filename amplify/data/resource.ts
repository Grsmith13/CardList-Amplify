import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any user authenticated via an API key can "create", "read",
"update", and "delete" any "Todo" records.
=========================================================================*/
const schema = a.schema({
  Binder: a
    .model({
      CardID: a.string(), // Card ID as a string
      ATK: a.integer(), // ATK as an integer
      Attribute: a.string(), // Attribute as a string (e.g., LIGHT)
      DEF: a.integer(), // DEF as an integer
      Description: a.string(), // Description as a string
      FrameType: a.string(), // FrameType as a string
      Level: a.integer(), // Level as an integer
      Name: a.string(), // Name as a string
      Race: a.string(), // Race as a string
      Type: a.string(), // Type as a string
      
      // CardImages as individual fields (Not using lists or references)
      CardImages_1_id: a.string(), // Example for a Card Image
      CardImages_1_imageUrl: a.string(), // Image URL
      CardImages_1_imageUrlCropped: a.string(), // Cropped image URL
      CardImages_1_imageUrlSmall: a.string(), // Small image URL

      // CardPrices as individual fields (Not using lists or references)
      CardPrices_1_amazonPrice: a.float(), // Amazon price
      CardPrices_1_cardmarketPrice: a.float(), // CardMarket price
      CardPrices_1_coolstuffincPrice: a.float(), // CoolStuffInc price
      CardPrices_1_ebayPrice: a.float(), // eBay price
      CardPrices_1_tcgplayerPrice: a.float(), // TCGPlayer price

      // CardSets as individual fields (Not using lists or references)
      CardSets_1_setCode: a.string(), // Set code for CardSet
      CardSets_1_setName: a.string(), // Set name for CardSet
      CardSets_1_setPrice: a.float(), // Set price
      CardSets_1_setRarity: a.string(), // Set rarity
      CardSets_1_setRarityCode: a.string(), // Set rarity code
    })
    .authorization((allow) => [allow.publicApiKey()]),

  // Define the CardPrice model (flattened fields to avoid references)
  CardPrice: a
    .model({
      amazonPrice: a.float(),
      cardmarketPrice: a.float(),
      coolstuffincPrice: a.float(),
      ebayPrice: a.float(),
      tcgplayerPrice: a.float(),
      binderId: a.string(), // Foreign key to Binder
    })
    .authorization((allow) => [allow.publicApiKey()]),

  // Define the CardSet model (flattened fields to avoid references)
  CardSet: a
    .model({
      setCode: a.string(),
      setName: a.string(),
      setPrice: a.float(),
      setRarity: a.string(),
      setRarityCode: a.string(),
      binderId: a.string(), // Foreign key to Binder
    })
    .authorization((allow) => [allow.publicApiKey()]),

  // Define the CardImage model (flattened fields to avoid references)
  CardImage: a
    .model({
      imageUrl: a.string(),
      imageUrlCropped: a.string(),
      imageUrlSmall: a.string(),
      binderId: a.string(), // Foreign key to Binder
    })
    .authorization((allow) => [allow.publicApiKey()]),


});




  





export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    // API Key is used for a.allow.public() rules
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>

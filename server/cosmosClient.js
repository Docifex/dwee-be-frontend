const { CosmosClient } = require('@azure/cosmos');

const cosmosClient = new CosmosClient({
  endpoint: process.env.COSMOS_ENDPOINT,
  key: process.env.COSMOS_KEY,
});

// Existing Users DB
const userDatabase = cosmosClient.database(process.env.COSMOS_DATABASE_ID_USERS);
const userContainer = userDatabase.container(process.env.COSMOS_CONTAINER_ID_USERS);

// New DWEEBE DB
const dweebeDatabase = cosmosClient.database(process.env.COSMOS_DATABASE_ID_DWEEBE);
const dweebeContainer = dweebeDatabase.container(process.env.COSMOS_CONTAINER_ID_DWEEBE);

console.log("DWEEBE DB:", process.env.COSMOS_DATABASE_ID_DWEEBE);
console.log("DWEEBE Container:", process.env.COSMOS_CONTAINER_ID_DWEEBE);


module.exports = {
  cosmosClient,
  userDatabase,
  userContainer,
  dweebeDatabase,
  dweebeContainer,
};

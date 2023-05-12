// Require the necessary discord.js classes
import { Client, Events, GatewayIntentBits } from 'discord.js';
// Require the .env file
import * as dotenv from 'dotenv';
// Configure the .env file
dotenv.config();

// Create a new client instance
// GatewayIntentBits.Guilds intents is necessary for discord.js client to ensure that it
// caches for guilds, channels, and rolesw are populated and available
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

// Log in to Discord with your client's token
client.login(process.env.TOKEN);

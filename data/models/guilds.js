import mongoose from 'mongoose';
import birthdays from './birthdays.js';
import events from './events.js';
import games from './games.js';
import quotes from './quotes.js';
import streamers from './streamers.js';

// Create the guild schema (template)
// Override the auto-generated _id field to pass in our own value
// 	This will be the guild id retrieved from Discord
// Store the birthdays, events, games, quotes, and streamers schema
//	Since they were exported as models, reference their schema with .schema (schema types can't be model)
// This is the only Collection that will be stored in MongoDB, the other schemas are used as subdocuments
// Each document created with this schema will represent a different guild
const guildSchema = new mongoose.Schema({
	_id: { type: String, required: true },
	birthdays: { type: [birthdays.schema] },
	events: { type: [events.schema] },
	games: { type: [games.schema] },
	quotes: { type: [quotes.schema] },
	streamers: { type: [streamers.schema] },
});

// Export the schema as a Model to use primarily for constructor
// Since a Collection is created for this Model, we can also used .save, .find, .findById, etc other functions
//	to search the Collection for information in the DB
export default mongoose.model('guilds', guildSchema);
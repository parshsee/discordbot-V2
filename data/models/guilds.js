import mongoose from 'mongoose';
import Birthdays from './birthdays.js';
import Events from './events.js';
import Games from './games.js';
import Quotes from './quotes.js';
import Streamers from './streamers.js';

// Create the guild schema (template)
// Override the auto-generated _id field to pass in our own value
// 	This will be the guild id retrieved from Discord
// Store the birthdays, events, games, quotes, and streamers schema
//	Since they were exported as models, reference their schema with .schema (schema types can't be model)
// This is the only Collection that will be stored in MongoDB, the other schemas are used as subdocuments
// Each document created with this schema will represent a different guild
const guildSchema = new mongoose.Schema({
	_id: { type: String, required: true },
	birthdays: { type: [Birthdays.schema] },
	events: { type: [Events.schema] },
	games: { type: [Games.schema] },
	quotes: { type: [Quotes.schema] },
	streamers: { type: [Streamers.schema] },
});

// Export the schema as a Model to use primarily for constructor
// Since a Collection is created for this Model, we can also used .save, .find, .findById, etc other functions
//	to search the Collection for information in the DB
export default mongoose.model('guilds', guildSchema);
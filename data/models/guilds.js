import mongoose from 'mongoose';
import birthdaysSchema from './birthdays.js';
import eventsSchema from './events.js';
import gamesSchema from './games.js';
import quotesSchema from './quotes.js';
import streamersSchema from './streamers.js';

const guildSchema = new mongoose.Schema({
	_id: { type: String, required: true },
	birthdays: { type: [birthdaysSchema] },
	events: { type: [eventsSchema] },
	games: { type: [gamesSchema] },
	quotes: { type: [quotesSchema] },
	streamers: { type: [streamersSchema] },
});

export default mongoose.model('guilds', guildSchema);
import mongoose from 'mongoose';
import birthdays from './birthdays.js';
import events from './events.js';
import games from './games.js';
import quotes from './quotes.js';
import streamers from './streamers.js';

const guildSchema = new mongoose.Schema({
	_id: { type: String, required: true },
	birthdays: { type: [birthdays.schema] },
	events: { type: [events.schema] },
	games: { type: [games.schema] },
	quotes: { type: [quotes.schema] },
	streamers: { type: [streamers.schema] },
});

export default mongoose.model('guilds', guildSchema);
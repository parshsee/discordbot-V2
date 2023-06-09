import mongoose from 'mongoose';

// Create the streamers schema (template)
// Will store the id, streamer name, game title, and status (offline/online)
// Some required values
// Trim removes whitespaces
// Unique ensures each value for that key is unique
// autoIndex and autoCreate false stop Mongoose from automatically creating a Collection in MongoDB
// 	for the streamers schema
const streamersSchema = mongoose.Schema({
	id: { type: Number, required: true, unique: true },
	streamerName: { type: String, required: true },
	gameTitle: { type: String, trim: true },
	status: { type: String, trim: true },
}, { autoIndex: false, autoCreate: false });

// Export the schema as a Model to use primarily for constructor
// 	This would also create a Collection if the autoIndex and autoCreate were not included
export default mongoose.model('Streamers', streamersSchema);
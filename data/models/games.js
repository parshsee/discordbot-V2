import mongoose from 'mongoose';

// Create the game schema (template)
// Will store the game name, key, type, and code type
// All required values
// Trim removes whitespaces
// Unique ensures each value for that key is unique
// autoIndex and autoCreate false stop Mongoose from automatically creating a Collection in MongoDB
// 	for the game schema
const gamesSchema = mongoose.Schema({
	gameName: { type: String, required: true, trim: true },
	gameKey: { type: String, required: true, trim: true, unique: true },
	gameType: { type: String, required: true, trim: true },
	codeType: { type: String, required: true, trim: true },
}, { autoIndex: false, autoCreate: false });

// Export the schema as a Model to use primarily for constructor
// 	This would also create a Collection if the autoIndex and autoCreate were not included
export default mongoose.model('Games', gamesSchema);
import mongoose from 'mongoose';

const gamesSchema = mongoose.Schema({
	gameName: { type: String, required: true, trim: true },
	gameKey: { type: String, required: true, trim: true, unique: true },
	gameType: { type: String, required: true, trim: true },
	codeType: { type: String, required: true, trim: true },
}, { autoIndex: false, autoCreate: false });

export default mongoose.model('Games', gamesSchema);

// export default gamesSchema;
import mongoose from 'mongoose';

const gamesSchema = mongoose.Schema({
	gameName: { type: String, required: true, trim: true },
	gameKey: { type: String, required: true, trim: true, unique: true },
	gameType: { type: String, required: true, trim: true },
	codeType: { type: String, required: true, trim: true },
});

// export default mongoose.model('Games', gamesSchema);

export default gamesSchema;
import mongoose from 'mongoose';

const streamersSchema = mongoose.Schema({
	id: { type: Number, required: true, unique: true },
	streamerName: { type: String, required: true },
	gameTitle: { type: String, trim: true },
	status: { type: String, trim: true },
});

// export default mongoose.model('Streamers', streamersSchema);

export default streamersSchema;
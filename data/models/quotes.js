import mongoose from 'mongoose';

const quotesSchema = mongoose.Schema({
	id: { type: Number, required: true, unique: true },
	fName: { type: String, required: true, trim: true },
	lName: { type: String, required: true, trim: true },
	quote: { type: String, required: true, trim: true },
	timestamp: { type: Date, required: true, default: Date.now },
}, { autoIndex: false, autoCreate: false });

export default mongoose.model('Quotes', quotesSchema);

// export default quotesSchema;
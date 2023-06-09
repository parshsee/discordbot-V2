import mongoose from 'mongoose';

// Create the quotes schema (template)
// Will store the id, first name, last name, quote, and a timestamp
// All required values
// Trim removes whitespaces
// Unique ensures each value for that key is unique
// Default supplied a default value if none is provided
// autoIndex and autoCreate false stop Mongoose from automatically creating a Collection in MongoDB
// 	for the quotes schema
const quotesSchema = mongoose.Schema({
	id: { type: Number, required: true, unique: true },
	fName: { type: String, required: true, trim: true },
	lName: { type: String, required: true, trim: true },
	quote: { type: String, required: true, trim: true },
	timestamp: { type: Date, required: true, default: Date.now },
}, { autoIndex: false, autoCreate: false });

// Export the schema as a Model to use primarily for constructor
// 	This would also create a Collection if the autoIndex and autoCreate were not included
export default mongoose.model('Quotes', quotesSchema);
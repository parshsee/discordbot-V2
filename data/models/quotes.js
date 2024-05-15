import mongoose from 'mongoose';

// Create the quotes schema (template)
// Will store the id, first name, last name, quote, and a timestamp
// All required values
// Trim removes whitespaces
// Unique ensures each value for that key is unique
// Default supplied a default value if none is provided
// autoIndex and autoCreate false stop Mongoose from automatically creating a Collection in MongoDB
// 	for the quotes schema
// *** userId is String as ID (type of Twitter Snowflake not Number) is too big and gets rounded when storing ***
// https://developer.twitter.com/en/docs/twitter-ids
const quotesSchema = mongoose.Schema({
	id: { type: Number, required: true, unique: true },
	userId: { type: String, required: true, trim: true },
	quote: { type: String, required: true, trim: true },
	timestamp: { type: Date, required: true, default: Date.now },
}, { autoIndex: false, autoCreate: false });

// Export the schema as a Model to use primarily for constructor
// 	This would also create a Collection if the autoIndex and autoCreate were not included
export default mongoose.model('Quotes', quotesSchema);
import mongoose from 'mongoose';

// Create the event schema (template)
// autoIndex and autoCreate false stop Mongoose from automatically creating a Collection in MongoDB
// 	for the event schema
const eventsSchema = mongoose.Schema({
	// TBD
}, { autoIndex: false, autoCreate: false });

// Export the schema as a Model to use primarily for constructor
// 	This would also create a Collection if the autoIndex and autoCreate were not included
export default mongoose.model('Events', eventsSchema);
import mongoose from 'mongoose';

// Create the birthday schema (template)
// Will store first name, last name, and birthdate
// All required values
// Trim removes whitespaces
// autoIndex and autoCreate false stop Mongoose from automatically creating a Collection in MongoDB
// 	for the birthday schema
const birthdaySchema = mongoose.Schema({
	id: { type: Number, required: true, unique: true },
	fName: { type: String, required: true, trim: true },
	lName: { type: String, required: true, trim: true },
	birthday: { type: Date, required: true },
}, { autoIndex: false, autoCreate: false });

// Export the schema as a Model to use primarily for constructor
// 	This would also create a Collection if the autoIndex and autoCreate were not included
export default mongoose.model('Birthdays', birthdaySchema);
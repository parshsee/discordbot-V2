import mongoose from 'mongoose';

const birthdaySchema = mongoose.Schema({
	fName: { type: String, required: true, trim: true },
	lName: { type: String, required: true, trim: true },
	birthday: { type: Date, required: true },
}, { autoIndex: false, autoCreate: false });

export default mongoose.model('Birthdays', birthdaySchema);

// export default birthdaySchema;
import mongoose from 'mongoose';

const eventsSchema = mongoose.Schema({
	// TBD
}, { autoIndex: false, autoCreate: false });

export default mongoose.model('Events', eventsSchema);

// export default eventsSchema;
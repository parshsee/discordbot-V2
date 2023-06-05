import mongoose from 'mongoose';

const dbConnection = async () => {
	try {
		const conn = await mongoose.connect(process.env.MONGO_URI);
		console.log(`Connected to MongoDB: ${conn.connection.name}`);
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
};

export default dbConnection;
import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

const dailyCuteAPI = async (animal) => {
	try {
		// Create API URL
		const animalInfoURL = process.env.ANIMAL_INFO_BASE_URL + animal;
		// Axios call to get information
		// Destructure data into animalInfo const
		const { data: animalInfo } = await axios.get(animalInfoURL);

		// Check if image is from cdn host, if true append .png to the URL
		if (animalInfo.image.includes('/cdn.')) animalInfo.image = animalInfo.image + '.png';

		return animalInfo;
	} catch (error) {
		console.error(error);
		throw { code: 601, msg: 'Could not connect or API threw error' };
	}
};

const memeAPI = async (subreddit) => {
	try {
		// Create API URL
		const memeURL = process.env.MEME_API + subreddit;
		// Axios call to get information
		// Destructure data into memeInfo const
		const { data: memeInfo } = await axios.get(memeURL);

		return memeInfo;
	} catch (error) {
		console.error(error);
		throw { code: 601, msg: 'Could not connect or API threw error' };
	}
};

export {
	dailyCuteAPI,
	memeAPI,
};
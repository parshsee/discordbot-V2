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

/* Note: Technically don't need async or try/catch for this call
	since not making an axios or DB call
*/
const memeCreationAPI = async (image, topText, bottomText) => {
	try {
		// Convert special characters for the top and bottom text
		topText = filterText(topText);
		bottomText = filterText(bottomText);
		// Create API URL
		const memeURL = `${process.env.MEME_CREATION_API}/${topText}/${bottomText}.png?background=${image}`;

		return memeURL;
	} catch (error) {
		console.error(error);
		throw { code: 601, msg: 'Could not connect or API threw error' };
	}
};

// =============================== Helper Functions ===============================

const filterText = (text) => {
	// Use .replaceAll to filter special characters
	const filteredText = text
		.replaceAll('_', '__')
		.replaceAll(' ', '_')
		.replaceAll('?', '~q')
		.replaceAll('%', '~p')
		.replaceAll('#', '~h')
		.replaceAll('/', '~s')
		.replaceAll('"', '\'\'')
		.replaceAll('-', '--');


	return filteredText;
};

export {
	dailyCuteAPI,
	memeAPI,
	memeCreationAPI,
};
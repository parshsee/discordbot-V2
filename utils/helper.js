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

const gameAPI = async (gameName, gameYear) => {

};

/*	Twitch Token has an expiration timer
	This function calls the token validation API, passing in the existing token in the header
	Checks whether the token has expired or not
	https://dev.twitch.tv/docs/authentication/validate-tokens/
*/
const twitchTokenValidator = async () => {
	try {
		// Axios call to check if token is valid
		// Destructure the data into twitchValidator const
		// Pass the current token in headers
		const { data: twitchValidator } = await axios({
			url: process.env.TWITCH_TOKEN_VALIDATION_API,
			method: 'GET',
			headers: {
				Authorization: `OAuth ${process.env.TWITCH_TOKEN}`,
			},
		});

		// Check the response object for expires_in key
		// It represents the seconds left until the token expires
		if (twitchValidator.expires_in > 0) {
			console.log(`Twitch Token Time Remaining: ${twitchValidator.expires_in}`);
		}
	} catch (error) {
		console.log('Call to Twitch Validator API Failed:', error.response.data);
		// If the API call throws, check if it contains a status code and message
		// A status of 401 and appropriate message indicates the token expired
		if (error.response.data.status === 401 && error.response.data.message === 'invalid access token') {
			console.log('Token Expired, Retrieving New Token');
			// If the token is expired, call the function to get new token
			await getTwitchToken();
		}
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

/*	This function retrieves and sets the Twitch Token into the .env file
	https://dev.twitch.tv/docs/authentication/
*/
const getTwitchToken = async () => {
	try {
		// Axios call to get twitch token
		// Destructure data to twitchInfo const
		// Post request to endpoint, with appropriate params
		//	Check Twitch Doc to see exactly what's used
		const { data: twitchInfo } = await axios({
			url: process.env.TWITCH_TOKEN_API,
			method: 'POST',
			params: {
				'client_id': process.env.TWITCH_CLIENT_ID,
				'client_secret': process.env.TWITCH_CLIENT_SECRET,
				'grant_type': 'client_credentials',
			},
		});

		// If the call was successful, log the old token
		console.log(`Old Twitch Token: ${process.env.TWITCH_TOKEN}`);
		// Set the token in the .env file to the newly retrieved token
		process.env.TWITCH_TOKEN = twitchInfo.access_token;
	} catch (error) {
		console.error('Call to Twitch Token API Failed:', error);
	}
};

export {
	dailyCuteAPI,
	memeAPI,
	memeCreationAPI,
	gameAPI,
	twitchTokenValidator,
};
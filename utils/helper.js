import axios from 'axios';
import { ButtonBuilder, ButtonStyle } from 'discord.js';
import * as dotenv from 'dotenv';
dotenv.config();


// =============================== API Functions ===============================

const dailyCuteAPI = async (animal) => {
	try {
		// Create API URL
		const animalInfoURL = process.env.ANIMAL_INFO_BASE_URL + animal;
		// Axios call to get information
		// Destructure data into animalInfo const
		const { data: animalInfo } = await axios.get(animalInfoURL);

		// Check if image is from cdn host, if true append .png to the URL
		if (animalInfo.image.includes('/cdn.')) animalInfo.image = animalInfo.image + '.png';

		console.log('Call to dailyCute API: Successful');

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

		console.log('Call to meme API: Successful');

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

		console.log('Call to memeCreation API: Successful');

		return memeURL;
	} catch (error) {
		console.error(error);
		throw { code: 601, msg: 'Could not connect or API threw error' };
	}
};

const gameAPI = async (gameName, gameYear) => {
	try {
		// Create the initial search query
		// Search for the game name, return info on cover (specifically url), game_modes (specifically name), summary, name of EACH game,
		// Cover.url removes call to game cover endpoint to retrieve url
		// Game_modes.name removes call to game modes endpoint to retrieve each game mode
		// Make sure the cover isn't null (usually indicates game infomration is missing)
		let searchQuery = `search "${gameName}"; fields cover.url, game_modes.name, name, summary; where cover != null`;
		// If given a game year add that to the search query
		// Else close the query
		if (gameYear) {
			searchQuery = searchQuery + ` & release_dates.y = ${gameYear};`;
		} else {
			searchQuery = searchQuery + ';';
		}
		// Axios call to get information
		// Returns array of objects, each object is a game with similar name
		let { data: gameInfo } = await axios({
			url: process.env.GAME_API,
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Client-ID': process.env.TWITCH_CLIENT_ID,
				Authorization: `Bearer ${process.env.TWITCH_TOKEN}`,
			},
			// In the body (data), use the search query provided
			data: searchQuery,
		});

		// Filter out the search results for the one(s) where the name exactly matches the search term
		gameInfo = gameInfo.filter(game => game.name.toLowerCase() === gameName);

		// If the search has no results (empty array)
		// Return error and errorMessage
		if (!gameInfo.length) {
			const returnObj = {
				error: true,
				errorMessage: 'Search Result Failed: Game not in Database',
			};
			console.log('Call to IGDB API: Successful');
			return returnObj;
		}

		// Set the variable to the first object in array
		// Should be most accurate to what the user searched
		gameInfo = gameInfo[0];

		// Go through each mode object in game_modes array
		// Change it to an array of just the mode name (removes id key/value)
		gameInfo.game_modes = gameInfo.game_modes.map(mode => mode.name);

		// Format game cover to proper URL
		gameInfo.cover = `https:${gameInfo.cover.url}`;

		console.log('Call to IGDB API: Successful');

		return gameInfo;

	} catch (error) {
		console.error(error);
		throw { code: 601, msg: 'Could not connect or API threw error' };
	}
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

const twitchUserAPI = async (username) => {
	try {
		// Trim the username to remove whitespaces
		username = username.trim();

		// Axios call to get user info
		// Destructure data to userInfo const
		// Returns object within an object (data.data), contains the users information
		const { data: userInfo } = await axios({
			url: process.env.TWITCH_USER_API,
			method: 'GET',
			headers: {
				Accept: 'application/json',
				Authorization: `Bearer ${process.env.TWITCH_TOKEN}`,
				'Client-ID': process.env.TWITCH_CLIENT_ID,
			},
			params: {
				login: username,
			},
		});

		console.log('Call to Twitch User API: Successful');

		// Return only the user information or an empty array if no users found
		return userInfo.data;

	} catch (error) {
		console.log('Call to Twitch User API Failed:', error);
		throw { code: 601, msg: 'Could not connect or API threw error' };
	}
};

// =============================== Buttons ===============================

// Create confirm button
const confirm = new ButtonBuilder()
	.setCustomId('confirm')
	.setLabel('Confirm')
	.setStyle(ButtonStyle.Primary);

// Create cancel button
const cancel = new ButtonBuilder()
	.setCustomId('cancel')
	.setLabel('Cancel')
	.setStyle(ButtonStyle.Secondary);

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
	twitchUserAPI,
	confirm,
	cancel,
};
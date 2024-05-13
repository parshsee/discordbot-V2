import axios from 'axios';
import { ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import * as dotenv from 'dotenv';
import Guild from '../data/models/guilds.js';
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
		} else {
			console.log(error.response);
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

const twitchStreamAPI = async (users) => {
	try {
		const params = new URLSearchParams();
		for (const user of users) params.append('user_login', user);

		// Axios call to get streamer info
		// Destructure data to streamerInfo const
		// Returns object within an object (data.data), contains the streamers information
		const { data: streamerInfo } = await axios({
			url: process.env.TWITCH_STREAM_API,
			method: 'GET',
			headers: {
				Accept: 'application/json',
				Authorization: `Bearer ${process.env.TWITCH_TOKEN}`,
				'CLIENT-ID': process.env.TWITCH_CLIENT_ID,
			},
			params: params,
		});

		console.log('Call to Twitch Stream API: Successful');

		// Returns only the streamer information or an empty array if no streamers are online
		return streamerInfo.data;

	} catch (error) {
		console.log('Call to Twitch User API Failed:', error);
		return { code: 601, msg: 'Could not connect or API threw error' };
	}
};

// =============================== Data Functions ===============================
const updateCollectionIDs = async (id, guildId, subdocName) => {
	try {
		// Get the guild document
		const guild = await Guild.findById({ _id: guildId });
		// Get the specific subdocument
		let subDocArr = guild[subdocName];

		// Map through the subDoc,
		// finding where the subDoc id is greater than the ID of the doc that was deleted
		// Update those IDs
		// Return the subDoc
		// eslint-disable-next-line no-unused-vars
		subDocArr = subDocArr.map(subDoc => {
			if (subDoc.id > id) {
				subDoc.id = subDoc.id - 1;
			}
			return subDoc;
		});

		// Save the Guild document with changes to subdocument
		await guild.save();

	} catch (error) {
		console.log(error);
	}
};

// =============================== Discord Functions ===============================

const streamChecker = async (client) => {
	try {
		// Get the guilds
		const guilds = await Guild.find({});

		// Loop through each guild
		guilds.forEach(async guild => {
			// Get only the streamer names from the guilds streamer subdoc
			const streamers = guild.streamers.map(streamer => streamer.streamerName);
			if (!streamers.length) {
				console.log(`No Streamers in DB for Guild: ${guild._id}. Skipping Streamer Check...`);
				return;
			}

			// Call the Twitch Streams API with array of streamers
			// Returns array of streamers who are online or empty array if all streamers are offline
			const response = await twitchStreamAPI(streamers);

			// Check if the call was successful or errored out
			if (response.code && response.code === 601) {
				console.log(response.msg);
				return;
			}

			guild.streamers.forEach(streamer => {
				// Find if this streamer is in the array of online streamers from response
				// Returns the streamer object from response or undefined (meaning streamer is offline)
				// If response if empty array, then this will be undefined for every streamer and the if/else below will update the DB subdocument setting every streamer to offline, as intended
				const onlineStreamer = response.find(resStreamer => resStreamer.user_name.toLowerCase() === streamer.streamerName.toLowerCase());

				// If the streamer is online
				if (onlineStreamer) {
					// If the streamer game is differtent from the game title stored in DB (they are playing a different game)
					// Lets us send a message the minute the streamer switches games, also prevents us from sending same message that streamer is live every check
					if (streamer.gameTitle !== onlineStreamer.game_name) {
						// Construct the embedded
						const embed = createIntitialEmbed(client);
						embed.setTitle(`${streamer.streamerName} is live on Twitch!`)
							.setURL(`https://twitch.tv/${streamer.streamerName}`)
							.setDescription(onlineStreamer.game_name);

						// Need to get the Discord Guild object from the client (bot) guild cache (Collection of Guilds bot is in) that corresponds to the Guild Id stored in DB
						const discordGuild = client.guilds.cache.find(dGuild => dGuild.id === guild.id);
						// Use the Discord Guild to get the live-promotions channel for that guild
						const livePromotionsChannel = getGuildLivePromotionsChannel(discordGuild);
						// Send the embed to the channel
						livePromotionsChannel.send({ embeds: [embed] });

						// Update the streamer subdocument information
						streamer.gameTitle = onlineStreamer.game_name;
						streamer.status = 'Live';
					}
				} else {
					// Update the streamer subdocument information
					streamer.gameTitle = '';
					streamer.status = 'Offline';
				}
			});

			// Save the changes made to any streamer subdocument for that guild
			await guild.save();
		});

		return;

	} catch (error) {
		console.log(error);
	}
};

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

// Create the initial embed layout
const createIntitialEmbed = client => {
	const embed = new EmbedBuilder()
		.setColor('#0099ff')
		.setTimestamp()
		.setAuthor({ name: 'Immature Bot', iconURL: client.user.avatarURL(), url: 'https://github.com/parshsee/discordbot-V2' })
		.setFooter({ text: 'Immature Bot' });
	return embed;
};

// Get the member-log channel
// Returns the Channel or undefined
const getGuildMemberLogChannel = guild => {
	return guild.channels.cache.find(channel => channel.name === 'member-log');
};

// Get the freestuff channel
// Returns the Channel or undefined
const getGuildFreestuffChannel = guild => {
	return guild.channels.cache.find(channel => channel.name === 'freestuff');
};

// Get the reminders channel
// Returns the Channel or undefined
const getGuildRemindersChannel = guild => {
	return guild.channels.cache.find(channel => channel.name === 'reminders');
};

// Get the live-promotions channel
// Returns the Channel or undefined
const getGuildLivePromotionsChannel = guild => {
	return guild.channels.cache.find(channel => channel.name === 'live-promotions');
};

// Get the guilds System Channel
// Returns the Channel or null (deleted/disabled/removed from guild)
const getGuildSystemChannel = guild => {
	return guild.systemChannel;
};

// Get a backup channel the bot has permission to send messages to
// Returns the Channel or undefined
const getGuildBackupChannel = guild => {
	// Find another channel to send error message to
	//		- Check that the channel is type 0 --- TextChannel type
	//		- Check that the permissions for the bot (using bots id) for the channel includes SendMessages (check that the bot can send messages to this text channel)
	return guild.channels.cache.find(channel => channel.type === 0 && channel.permissionsFor(guild.client.user.id).any(PermissionFlagsBits.SendMessages));
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
	twitchUserAPI,
	streamChecker,
	updateCollectionIDs,
	confirm,
	cancel,
	createIntitialEmbed,
	getGuildMemberLogChannel,
	getGuildFreestuffChannel,
	getGuildRemindersChannel,
	getGuildLivePromotionsChannel,
	getGuildSystemChannel,
	getGuildBackupChannel,
};
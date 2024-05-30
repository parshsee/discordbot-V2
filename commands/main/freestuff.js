import { SlashCommandBuilder } from 'discord.js';
import Guilds from '../../data/models/guilds.js';
import Games from '../../data/models/games.js';
import * as helper from '../../utils/helper.js';

const exportedMethods = {
	data: new SlashCommandBuilder()
		.setName('freestuff')
		.setDescription('Add/Remove a game from the DB, or show all games')
		.setDMPermission(false)
		.addSubcommand(subcommand =>
			subcommand
				.setName('add')
				.setDescription('Add a game to the DB')
				.addStringOption(option => option.setName('game-name').setDescription('The full name of the game').setRequired(true))
				.addStringOption(option => option.setName('game-key').setDescription('The key to redeem the game').setRequired(true))
				.addStringOption(option =>
					option
						.setName('type')
						.setDescription('The type of game it is')
						.setRequired(true)
						.addChoices(
							{ name: 'Game', value: 'Game' },
							{ name: 'DLC', value: 'DLC' },
							{ name: 'Other', value: 'Other' },
						))
				.addStringOption(option =>
					option
						.setName('platform')
						.setDescription('Where to redeem the game key')
						.setRequired(true)
						.addChoices(
							{ name: 'Steam', value: 'Steam' },
							{ name: 'Microsoft', value: 'Microsoft' },
							{ name: 'GOG', value: 'GOG' },
							{ name: 'Origin', value: 'Origin' },
							{ name: 'Epic', value: 'Epic' },
							{ name: 'Uplay', value: 'Uplay' },
						)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('claim')
				.setDescription('Claim a game from the DB. Game key and info will be sent in DM')
				.addStringOption(option => option.setName('game-name').setDescription('The full name of the game. Must be spelt the exact same as shown in list.').setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('list')
				.setDescription('Shows a list of all games in the DB')),
	async execute(interaction) {
		// Defer the reply to give the DB more than 3 seconds to respond
		// Set it to ephemeral so others wont see game key (means edit response and followup will also be ephemeral)
		await interaction.deferReply({ ephemeral: true });

		if (interaction.options.getSubcommand() === 'add') {
			// Get the game name, key, type, and platform from options
			const gameName = interaction.options.getString('game-name');
			const gameKey = interaction.options.getString('game-key');
			const gameType = interaction.options.getString('type');
			const gamePlatform = interaction.options.getString('platform');

			// Create object for platform specific validation
			let errors = {};
			// Switch-Case for validating key depending on platform
			switch (gamePlatform) {
				case 'Steam':
					errors = validateSteamKey(gameKey);
					break;
				case 'Microsoft':
					errors = validateMicrosoftKey(gameKey);
					break;
				case 'GOG':
					errors = validateGOGKey(gameKey);
					break;
				case 'Origin':
					errors = validateOriginKey(gameKey);
					break;
				case 'Epic':
					errors = validateEpicKey(gameKey);
					break;
				case 'Uplay':
					errors = validateUplayKey(gameKey);
					break;
				default:
					break;
			}

			// Check if any errors in validation
			// Return error message
			if (errors.found) {
				await interaction.editReply({
					content: errors.message,
				});
				return;
			}

			// Get the guild id
			const guildId = interaction.guild.id;
			// Get the guild document from the database
			const guild = await Guilds.findById({ _id: guildId });

			console.log(`Guild DB called for ${interaction.guild.name}: Freestuff - Add`);

			// Create new games document
			const game = new Games({
				gameName: gameName,
				gameKey: gameKey,
				gameType: gameType,
				codeType: gamePlatform,
			});

			// Add the game subdocument to the array of games
			// Save the guild document
			guild.games.push(game);
			await guild.save();

			console.log(`Guild DB saved for ${interaction.guild.name}: Freestuff - Add`);

			// Send response back saying success
			await interaction.editReply({
				content: 'Game Added Successfully',
			});

			return;
		} else if (interaction.options.getSubcommand() === 'claim') {

		} else if (interaction.options.getSubcommand() === 'list') {

		}

		// TODO: Delete
		await interaction.editReply({
			content: 'Boop',
		});
	},
};

// =============================== Freestuff Specific Helper Function ===============================

const steamErrorMessage = 'Steam key not recognized. Make sure it is in the correct format (ex. XXXXX-XXXXX-XXXXX)';
const microsoftErrorMessage = 'Microsoft key not recognized. Make sure it is in the correct format (ex. XXXXX-XXXXX-XXXXX-XXXXX-XXXXX)';
const gogErrorMessage = 'GOG key not recognized. Make sure it is in the correct format (ex. XXXXX-XXXXX-XXXXX-XXXXX or XXXXXXXXXXXXXXXXXX)';
const originErrorMessage = 'Origin key not recognized. Make sure it is in the correct format (ex. XXXX-XXXX-XXXX-XXXX)';
const epicErrorMessage = 'Epic key not recognized. Make sure it is in the correct format (ex. XXXXX-XXXXX-XXXXX-XXXXX)';
const uplayErrorMessage = 'Uplay key not recognized. Make sure it is in the correct format (ex. XXX-XXXX-XXXX-XXXX-XXXX or XXXX-XXXX-XXXX-XXXX)';

const validateSteamKey = (key) => {
	const gameKey = key.split('-');
	const errors = {};

	// If the Key array is less than 3 or greater than 3 (Steam Key should only have 3 after splitting by '-')
	// Return error w/ message
	if (gameKey.length < 3 || gameKey.length > 3) {
		errors.found = true;
		errors.message = steamErrorMessage;
	} else {
		// For every section of the key
		// Check that it's 5 letters long
		// --------Check that ALL the letters aren't numbers------ Small Possibility random steam code has all nunmbers
		// Check that all the letters are uppercase (numbers automatically come back as true, possible error)
		for (const keyPart of gameKey) {
			if (keyPart.length < 5 || keyPart.length > 5) {
				errors.found = true;
				errors.message = steamErrorMessage;
			}
			// if(!isNaN(keyPart)) {
			//     errors.found = true;
			//     errors.message = 'Steam key not recognized. Make sure it is in the correct format';
			// }
			if (!(keyPart === keyPart.toUpperCase())) {
				errors.found = true;
				errors.message = steamErrorMessage;
			}
		}
	}

	return errors;
};

const validateMicrosoftKey = (key) => {
	const gameKey = key.split('-');
	const errors = {};

	// If the Key array is doesn't equal 5 (Microsoft Key should only have 5 after splitting by '-')
	// Return error w/ message
	if (gameKey.length !== 5) {
		errors.found = true;
		errors.message = microsoftErrorMessage;
	} else {
		// For every section of the key
		// Check that it's 5 letters long
		// --------Check that ALL the letters aren't numbers------ Small Possibility random Microsoft code has all nunmbers
		// Check that all the letters are uppercase (numbers automatically come back as true, possible error)
		for (const keyPart of gameKey) {
			if (keyPart.length !== 5) {
				errors.found = true;
				errors.message = microsoftErrorMessage;
			}
			// if(!isNaN(keyPart)) {
			//     errors.found = true;
			//     errors.message = 'Microsoft key not recognized. Make sure it is in the correct format';
			// }
			if (!(keyPart === keyPart.toUpperCase())) {
				errors.found = true;
				errors.message = microsoftErrorMessage;
			}
		}
	}

	return errors;
};

const validateGOGKey = (key) => {
	const gameKey = key.split('-');
	const errors = {};

	// If the array is only 1 long & the first element isn't 18 characters (Discount Codes have 18 characters all together)
	// Return error w/ message
	if (gameKey.length === 1 && gameKey[0].length !== 18) {
		errors.found = true;
		errors.message = gogErrorMessage;
		// Else If the Key array is doesn't equal 4 (GOG Key should only have 4 after splitting by '-') & the first isnt 18 long (Discount Codes)
		// Return error w/ message
	} else if (gameKey.length !== 4 && gameKey[0].length !== 18) {
		errors.found = true;
		errors.message = gogErrorMessage;
	} else if (gameKey.length === 4 && gameKey[0].length !== 18) {
		// For every section of the key
		// Check that it's 5 letters long
		// --------Check that ALL the letters aren't numbers------ Small Possibility random GOG code has all nunmbers
		// Check that all the letters are uppercase (numbers automatically come back as true, possible error)
		for (const keyPart of gameKey) {
			if (keyPart.length !== 5) {
				errors.found = true;
				errors.message = gogErrorMessage;
			}
			// if(!isNaN(keyPart)) {
			//     errors.found = true;
			//     errors.message = 'GOG key not recognized. Make sure it is in the correct format';
			// }
			if (!(keyPart === keyPart.toUpperCase())) {
				errors.found = true;
				errors.message = gogErrorMessage;
			}
		}
	}

	return errors;
};

const validateOriginKey = (key) => {
	const gameKey = key.split('-');
	const errors = {};

	// If the Key array is doesn't equal 4 (Origin Key should only have 4 after splitting by '-')
	// Return error w/ message
	if (gameKey.length !== 4) {
		errors.found = true;
		errors.message = originErrorMessage;
	} else {
		// For every section of the key
		// Check that it's 4 letters long
		// --------Check that ALL the letters aren't numbers------ Small Possibility random Origin code has all nunmbers
		// Check that all the letters are uppercase (numbers automatically come back as true, possible error)
		for (const keyPart of gameKey) {
			if (keyPart.length !== 4) {
				errors.found = true;
				errors.message = originErrorMessage;
			}
			// if(!isNaN(keyPart)) {
			//     errors.found = true;
			//     errors.message = 'Microsoft key not recognized. Make sure it is in the correct format';
			// }
			if (!(keyPart === keyPart.toUpperCase())) {
				errors.found = true;
				errors.message = originErrorMessage;
			}
		}
	}

	return errors;
};

const validateEpicKey = (key) => {
	const gameKey = key.split('-');
	const errors = {};

	// If the Key array is doesn't equal 4 (Epic Key should only have 4 after splitting by '-')
	// Return error w/ message
	if (gameKey.length !== 4) {
		errors.found = true;
		errors.message = epicErrorMessage;
	} else {
		// For every section of the key
		// Check that it's 5 letters long
		// --------Check that ALL the letters aren't numbers------ Small Possibility random Epic code has all nunmbers
		// Check that all the letters are uppercase (numbers automatically come back as true, possible error)
		for (const keyPart of gameKey) {
			if (keyPart.length !== 5) {
				errors.found = true;
				errors.message = epicErrorMessage;
			}
			// if(!isNaN(keyPart)) {
			//     errors.found = true;
			//     errors.message = 'Epic key not recognized. Make sure it is in the correct format';
			// }
			if (!(keyPart === keyPart.toUpperCase())) {
				errors.found = true;
				errors.message = epicErrorMessage;
			}
		}
	}

	return errors;
};

const validateUplayKey = (key) => {
	const gameKey = key.split('-');
	const errors = {};

	if (gameKey[0].length === 4) {
		// If the Key array is doesn't equal 4 (Uplay Key should only have 4 after splitting by '-')
		// Return error w/ message
		if (gameKey.length !== 4) {
			errors.found = true;
			errors.message = uplayErrorMessage;
		} else {
			// For every section of the key
			// Check that it's 5 letters long
			// --------Check that ALL the letters aren't numbers------ Small Possibility random Uplay code has all nunmbers
			// Check that all the letters are uppercase (numbers automatically come back as true, possible error)
			for (const keyPart of gameKey) {
				if (keyPart.length !== 4) {
					errors.found = true;
					errors.message = uplayErrorMessage;
				}
				// if(!isNaN(keyPart)) {
				//     errors.found = true;
				//     errors.message = 'Epic key not recognized. Make sure it is in the correct format';
				// }
				if (!(keyPart === keyPart.toUpperCase())) {
					errors.found = true;
					errors.message = uplayErrorMessage;
				}
			}
		}
	} else if (gameKey[0].length === 3) {
		// If the Key array is doesn't equal 5 (Alternate Uplay Key should only have 5 after splitting by '-')
		// Return error w/ message
		if (gameKey.length !== 5) {
			errors.found = true;
			errors.message = uplayErrorMessage;
		} else {
			// Remove the first element because it has 3 characters
			gameKey.shift();
			// For every section of the key
			// Check that it's 5 letters long
			// --------Check that ALL the letters aren't numbers------ Small Possibility random Uplay code has all nunmbers
			// Check that all the letters are uppercase (numbers automatically come back as true, possible error)
			for (const keyPart of gameKey) {
				if (keyPart.length !== 4) {
					errors.found = true;
					errors.message = uplayErrorMessage;
				}
				// if(!isNaN(keyPart)) {
				//     errors.found = true;
				//     errors.message = 'Epic key not recognized. Make sure it is in the correct format';
				// }
				if (!(keyPart === keyPart.toUpperCase())) {
					errors.found = true;
					errors.message = uplayErrorMessage;
				}
			}
		}
	} else {
		errors.found = true;
		errors.message = uplayErrorMessage;
	}

	return errors;
};

export default exportedMethods;
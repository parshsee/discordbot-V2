import { SlashCommandBuilder } from 'discord.js';
import Guilds from '../../data/models/guilds.js';
import Birthdays from '../../data/models/birthdays.js';
import * as helper from '../../utils/helper.js';

const exportedMethods = {
	data: new SlashCommandBuilder()
		.setName('bdays')
		.setDescription('Add/Remove a birthday from the DB, show all birthdays')
		.setDMPermission(false)
		.addSubcommand(subcommand =>
			subcommand
				.setName('add')
				.setDescription('Add a birthday to the DB')
				.addStringOption(option => option.setName('user-birthday').setDescription('The first name, last name, and birthday (mm/dd/yyyy) of the user. Ex: John Doe 1/1/1970').setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('remove')
				.setDescription('Remove a birthday (by its ID) from the DB')
				.addStringOption(option => option.setName('name').setDescription('The first and last name of the user in the DB. Ex: John Doe').setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('list')
				.setDescription('Shows a list of all birthdays in the DB')),
	async execute(interaction) {
		// Defer the reply to give the DB more than 3 seconds to respond
		await interaction.deferReply();

		if (interaction.options.getSubcommand() === 'add') {
			// Get the string with full name and birthday
			const userInput = interaction.options.getString('user-birthday');
			const userInputArr = userInput.split(' ');

			// Check if the user gave the correct amount of arguments
			if (userInputArr.length !== 3) {
				await interaction.editReply({
					content: 'Error: Command needs a First Name, Last Name, and Birthday. Ex: John Doe 1/1/1970',
					ephemeral: true,
				});
				return;
			}

			try {
				// Gets the first & last names (capitalizing the first letter in each)
				// Gets the birthday
				// Gets each part of the birthday in an array (month, day, year)
				const userFirstName = userInputArr[0].charAt(0).toUpperCase() + userInputArr[0].slice(1);
				const userLastName = userInputArr[1].charAt(0).toUpperCase() + userInputArr[1].slice(1);
				const userBirthdate = userInputArr[2];
				const birthdateArray = userBirthdate.split('/');

				const birthdate = validateBirthdate(userBirthdate, birthdateArray);

				// Get the guild id
				const guildId = interaction.guild.id;
				// Get the guild document from the database
				const guild = await Guilds.findById({ _id: guildId });

				// Check if fName and lName already exist within guilds birthdays subdoc
				// SHOULD NOT BE ABLE TO ADD SAME USER MULTIPLE TIMES
				if (guild.birthdays.find(birthday => birthday.fName === userFirstName && birthday.lName === userLastName)) {
					await interaction.editReply({
						content: 'Error: A person with that name already exists in DB.',
						ephemeral: true,
					});
					return;
				}

				console.log(`Guild DB called for ${interaction.guild.name}: Bdays - Add`);

				const birthday = new Birthdays({
					fName: userFirstName,
					lName: userLastName,
					birthday: birthdate,
				});

				// Add the birthday subdocument to the array of birthdays
				// Save the guild document
				guild.birthdays.push(birthday);
				await guild.save();

				console.log(`Guild DB saved for ${interaction.guild.name}: Bdays - Add`);

				// Send response back saying success
				await interaction.editReply({
					content: 'Birthday Added Successfully',
				});

				return;

			} catch (error) {
				console.log(error);
				if (error.code && error.code === 601) {
					await interaction.editReply({
						content: error.msg,
					});
				}

				return;
			}
		} else if (interaction.options.getSubcommand() === 'remove') {
			// Get the string with full name
			const userInput = interaction.options.getString('name');
			const userInputArr = userInput.split(' ');

			// Check if the user gave the correct amount of arguments
			if (userInputArr.length !== 2) {
				await interaction.editReply({
					content: 'Error: Command needs a First Name and Last Name. Ex: John Doe',
					ephemeral: true,
				});
				return;
			}

			try {
				// Gets the first & last names (capitalizing the first letter in each)
				const userFirstName = userInputArr[0].charAt(0).toUpperCase() + userInputArr[0].slice(1);
				const userLastName = userInputArr[1].charAt(0).toUpperCase() + userInputArr[1].slice(1);
				// Get the guild id
				const guildId = interaction.guild.id;

				// Call the .findOneAndUpdate() function from Mongoose Models to remove the birthday object from database (if it exists)
				// Takes 3 params, the search query (filter), the actual operation (update), optional parameters (options)
				// Search Query: Find where the guild id matches the _id
				// Operation: Pull (remove) the birthday subdoc from that array where the fName and lName match the given first/last names
				// Optional Params:
				//	- Projection: return the specific values listed (0 for no 1 for yes), where the elements that match ($elemMatch) the id are in the birthday array
				//	- returnDocument: Return the document (normally the entire Guild doc if projection is not specified) before the operation is done
				// || [] - Short-Circuit Operation to ensure that if can't destructure 'birthdays' array from DB operation then try from an empty array (will result in undefined instead of an error)
				const { birthdays } = await Guilds.findOneAndUpdate(
					{ _id: guildId },
					{
						$pull: {
							birthdays: {
								fName: userFirstName,
								lName: userLastName,
							},
						},
					},
					{
						projection: {
							_id: 0, birthdays: {
								$elemMatch: {
									fName: userFirstName,
									lName: userLastName,
								},
							},
						},
						returnDocument: 'before',
					}) || [];

				console.log(`Guild DB called for ${interaction.guild.name}: Bdays - Remove`);

				// Check if the birthdays arr is undefined (no changes made in DB)
				if (!birthdays.length) {
					await interaction.editReply({
						content: 'Error: Could not remove birthday. Please make sure ID exists within the list of birthdays',
						ephemeral: true,
					});
					return;
				}

				// Send message saying the remove operation was a success
				await interaction.editReply({
					content: 'Birthday has been removed from the database',
				});

				return;
			} catch (error) {
				console.log(error);
			}

		} else if (interaction.options.getSubcommand() === 'list') {
			// Get the guild id
			const guildId = interaction.guild.id;

			try {
				// Destructure the birthdays subdoc array from the guild doc in DB
				const { birthdays } = await Guilds.findById({ _id: guildId });

				console.log(`Guild DB called for ${interaction.guild.name}: Bdays - List`);

				// Check that the birthdays array is empty (no birthdays in DB)
				if (!birthdays.length) {
					await interaction.editReply({
						content: 'No birthdays exist in database!',
					});
					return;
				}

				// Get current date
				const currentDate = new Date();
				currentDate.setHours(0, 0, 0, 0);
				// Initalize arrays for dates before and after current day
				let afterCurrDate = [];
				let beforeCurrDate = [];

				birthdays.forEach(birthday => {
					// Check if the month is ahead
					if (birthday.birthday.getMonth() + 1 > currentDate.getMonth() + 1) {
						// Add to array of dates AFTER current day
						afterCurrDate.push({
							bday: birthday.birthday,
							fullName: `${birthday.fName} ${birthday.lName}`,
						});
						// If the month is the same, check if the date is ahead
					} else if (birthday.birthday.getMonth() + 1 === currentDate.getMonth() + 1 && birthday.birthday.getDate() > currentDate.getDate()) {
						// Add to array of dates AFTER current day
						afterCurrDate.push({
							bday: birthday.birthday,
							fullName: `${birthday.fName} ${birthday.lName}`,
						});
						// Else the month/day is in the past
					} else {
						// Add to array of dates BEFORE current day
						beforeCurrDate.push({
							bday: birthday.birthday,
							fullName: `${birthday.fName} ${birthday.lName}`,
						});
					}
				});

				// Get the sorted arrays
				afterCurrDate = sortArr(afterCurrDate, currentDate);
				// Get the sorted arrays
				beforeCurrDate = sortArr(beforeCurrDate, currentDate);
				// Combine both arrays
				const sortedDates = afterCurrDate.concat(beforeCurrDate);

				return createAndSendEmbed(sortedDates, interaction);
			} catch (error) {
				console.log(error);
			}
		}

		return;
	},
};

// =============================== Bdays Specific Helper Function ===============================

const validateBirthdate = (userBirthdate, birthdateArray) => {
	// Check if date is an actual date  || If there are only three elements in array
	// Only checks 01/01/1970 to future || (month, day, year)
	if (!Date.parse(userBirthdate) || birthdateArray.length !== 3) {
		throw { code: 601, msg: 'Error: Birthday not recognized. Make sure it is a valid date in the correct format (mm/dd/yyyy)' };
	}

	// Convert the users date to the correct format
	// Set the hours, minutes, seconds, milliseconds to 0
	// (UTC time is 4 hours ahead of EST so it saves as +4 hours)
	const date = new Date(birthdateArray[2], birthdateArray[0] - 1, birthdateArray[1]);
	date.setHours(0, 0, 0, 0);

	// Get the current date
	// Set the hours, minutes, seconds, milliseconds to 0
	const currentDate = new Date();
	currentDate.setHours(0, 0, 0, 0);

	// Check if the users date is ahead of the current date
	// i.e Person not born yet
	if (date > currentDate) {
		throw { code: 601, msg: 'Error: Birthday not recognized. Please enter a valid date.' };
	}

	return date;
};

const sortArr = (arr, currentDate) => {
	// Get the current month
	const currMonth = currentDate.getMonth() + 1;

	// Sort the array using sort method
	// Returning -1 to sort, sorts a to an index lower than b (i.e. a comes first)
	// Returning 0 to sort, leave a and b unchanged with respect to each other, but sorted with respect to all different elements
	// Returning 1 to sort, sorts b to an index lower than a (i.e. b comes first)
	arr.sort((a, b) => {
		// Get the birthday month and day of the SECOND value (idk why is does second value as a)
		const bdayMonth = a.bday.getMonth() + 1;
		const bdayDay = a.bday.getDate();

		// Get the birthday month and day of the FIRST value
		const bdayMonth2 = b.bday.getMonth() + 1;
		const bdayDay2 = b.bday.getDate();

		// If the second month is less than the first month swap them
		if (bdayMonth - currMonth < bdayMonth2 - currMonth) {
			return -1;
		} else if (bdayMonth - currMonth === bdayMonth2 - currMonth && bdayDay < bdayDay2) {
			return -1;
		}
	});
	return arr;
};

/*
  Take a string and the interaction and sends 'x'  amount of messages to the channel depending
  on the length of the text.
  Async Function to allow for loop to create a message, send the message, then create another
  if the text was long enough to be broken into multiple arrays and send that
  ([a]wait for embed to be made before sending it)
  Taken from freestuff code
*/
const createAndSendEmbed = async (sortedBirthdates, interaction) => {
	// Call the helper function to create the initial embed
	let embed = helper.createIntitialEmbed(interaction.client);
	// The limit of how many birthdays can be in an embed
	// Only have 25 fields, each column is a different field
	// Need to set the Name and Birthday column field (so 2)
	// Must have 3 columns in an inline embed, so third column is set to blank (\u200b)
	// 8 * 3 = 24, Only 8 birthdays can be in an embed at a time
	let limit = 8;
	// Create an array to hold all the embeds
	const embedArr = [];
	// Loop through the array getting the birthday object and index
	sortedBirthdates.forEach((birthday, index) => {
		// If the index = the limit
		if (index === limit) {
			// Set the initial title for first embed and the titles for the others
			embed.setTitle(index === 8 ? ':birthday: All Birthdays :birthday:' : ':birthday: All Birthdays Cont. :birthday:');
			// Increase the limit
			limit += 8;
			// Add the embed to the array of embeds
			embedArr.push(embed);
			// Clear all fields from the embed
			// Allows me to add another 25 fields
			embed = helper.createIntitialEmbed(interaction.client);
		}

		if (index % 8 === 0) {
			embed.addFields({ name: 'Name', value: `${birthday.fullName}`, inline: true });
			embed.addFields({ name: 'Birthday', value: `${birthday.bday.toLocaleDateString()}`, inline: true });
			embed.addFields({ name: '\u200b', value: '\u200b', inline: true });
			// Else not the first row, titles can be blank
		} else {
			embed.addFields({ name: '\u200b', value: `${birthday.fullName}`, inline: true });
			embed.addFields({ name: '\u200b', value: `${birthday.bday.toLocaleDateString()}`, inline: true });
			embed.addFields({ name: '\u200b', value: '\u200b', inline: true });
		}
	});
	// Add the remaining embed after it exits for loop
	// Ensures that the last birthdays are added
	// I.e if 28 birthdays in db, 24 will get added with code above, last 4 will get added with this
	embed.setTitle(':birthday: All Birthdays Cont. :birthday:');
	embedArr.push(embed);

	// Create the chunksize, this is the amount of embeds that can be sent in one interaction (10)
	const chunkSize = 10;
	// Loop through the array of embeds, sending messages for every 10 embeds
	for (let index = 0; index < embedArr.length; index += chunkSize) {
		// Slice (create shallow copy of portion of array) the embed array to get 10 embeds
		// Will be from (0, 9), (10, 19), etc depending on amount of embeds created
		const chunk = embedArr.slice(index, index + chunkSize);

		// Send a followUp interaction with the embed chunk
		await interaction.followUp({
			embeds: chunk,
		});
	}

	return;
};

export default exportedMethods;
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
				.addIntegerOption(option => option.setName('id').setDescription('The ID of the birthday in the DB. Use the list command to see all birthdays and IDs').setRequired(true).setMinValue(1)))
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

				console.log(`Guild DB called for ${interaction.guild.name}: Bdays - Add`);

				// Create the ID number for the new subdocument
				// based on amount of quotes (subdocs) already in array
				const idNumber = guild.birthdays.length + 1;

				const birthday = new Birthdays({
					id: idNumber,
					fName: userFirstName,
					lName: userLastName,
					birthday: birthdate,
				});

				// Add the quote subdocument to the array of quotes
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
			// Get the id from options
			const id = interaction.options.getInteger('id');
			// Get the guild id
			const guildId = interaction.guild.id;

			try {
				// Call the .findOneAndUpdate() function from Mongoose Models to remove the birthday object from database (if it exists)
				// Takes 3 params, the search query, the actual operation, optional parameters
				// Search Query: Find where the guild id matches the _id AND birthday subdoc id equals the id given
				// Operation: Pull (remove) the birthday subdoc from that array where the birthday id matches the id given
				// Optional Params:
				//	- Projection: return the specific values listed (0 for no 1 for yes), where the elements that match ($elemMatch) the id are in the birthday array
				//	- returnDocument: Return the document (normally the entire Guild doc if projection is not specified) before the operation is done
				// || [] - Short-Circuit Operation to ensure that if can't destructure 'birthdays' array from DB operation then try from an empty array (will result in undefined instead of an error)
				const { birthdays } = await Guilds.findOneAndUpdate(
					{
						$and: [
							{ _id: guildId },
							{ 'birthdays.id': id },
						],
					},
					{ $pull: { birthdays: { id: id } } },
					{
						projection: { _id: 0, birthdays: { $elemMatch: { id: id } } },
						returnDocument: 'before',
					}) || [];

				console.log(`Guild DB called for ${interaction.guild.name}: Bdays - Remove`);

				// Check if the birthdays arr is undefined (no changes made in DB)
				if (!birthdays) {
					await interaction.editReply({
						content: 'Error: Could not remove birthday. Please make sure ID exists within the list of birthdays',
						ephemeral: true,
					});
					return;
				}

				// Update other Ids in birthday arr subdocs
				await helper.updateCollectionIDs(id, guildId, 'birthdays');

				// Send message saying the remove operation was a success
				await interaction.editReply({
					content: 'Birthday has been removed from the database',
				});

				return;
			} catch (error) {
				console.log(error);
			}

		} else if (interaction.options.getSubcommand() === 'list') {

		}

		// TODO: Delete
		await interaction.editReply({
			content: 'Boop',
		});

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

export default exportedMethods;
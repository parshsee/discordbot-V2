import { SlashCommandBuilder } from "discord.js";
import Guilds from "../../data/models/guilds";
import Birthdays from "../../data/models/birthdays";
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

		} else if (interaction.options.getSubcommand() === 'remove') {

		} else if (interaction.options.getSubcommand() === 'list') {

		}

		// TODO: Delete
		await interaction.editReply({
			content: 'Boop',
		});

		return;
	}
};

export default exportedMethods;
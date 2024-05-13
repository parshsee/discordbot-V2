import { SlashCommandBuilder } from 'discord.js';
import Guilds from '../../data/models/guilds.js';
import Quotes from '../../data/models/quotes.js';
import * as helper from '../../utils/helper.js';

const exportedMethods = {
	data: new SlashCommandBuilder()
		.setName('quotes')
		.setDescription('Add/Remove a quote from the DB, show all quotes, get a specific quote, or get a random quote')
		.setDMPermission(false)
		.addSubcommand(subcommand =>
			subcommand
				.setName('add')
				.setDescription('Add quote to the DB')
				.addStringOption(option => option.setName('quote').setDescription('The phrase or sentence you want to save').setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('remove')
				.setDescription('Remove a quote (by its ID) from the DB')
				.addIntegerOption(option => option.setName('id').setDescription('The ID of the quote in the DB. Use the list command to see all quotes and IDs').setRequired(true).setMinValue(0)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('list')
				.setDescription('Shows a list of all quotes in the DB')
				.addStringOption(option =>
					option
						.setName('choices')
						.setDescription('Show all quotes/Show all quotes by a single person/Show one quote by ID/Show one quote at random')
						.setRequired(true)
						.addChoices(
							{ name: 'Show All', value: 'list_all' },
							{ name: 'Show All by Name', value: 'list_name' },
							{ name: 'Show One by ID', value: 'list_id' },
							{ name: 'Show One by Random ', value: 'list_random' },
						))),
	async execute(interaction) {
		// Defer the reply to give the DB more than 3 seconds to respond
		await interaction.deferReply();

		if (interaction.options.getSubcommand() === 'add') {

		} else if (interaction.options.getSubcommand === 'remove') {

		} else if (interaction.options.getSubcommand === 'list') {

		}

		await interaction.editReply({ content: 'Boop' });
	},
};

export default exportedMethods;
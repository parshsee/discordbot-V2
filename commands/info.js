import { SlashCommandBuilder } from 'discord.js';

const exportedMethods = {
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription('Gte info about a user or the server')
		.addSubcommand(subcommand =>
			subcommand
				.setName('user')
				.setDescription('Info about a user')
				.addUserOption(option => option.setName('target').setDescription('The user')))
		.addSubcommand(subcommand =>
			subcommand
				.setName('server')
				.setDescription('Info about the server')),
	async execute() {
		const fart = '';
		console.log(fart);
	},
};

export default exportedMethods;
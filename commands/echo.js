import { SlashCommandBuilder } from 'discord.js';

const exportedMethods = {
	data: new SlashCommandBuilder()
		.setName('echo')
		.setDescription('Replies with your input')
		.addStringOption(option =>
			option.setName('input')
				.setDescription('The input to echo back')
				.setRequired(true))
		.addChannelOption(option => option.setName('channel').setDescription('The chanel to echo into')),
	async execute(interaction) {
		await interaction.reply('Pickle!');
	},
};

export default exportedMethods;
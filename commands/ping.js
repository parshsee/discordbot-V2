import { SlashCommandBuilder } from 'discord.js';

const exportedMethods = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		await interaction.reply('Pong');
	},
};

export default exportedMethods;
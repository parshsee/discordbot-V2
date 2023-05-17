import { SlashCommandBuilder, ChannelType } from 'discord.js';

const exportedMethods = {
	data: new SlashCommandBuilder()
		.setName('echo')
		.setDescription('Replies with your input')
		.addStringOption(option =>
			option.setName('input')
				.setDescription('The input to echo back')
				.setRequired(true)
				.setMaxLength(2000))
		.addChannelOption(option =>
			option.setName('channel')
				.setDescription('The chanel to echo into')
				.addChannelTypes(ChannelType.GuildText))
		.addBooleanOption(option =>
			option.setName('embed')
				.setDescription('Whether or not the echo should be embedded'))
		.addStringOption(option =>
			option.setName('category')
				.setDescription('The gif category')
				.setRequired(true)
				.addChoices(
					{ name: 'Funny', value: 'gif_funny' },
					{ name: 'Meme', value: 'gif_meme' },
					{ name: 'Movie', value: 'gif_movie' },
				)),
	async execute(interaction) {
		await interaction.reply('Pickle!');
	},
};

export default exportedMethods;
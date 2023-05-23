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
		.addStringOption(option =>
			option.setName('category')
				.setDescription('The gif category')
				.setRequired(true)
				.addChoices(
					{ name: 'Funny', value: 'gif_funny' },
					{ name: 'Meme', value: 'gif_meme' },
					{ name: 'Movie', value: 'gif_movie' },
				))
		.addChannelOption(option =>
			option.setName('channel')
				.setDescription('The chanel to echo into')
				.addChannelTypes(ChannelType.GuildText))
		.addBooleanOption(option =>
			option.setName('embed')
				.setDescription('Whether or not the echo should be embedded')),
	async execute(interaction) {
		// Get the value from a string option
		const input = interaction.options.getString('input');
		// Get the value from a channel option
		const channel = interaction.options.getChannel('channel');
		// Get the value from a choice option, still use getString() but it will be one of the three values specified above
		const category = interaction.options.getString('category');
		await interaction.reply(`You said: ${input} --- ${channel} --- ${category}`);
	},
};

export default exportedMethods;
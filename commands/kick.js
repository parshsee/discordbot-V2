import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

const exportedMethods = {
	data: new SlashCommandBuilder()
		.setName('kick')
		.setDescription('Select a member and kick them')
		.addUserOption(option =>
			option
				.setName('target')
				.setDescription('The member to kick')
				.setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
		.setDMPermission(false),
	async execute(interaction) {
		// Get the user value using the name of the option provided
		const target = interaction.options.getUser('target');

		await interaction.reply(`Kicking ${target.username}`);
		await interaction.guild.members.kick(target);
	},
};

export default exportedMethods;
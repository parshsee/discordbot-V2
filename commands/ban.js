import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

const exportedMethods = {
	data: new SlashCommandBuilder()
		.setName('ban')
		.setDescription('Select a member and ban them.')
		.addUserOption(option =>
			option
				.setName('target')
				.setDescription('The member to ban')
				.setRequired(true))
		.addStringOption(option =>
			option
				.setName('reason')
				.setDescription('The reason for banning'))
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
		.setDMPermission(false),
	async execute(interaction) {
		// Get the user value using the name of the option provided
		const target = interaction.options.getUser('target');
		// Get the string 'reason' value using the name of  the option provided
		// Since it's not required, have nullish coalescing operator to provide a value if it's not given
		const reason = interaction.options.getString('reason') ?? 'No reason provided';

		await interaction.reply(`Banning ${target.username} for reason: ${reason}`);
		await interaction.guild.members.ban(target);
	},
};

export default exportedMethods;
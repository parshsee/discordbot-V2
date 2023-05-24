import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

const exportedMethods = {
	data: new SlashCommandBuilder()
		.setName('stats')
		.setDescription('Displays information on the server or on a specific user')
		.setDMPermission(false)
		.addSubcommand(subcommand =>
			subcommand
				.setName('user')
				.setDescription('Info about a user')
				.addUserOption(option => option.setName('target').setDescription('The user')))
		.addSubcommand(subcommand =>
			subcommand
				.setName('server')
				.setDescription('Info about the server')),
	async execute(interaction) {
		// Create the initial embed layout
		const embed = new EmbedBuilder()
			.setColor('#0099ff')
			.setTimestamp()
			.setAuthor({ name: 'Immature Bot', iconURL: interaction.client.user.avatarURL(), url: 'https://github.com/parshsee/discordbot-V2' })
			.setFooter({ text: 'Immature Bot' });


		if (interaction.options.getSubcommand() === 'user') {
			// Use the .getMember option to fetch information about the target related to the guild: Returns a GuildMember
			// If the user hits enter without selecting a target, use the own users GuildMember info
			// .getUser would just get information about their account
			const member = interaction.options.getMember('target') ?? interaction.member;

			// Create the presence message
			let presence = '';
			// Check if the member presence is not null
			// If true, get the status from the PresenceManager and create the appropriate message
			// If false, create a static offline message
			// Note: If user is set to appear 'offline' then presence will not be null, status will be offline
			//		 If the user is actually offline, the presence will be null
			if (member.presence) {
				if (member.presence.status === 'online') {
					presence = `:green_circle: ${member.presence.status}`;
				} else if (member.presence.status === 'idle') {
					presence = `:orange_circle: ${member.presence.status}`;
				} else if (member.presence.status === 'dnd') {
					presence = `:o: ${member.presence.status}`;
				} else if (member.presence.status === 'offline') {
					presence = ':red_circle: offline';
				}
			} else {
				presence = ':red_circle: offline';
			}

			// Set the member related information in the embed
			embed
				.setTitle(member.nickname ?? member.user.username)
				.setDescription(`${member.roles.cache.map(role => role.toString()).join(' ')}`)
				.setThumbnail(member.user.avatarURL())
				.addFields(
					{ name: 'Created On', value: member.user.createdAt.toString() },
					{ name: 'Joined On', value: member.joinedAt.toString() },
					{ name: 'Tag', value: member.user.tag },
					{ name: 'ID', value: member.user.id },
					{ name: 'Presence', value: presence },
				);

			// Send the embed
			await interaction.reply({
				embeds: [embed],
			});
		} else if (interaction.options.getSubcommand() === 'server') {
			// Get the Guild class from the interaction
			const guild = interaction.member.guild;

			// Set the guild related information in the embed
			embed
				.setTitle(guild.name)
				.setDescription(`${guild.roles.cache.map(role => role.toString()).join(' ')}`)
				.setThumbnail(guild.iconURL())
				.addFields(
					{ name: 'Total Members', value: guild.memberCount.toString() },
					{ name: 'Total Real Members', value: guild.members.cache.filter(member => !member.user.bot).size.toString() },
					{ name: 'Total Bots', value: guild.members.cache.filter(member => member.user.bot).size.toString() },
					{ name: 'Toal Channels', value: guild.channels.cache.size.toString() },
					{ name: 'Total Categories', value: guild.channels.cache.filter(ch => ch.type === 4).size.toString() },
					{ name: 'Total Text Channels', value: guild.channels.cache.filter(ch => ch.type === 0).size.toString() },
					{ name: 'Total Voice Channels', value: guild.channels.cache.filter(ch => ch.type === 2).size.toString() },
				);

			// Send the embed
			await interaction.reply({
				embeds: [embed],
			});
		}
	},
};

export default exportedMethods;
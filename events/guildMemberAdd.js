import { EmbedBuilder, Events } from 'discord.js';

const exportedMethods = {
	name: Events.GuildMemberAdd,
	async execute(guildMember) {
		const guild = guildMember.guild;

		// Check if the guild is available to send message to
		if (!guild.available) {
			console.log('Error: Guild not available for member logging (add)');
			return;
		}

		// Check that the member log channel exists within guild
		// Will return the channel info or undefined
		const memberLogChannel = guild.channels.cache.find(channel => channel.name === 'member-log');

		// If there is no member-log channel
		if (!memberLogChannel) {
			// Log that the guild doesn't have a member-log channel
			console.log(`Error: ${guild.name} Guild does not have member-log channel for logging (add)`);

			// TODO:
			// Send message to default(original/ first) channel saying action couldn't be performed ???
			// Have command / create - required - channels that will check and create any needed channels if they don't exist ???
			// Make it admin / moderator level only ???

			// Exit out of function
			return;
		}

		// Create and send an embed that the user has joined
		const embed = new EmbedBuilder()
			.setFooter({
				text: `${guildMember.user.tag} has joined`,
				iconURL: guildMember.user.displayAvatarURL(),
			});


		console.log(`${guildMember.user.tag} has joined ${guild.name}`);

		// Send the embed in the member-log channel
		memberLogChannel.send({ embeds: [embed] });

	},
};

export default exportedMethods;
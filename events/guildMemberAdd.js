import { Events } from 'discord.js';

const exportedMethods = {
	name: Events.GuildMemberAdd,
	async execute(client) {
		console.log(client);

		/* TODO:
			Check that the 'member-log' channel exists in the guild
			If it does
				get that channels id
				Create an embed that the user has joined
				Send the embed to that channel
			If it doesn't
				Log that channel doesn't exist
				Send message to default(original/first) channel saying action couldn't be performed ???
				Have command /create-required-channels that will check and create any needed channels if they don't exist ???
					Make it admin/moderator level only ???
		*/
	},
};

export default exportedMethods;
import { Events } from 'discord.js';
import Guild from '../data/models/guilds.js';

// When client (bot) leaves a guild, is kicked, or guild is deleted
// Delete the DB collection for the guild
const exportedMethods = {
	name: Events.GuildDelete,
	async execute(guild) {
		const id = guild.id;

		// Check MongoDB if guild already exists with ID
		// .exists() returns either the document if it matches or null
		const guildExists = await Guild.exists({ _id: id });
		if (!guildExists) {
			console.log(`Guild ${guild.name} doesn't exist in DB`);
			return;
		}

		// Remove the guild document from the collection
		await Guild.findByIdAndDelete({ _id: id });
		console.log(`Guild ${guild.name} removed from DB`);
	},
};

export default exportedMethods;
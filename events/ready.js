import { Events, ActivityType } from 'discord.js';

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
const exportedMethods = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		client.user.setUsername('ImmatureBot V2');
		client.user.setActivity('you', { type: ActivityType.Watching });

		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};

export default exportedMethods;
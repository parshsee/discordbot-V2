import { Events, ActivityType } from 'discord.js';
import { scheduleJob } from 'node-schedule';
import * as helper from '../utils/helper.js';
import dbConnection from '../data/mongooseConnection.js';

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
const exportedMethods = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		client.user.setUsername('ImmatureBot V2');
		client.user.setActivity('you', { type: ActivityType.Watching });

		// Connect to database
		await dbConnection();

		// Use node-scheduler to create a cron-job that runs every minute
		// Calls the twitch token validator, to check that the token is not expired (if it is, it will retrieve a new token as well)
		scheduleJob('*/1 * * * *', async () => helper.twitchTokenValidator());
		console.log('Twitch Token Checker	:	Created');
		// Calls the streamer db, to check if any streamer is active (if it is, it will send a message to the corresponding guild 'live-promotions' channel)
		scheduleJob('*/1 * * * *', async () => helper.streamChecker(client));
		console.log('Streamer Checker	:	Created');
		// TODO: Set to run once a day instead of every minute
		// Calls the Discord ScheduledEvents, to check if any events are upcoming (if it is, it will send a message to the corresponding guild 'reminder' channel)
		scheduleJob('*/1 * * * *', async () => helper.eventsChcker(client));
		console.log('Events Checker		:	Created');
		// Calls the birthday db, to check if any birthday is active (if it is, it will send a message to the corresponding guild 'general' channel)
		// 1000 = 1 sec, 10000 = 10 sec, 60000 = 1 minute, 3600000 = 1 hour, 86400000 = 24 hours
		// Sets an interval of milliseconds, to run the birthdayChecker code
		// ScheduleJob uses cron format to run everyday (0-6), at 12:00:00
		scheduleJob('00 00 12 * * 0-6', async () => helper.birthdayChecker(client));
		console.log('Birthday Checker	:	Created');

		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};

export default exportedMethods;
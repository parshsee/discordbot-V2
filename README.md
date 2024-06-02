# Immature Bot V2

## Description
This is an updated version of my [first Discord bot](https://github.com/parshsee/discordbot) that contains some notable changes and improvements as detailed below.
Similar to the first bot, this will also utilize JavaScript and MongoDB as well as the same APIs and provide useful functons for my friends on their respective servers.

### Changes from V1 to V2
- The major change for this bot is the utilization of Discord.js version 14 instead of version 12.
	- This allows the bot to use slash commands, create/monitor server events, create/monitor threads and more
		- The bot will no longer monitor the chat messages for specific commands (with prefix '!') and instead rely on slash commands
		- This change was made in accordance with [Discords push to use slash commands over mentions](https://support-dev.discord.com/hc/en-us/articles/6025578854295)
	- While learning the changes, I created the template for this bot following the offical Discord [Getting Started Guide](https://discordjs.guide/#before-you-begin) which varied in how the original bot was setup
		- This allowed me create command and event handling and understand more of the new features available to developers
		- My notes and sample code files are available on this repo in the learning folder
- Due to Discords constant improvement, some commands have been removed, modified, or bundled as a singular slash command
	- Removed
		- Commands			: No longer needed
	- Modified
		- Events			: Discord allows users to create their own events, this will be repurposed to use those events. It will view and create server events, as well as remind participants of upcoming events.
		- Info				: Renamed to game-info
	- Bundled
		- Bdays	: This command will now be able to add, remove, list, and show specific birthday. This combines bday and bdays commands
		- Quotes : This command will now be able to add, remove, list, and show specific quote. This combines quote and quotes commands
		- Freestuff : This command will now be able to add, claim, list, and show specific game. This combines add, claim, and freestuff commands
- Changes to be Considered
	- Removing the delete command
	- Removing the leaderboard command

### Technologies
- Discord
- JavaScript
- Mongoose
- MongoDB

## Bot Commands
- [bdays](#bdays)
- [dailycute](#dailycute)
- [delete](#delete)
- [events](#events)
- [freestuff](#freestuff)
- [game-info](#game-info)
- [leaderboard](#leaderboard)
- [meme](#meme)
- [quotes](#quotes)
- [stats](#stats)
- [twitch](#twitch)


## Command Descriptions
### Bdays
Adds or removes a birthday from the database
Shows all birthdays in database or a specific one
### Dailycute
Call API and retrieve random cute animal image and animal fact
### Delete
Deletes the last message or a given number of messages (up to 100) in the channel from the last two weeks
### Event
Adds or Removes an event from the database
### Events
Shows all events in database or a specific one
### Freestuff
Shows all available games in database or searches for a specific game. Multiple copies of the same game will appear as [game name] x[# of copies]
Adds a specified game and key to the database. Support for Steam, Microsoft, GOG, Origin, Uplay, and Epic game codes
Command to claim a game from the database
### Info
Call API to retrieve information about a specified game with optional searching for specific year
### Leaderboard
Starts or ends a leaderboard, adds or removes players from a leaderboard, updates scores for players for a leaderboard
### Meme
Call API to retrieve a meme from a random subreddit (dankmemes, memes, me_irl) or a specified one. You can also now create your memes using ia!meme create
### Quotes
Adds or Removes a quote from the bot
Gets a random quote, specific quote, or lists all quotes
### Twitch
Adds or removes a Twitch streamer from the database or shows all streamers
### Stats
Show information on the server or on a specific user from their user id or mention

[Back To The Top](#Immature-Bot-V2)

## References
### APIs Used
Dailycute API: 	https://some-random-api.com/

Info API: https://api-v3.igdb.com/

Meme API: https://github.com/R3l3ntl3ss/Meme_Api

Meme Creation API: https://github.com/jacebrowning/memegen

Twitch API: https://dev.twitch.tv/docs/api/

[Back To The Top](#Immature-Bot-V2)
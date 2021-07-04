# SkyblockBot

This is a Discord bot that integrates with the Hypixel SkyBlock API to provide a personalised leaderboard with optional automated updates

## Setup

1. Download Node.js from [nodejs.org](https://nodejs.org/)
2. Download this repository

3. Add an aplication on [discord.com/developers/applications](https://discord.com/developers/applications/)
4. Add a bot to the application and copy the token
5. Create the `./data/token` file and paste the token into it ( make sure it does not have an extension )

6. Navigate to the folder in a terminal
7. Run `npm i` then `npx tsc`
8. Run `./run.sh` on Linux or `.\run.bat` on Windows

9. On the OAuth2 page, select the 'bot' scope then the administrator permissions then copy the generated url and paste it into your browser
10. Use that page to add the bot to your server ( the bot must be running when you add it )

11. Use the `sb!set_api_key < Hypixel API key >` command to set the API key to your API key ( which can be generated in-game with the `/api` command )
12. Add an item to track using `sb!add_item < item name >` ( a list of items can be sent using `sb!list_items` )
13. If you want, add a skill to track using `sb!add_skill < skill name >` ( a list of skills can be sent using `sb!list_skills` )
14. Add a player to track using `sb!add_player < Minecraft username >`

15. View the leaderboard using `sb!leaderboard`

## Info

A list of avaliable commands and their uses can be found with `sb!help [ command name ]`

You can also use this to find their aliases, for example `sb!leaderboard` can be shortened to `sb!lb`

If you cannot find what you need, you can open a 'Question' issue [here](https://github.com/tomBoddaert/SkyblockBot/issues/new/choose)

## Modifying the bot

If you wish to modify the bot, I recommend using TypeScript but JavaScript can be used.

Create your command in a new file in `./commands` ( or a custom directory like `./customCommands` ) in the style of the other commands.

Their export options and types are all listed in `types.d.ts` under the `ICommand` interface

The bot uses [Discord.js](https://discord.js.org/), which is easy to use and very well documented

## Bugs

If you find any bugs, open a 'Bug report' issue [here](https://github.com/tomBoddaert/SkyblockBot/issues/new/choose) and I will try to get around to fixing them

## Planned features

- Switch to Mojang POST API
- Caching
- API rate checks
- Pet tracking
- Online status

If you want to request a feature, please open a 'Feature request' issue [here](https://github.com/tomBoddaert/SkyblockBot/issues/new/choose)

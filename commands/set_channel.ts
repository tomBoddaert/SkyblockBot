import { writeFile } from 'fs/promises';

import { ICommand, IGuildConfigs } from 'types';

const command: ICommand = {

    name: 'set_channel',
    description: 'Sets the leaderboard channel',
    aliases: [ 'setc' ],
    usage: '#< channel name >',

    guildOnly: true,
    requiresPermLevel: 2,

    execute: async ( message, args, guildConfig, config ) => {

        if ( !guildConfig || !message.guild?.id ) return;

        const ChannelRegex = /^<#(\d{18})>$/;

        const res = ChannelRegex.exec( args[ 0 ] );

        if ( !res ) {
            return await message.reply( `incorrect use, please use \`${ guildConfig.prefix ?? config.defaultPrefix }set_channel #< channel name >\`!` );
        }

        const channelId = res[1];

        guildConfig.channelId = channelId;

        const guildConfigs = ( await import( '../data/guilds.json' ) ).default as IGuildConfigs;

        guildConfigs[ message.guild.id ] = guildConfig;

        try {

            await writeFile( './data/guilds.json', JSON.stringify( guildConfigs ) );
            await message.reply( `channel set to #<${ channelId }>` );

        } catch ( error ) {

            await message.reply( 'something went wrong!' );
            console.error( error );

        }

    }
}

export default command;
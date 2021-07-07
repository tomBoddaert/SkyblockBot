import { readdir, writeFile } from 'fs/promises';

import { ICommand, IGuildConfigs } from 'types';

const icons = await readdir( './data/icons' );

const command: ICommand = {

    name: 'set_colour',
    description: 'Sets the leaderboard colour',
    aliases: [ 'setco', 'set_color' ],
    usage: '< colour hex value >',

    guildOnly: true,
    requiresPermLevel: 1,

    execute: async ( message, args, guildConfig, config ) => {

        if ( !guildConfig || !message.guild?.id ) return;

        const colourRegex = /^(?:(?:0x)|#)?((\d|[a-f]){6})$/

        const colour = colourRegex.exec( args[ 0 ].toLowerCase( ) );

        if ( !colour ) {
            return await message.reply( `that is not a valid hex colour!` );
        }

        guildConfig.colour = colour[ 1 ];

        const guildConfigs = ( await import( '../data/guilds.json' ) ).default as IGuildConfigs;

        guildConfigs[ message.guild.id ] = guildConfig;

        try {

            await writeFile( './data/guilds.json', JSON.stringify( guildConfigs ) );
            await message.reply( 'colour set' );

        } catch ( error ) {

            await message.reply( 'something went wrong!' );
            console.error( error );
            
        }

    }
}

export default command;
import { writeFile } from 'fs/promises';

import { ICommand, IGuildConfigs } from 'types';

const command: ICommand = {

    name: 'set_api_key',
    description: 'Sets the Hypixel API key',
    aliases: [ 'setk' ],
    usage: '< Hypixel API key >',

    guildOnly: true,
    requiresPermLevel: 2,

    execute: async ( message, args, guildConfig, config ) => {

        if ( !guildConfig || !message.guild?.id ) return;

        const KeyRegex = /^(?:\d|[a-f]){8}-(?:\d|[a-f]){4}-(?:\d|[a-f]){4}-(?:\d|[a-f]){4}-(?:\d|[a-f]){12}$/;

        const isValid = KeyRegex.exec( args[ 0 ] );

        if ( !isValid ) {
            return await message.reply( `that not a valid key, please use \`${ guildConfig.prefix ?? config.defaultPrefix }set_api_key < Hypixel API key >\`!` );
        }

        guildConfig.apiKey = args[ 0 ];

        const guildConfigs = ( await import( '../data/guilds.json' ) ).default as IGuildConfigs;

        guildConfigs[ message.guild.id ] = guildConfig;

        try {
            await writeFile( './data/guilds.json', JSON.stringify( guildConfigs ) );
        } catch ( error ) {

            await message.reply( 'something went wrong!' );
            console.error( error );
            
        }

    }
}

export default command;
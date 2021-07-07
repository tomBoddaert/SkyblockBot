import { readdir, writeFile } from 'fs/promises';

import { ICommand, IGuildConfigs } from 'types';

const icons = await readdir( './data/icons' );

const command: ICommand = {

    name: 'set_prefix',
    description: 'Sets the Skyblock Bot\'s prefix',
    aliases: [ 'setp' ],
    usage: '< prefix >',

    guildOnly: true,
    requiresPermLevel: 2,

    execute: async ( message, args, guildConfig, config ) => {

        if ( !guildConfig || !message.guild?.id ) return;

        const prefix = args.join( ' ' );

        if ( !prefix ) {
            return await message.reply( `no prefix supplied!` );
        }

        guildConfig.prefix = prefix;

        const guildConfigs = ( await import( '../data/guilds.json' ) ).default as IGuildConfigs;

        guildConfigs[ message.guild.id ] = guildConfig;

        try {

            await writeFile( './data/guilds.json', JSON.stringify( guildConfigs ) );
            await message.reply( `prefix set to \`${ prefix }\`` );

        } catch ( error ) {

            await message.reply( 'something went wrong!' );
            console.error( error );
            
        }

    }
}

export default command;
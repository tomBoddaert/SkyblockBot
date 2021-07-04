import { readdir, writeFile } from 'fs/promises';

import { ICommand, IGuildConfigs } from 'types';

const icons = await readdir( './data/icons' );

const command: ICommand = {

    name: 'set_icon',
    description: 'Sets the leaderboard icon',
    aliases: [ 'setic' ],
    usage: '< icon name >',

    guildOnly: true,
    requiresPermLevel: 1,

    execute: async ( message, args, guildConfig, config ) => {

        if ( !guildConfig || !message.guild?.id ) return;

        const iconName = args.join( ' ' ).toLowerCase( );

        const icon = icons.find( name => iconName === name.toLowerCase( ) );

        if ( !icon ) {
            return await message.reply( `that is not a valid icon, please use \`${ guildConfig.prefix ?? config.defaultPrefix }list_icons\` to list all avaliable icons, then \`${ guildConfig.prefix ?? config.defaultPrefix }add_icon < icon name >\` to set it!` );
        }

        guildConfig.icon = icon;

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
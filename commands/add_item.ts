import { writeFile } from 'fs/promises';

import { ICommand, IGuildConfigs, IItemSkillNames } from 'types';

const items = ( ( await import( '../data/itemSkillNames.json' ) ).default as IItemSkillNames ).items;

const command: ICommand = {

    name: 'add_item',
    description: 'Adds an item to the leaderboard',
    aliases: [ 'addi' ],
    usage: '< item name >',

    guildOnly: true,
    requiresPermLevel: 1,

    execute: async ( message, args, guildConfig, config ) => {

        if ( !guildConfig || !message.guild?.id ) return;

        const itemName = args.join( ' ' ).toLowerCase( );

        const item = Object.entries( items ).find( ( [, name ] ) => itemName === name.toLowerCase( ) );

        if ( !item ) {
            return await message.reply( `that is not a valid item, please use \`${ guildConfig.prefix ?? config.defaultPrefix }list_items\` to list all avaliable items, then \`${ guildConfig.prefix ?? config.defaultPrefix }add_item < item name >\` to add one!` );
        }

        if ( guildConfig.itemIds.includes( item[ 0 ] ) ) {
            return await message.reply( `that item is already on the leaderboard!` );
        }

        guildConfig.itemIds.push( item[ 0 ] );

        const guildConfigs = ( await import( '../data/guilds.json' ) ).default as IGuildConfigs;

        guildConfigs[ message.guild.id ] = guildConfig;

        try {

            await writeFile( './data/guilds.json', JSON.stringify( guildConfigs ) );
            await message.reply( `added \`${ item[ 1 ] }\` to the leaderboard` );

        } catch ( error ) {

            await message.reply( 'something went wrong!' );
            console.error( error );
            
        }

    }
}

export default command;
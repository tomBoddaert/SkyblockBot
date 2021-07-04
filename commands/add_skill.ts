import { writeFile } from 'fs/promises';

import { ICommand, IGuildConfigs, IItemSkillNames } from 'types';

const skills = ( ( await import( '../data/itemSkillNames.json' ) ).default as IItemSkillNames ).skills;

const command: ICommand = {

    name: 'add_skill',
    description: 'Adds a skill to the leaderboard',
    aliases: [ 'adds' ],
    usage: '< skill name >',

    guildOnly: true,
    requiresPermLevel: 1,

    execute: async ( message, args, guildConfig, config ) => {

        if ( !guildConfig || !message.guild?.id ) return;

        const skillName = args.join( ' ' ).toLowerCase( );

        const item = Object.entries( skills ).find( ( [, name ] ) => skillName === name.toLowerCase( ) );

        if ( !item ) {
            return await message.reply( `that is not a valid skill, please use \`${ guildConfig.prefix ?? config.defaultPrefix }list_skills\` to list all avaliable skills, then \`${ guildConfig.prefix ?? config.defaultPrefix }add_skill < skill name >\` to add one!` );
        }

        if ( guildConfig.skillIds.includes( item[ 0 ] ) ) {
            return await message.reply( `that skill is already on the leaderboard!` );
        }

        guildConfig.skillIds.push( item[ 0 ] );

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
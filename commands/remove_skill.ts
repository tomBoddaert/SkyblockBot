import { writeFile } from 'fs/promises';

import { ICommand, IGuildConfigs, IItemSkillNames } from 'types';

const skills = ( ( await import( '../data/itemSkillNames.json' ) ).default as IItemSkillNames ).skills;

const command: ICommand = {

    name: 'remove_skill',
    description: 'Removes a skill from the leaderboard',
    aliases: [ 'rems' ],
    usage: '< skill name >',

    guildOnly: true,
    requiresPermLevel: 1,

    execute: async ( message, args, guildConfig, config ) => {

        if ( !guildConfig || !message.guild?.id ) return;

        const skillName = args.join( ' ' ).toLowerCase( );

        const skill = Object.entries( skills ).find( ( [, name ] ) => skillName === name.toLowerCase( ) );

        if ( !skill ) {
            return await message.reply( `that is not a valid skill, please use \`${ guildConfig.prefix ?? config.defaultPrefix }list_skills\` to list all avaliable skills, then \`${ guildConfig.prefix ?? config.defaultPrefix }remove_skill < skill name >\` to remove one!` );
        }

        if ( !guildConfig.skillIds.includes( skill[ 0 ] ) ) {
            return await message.reply( `that skill is already not on the leaderboard!` );
        }

        guildConfig.skillIds = guildConfig.skillIds.filter( skillId => skillId !== skill[ 0 ] );

        const guildConfigs = ( await import( '../data/guilds.json' ) ).default as IGuildConfigs;

        guildConfigs[ message.guild.id ] = guildConfig;

        try {

            await writeFile( './data/guilds.json', JSON.stringify( guildConfigs ) );
            await message.reply( `removed \`${ skill[ 1 ] }\` from the leaderboard` );

        } catch ( error ) {

            await message.reply( 'something went wrong!' );
            console.error( error );
            
        }

    }
}

export default command;
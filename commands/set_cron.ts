import { writeFile } from 'fs/promises';
import { scheduledJobs, scheduleJob } from 'node-schedule';

import leaderboard from '../send_leaderboard';

import { ICommand, IGuildConfigs } from 'types';
import { Guild } from 'discord.js';

const command: ICommand = {

    name: 'set_cron',
    description: 'Sets the cron expression for automated leaderboards ( omit cron expression to disable )',
    aliases: [ 'setcr' ],
    usage: '[ cron expression ]',

    guildOnly: true,
    requiresPermLevel: 2,

    execute: async ( message, args, guildConfig, config ) => {

        if ( !guildConfig || !message.guild?.id ) return;

        if ( !args[ 0 ] ) {

            guildConfig.cron = '';
            scheduledJobs[ message.guild.id ]?.cancel( );

        } else {

            const CronRegex = [
                /^(([0-5]?[0-9](-[0-5]?[0-9])?)(,([0-5]?[0-9](-[0-5]?[0-9])?))*|\*|((\d+|\*)\/\d+))$/,
                /^(((2[0-4])|([0-1]?[0-9]))(-((2[0-4])|([0-1]?[0-9])))?(,((2[0-4])|([0-1]?[0-9]))(-((2[0-4])|([0-1]?[0-9])))?)*|\*|((\d+|\*)\/\d+))$/,
                /^(((3[0-1])|([0-2]?[0-9]))(-((3[0-1])|([0-2]?[0-9])))?(,((3[0-1])|([0-2]?[0-9]))(-((3[0-1])|([0-2]?[0-9])))?)*|\*|((\d+|\*)\/\d+))$/,
                /^(((1[0-2])|(0?[0-9]))(-((1[0-2])|(0?[0-9])))?(,((1[0-2])|(0?[0-9]))(-((1[0-2])|(0?[0-9])))?)*|\*|((\d+|\*)\/\d+))$/,
                /^([0-6](-[0-6])?(,[0-6](-[0-6])?)*|\*|((\d+|\*)\/\d+))$/
            ];

            const isValid = CronRegex.every( ( regex, index ) => regex.exec( args[ index ] ?? '' ) );

            if ( !isValid ) {
                return await message.reply( `that not a valid cron expression ( valid types: # \\* , - / ), please use \`${ guildConfig.prefix ?? config.defaultPrefix }set_cron [ cron expression ]\`!` );
            }

            scheduledJobs[ message.guild.id ]?.cancel( );

            let success = scheduleJob( message.guild.id, args.slice( 0, 5 ).join( ' ' ), ( ) =>
                leaderboard( ( message.guild as Guild ).id, guildConfig, config, message.client ).catch( ( ) => undefined )
            );

            if ( !success ) {
                scheduledJobs[ message.guild.id ].cancel( );
                if ( guildConfig.cron ) scheduleJob( message.guild.id, guildConfig.cron, ( ) =>
                    leaderboard( ( message.guild as Guild ).id, guildConfig, config, message.client ).catch( ( ) => undefined )
                );
                return await message.reply( `that not a valid cron expression ( make sure ranges are in incresing order ), please use \`${ guildConfig.prefix ?? config.defaultPrefix }set_cron [ cron expression ]\`!` );
            }

            guildConfig.cron = args.slice( 0, 5 ).join( ' ' );

        }

        const guildConfigs = ( await import( '../data/guilds.json' ) ).default as IGuildConfigs;

        guildConfigs[ message.guild.id ] = guildConfig;

        try {

            await writeFile( './data/guilds.json', JSON.stringify( guildConfigs ) );
            await message.reply( guildConfig.cron ? 'cron enabled' : 'cron disabled' );
            
        } catch ( error ) {

            await message.reply( 'something went wrong!' );
            console.error( error );
            
        }

    }
}

export default command;
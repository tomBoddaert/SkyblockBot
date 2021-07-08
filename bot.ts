import { readFile, writeFile } from 'fs/promises';
import { Client, Collection, GuildMember, TextChannel } from 'discord.js';
import { scheduledJobs, scheduleJob } from 'node-schedule';

import { IConfig, IGuildConfig, IGuildConfigs } from 'types';
import commands from './commands/commands';
import leaderboard from './send_leaderboard';

const config = ( await import( './config.json' ) ).default as IConfig;

const guilds = ( await import( './data/guilds.json' ) ).default as IGuildConfigs;

export default async ( ) => {

    const client = new Client( );
    const cooldowns = new Collection( );

    client.once( 'ready', ( ) => {

        Object.entries( guilds ).forEach( ( [ guildId, guildConfig ] ) => {

            if ( guildConfig.cron ) {
                scheduleJob( guildId, guildConfig.cron, ( ) => 
                    leaderboard( guildConfig, config, client ).catch( ( ) => undefined )
                );
            }

        } );

        console.log( 'Ready!' );

    } );

    client.on( 'message', async message => {
        // ! Add no response for no-response channels
        
        // If message is from a bot, stop
        if ( message.author.bot ) return;

        const guildConfig: IGuildConfig | undefined = guilds[ message.guild?.id ?? '' ];

        // If the message does not start with the prefix, stop
        if ( !message.content.startsWith( guildConfig?.prefix ?? config.defaultPrefix ) ) return;

        // Split command into words
        const args = message.content.slice( ( guildConfig?.prefix ?? config.defaultPrefix ).length ).split( / +/ );
        const commandName = args.shift( )?.toLowerCase( );
        const command = commands.find( cmd => cmd.name === commandName || cmd.aliases?.includes( commandName ?? '' ) );

        // If the command does not exist, warn user and stop
        if ( !command ) {
            return await message.reply( `that is not a valid command!` );
        }

        // If the command is only avaliable in guilds, and the current channel is not in one, warn the user and stop
        if ( command.guildOnly && message.channel.type !== 'text' ) {
            return await message.channel.send( `That command is only avaliable in servers!` );
        }

        // ! Add argument checking

        // Check perm level, if not high enough, warn user and stop
        if ( command.requiresPermLevel ) {
            let userPermLevel = 0;
            if ( message.author.id === message.guild?.ownerID ) {
                userPermLevel = 2;
            } else if ( message.member?.roles.cache.some( role => role.name.toLowerCase( ) === config.adminRoleName ) ) {
                userPermLevel = 1;
            }

            if ( userPermLevel < command.requiresPermLevel ) {
                return await message.reply( `you don't have the permissions to run \`${ commandName }\`!` );
            }
        }

        // If command requires dev and user is not a dev, warn user and stop
        if ( command.requiresDev && !config.developers.includes( message.author.id ) ) {
            return await message.reply( `you don't have the permissions to run \`${ commandName }\`!` );
        }

        // If there is no cooldown for the command set, create one
        if ( !cooldowns.has( command.name ) ) {
            cooldowns.set( command.name, new Collection( ) );
        }

        // If the command has been executed before cooldown, warn user and stop
        const now = Date.now( );
        const timestamps = cooldowns.get( command.name ) as Collection< string, number >;
        const cooldown = ( command.cooldown ?? guildConfig?.defaultCooldown ?? config.defaultCooldown ) * 1000;

        if ( timestamps.has( message.author.id ) ) {
            const expirationTime = ( timestamps.get( message.author.id ) ?? 0 ) + cooldown;

            if ( now < expirationTime ) {
                const timeLeft = ~~( ( expirationTime - now ) / 1000 ) + 1;
                return await message.reply( `please wait \`${ timeLeft }\` seconds before using \`${ command.name }\` again!` );
            }
        }

        timestamps.set( message.author.id, now );
        setTimeout( ( ) => timestamps.delete( message.author.id ), cooldown );

        try {
            command.execute( message, args, guildConfig, config );
        } catch ( error ) {
            console.error( error );
            await message.reply( `something went wrong with that last command!` );
        }

    } );

    // Setup guild config when added
    client.on( 'guildCreate', async guild => {

        const textChannels = guild.channels.cache.filter(
            channel => channel.isText( ) && ( channel.permissionsFor( guild.me as GuildMember )?.has( 'SEND_MESSAGES' ) ?? false )
        );

        if ( !textChannels.reduce( acc => acc + 1, 0 ) ) {
            return guild.leave( );
        }

        const channel = ( textChannels.find( channel => channel.name === 'general' )
            ?? textChannels.first( ) ) as TextChannel;

        guilds[ guild.id ] = {

            channelId: channel.id,
            prefix: null,
            defaultCooldown: null,
            apiKey: null,
            itemIds: [ ],
            skillIds: [ ],
            playerIds: [ ],
            cron: null,
            icon: null,
            colour: null
            
        }

        await writeFile( './data/guilds.json', JSON.stringify( guilds ) )
            .catch( async error => {
                delete guilds[ guild.id ];
                await channel.send( 'Error setting up guild configuration, please contact my owner or developer!' );
                await guild.leave( );
                console.error( error );
            } );

        if ( !guild.roles.cache.some( role => role.name.toLowerCase( ) === config.adminRoleName ) ) {
            await guild.roles.create( { data: { name: config.adminRoleName } } )
                .catch( async ( ) => {
                    await channel.send( `Please create a role called \`${ config.adminRoleName }\` because I couldn\'t!` )
                } );
        }

        await channel.send( `Please use \`${ config.defaultPrefix }set_api_key\` to add your skyblock API key` );
        await channel.send( `For help, type \`${ config.defaultPrefix }help\`` );

    } );

    // Remove guild config when removed
    client.on( 'guildDelete', async guild => {

        delete guilds[ guild.id ];
        scheduledJobs[ guild.id ]?.cancel( );

        await writeFile( './data/guilds.json', JSON.stringify( guilds ) )
            .catch( console.error );
            
    } );

    // Log in
    try {
        await client.login( ( await readFile( './data/token' ) ).toString( ) );
    } catch ( error ) {

        if ( error.code === 'TOKEN_INVALID' ) {
            throw new Error( 'Token ( from ./data/token ) does not match a Discord bot token!' );
        } else {
            throw error;
        }
    
    }

};
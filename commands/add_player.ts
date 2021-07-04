import { writeFile } from 'fs/promises';
import axios from 'axios';

import { ICommand, IGuildConfigs } from 'types';

const command: ICommand = {

    name: 'add_player',
    description: 'Adds a player to the leaderboard',
    aliases: [ 'addp' ],
    usage: '< player name >',

    guildOnly: true,
    requiresPermLevel: 1,

    execute: async ( message, args, guildConfig, config ) => {

        if ( !guildConfig || !message.guild?.id ) return;

        const PlayerRegex = /^([a-z]|[A-Z]|\d|_){3,16}$/;

        const isValid = PlayerRegex.exec( args[ 0 ] );

        if ( !isValid ) {
            return await message.reply( `that is invalid, please use \`${ guildConfig.prefix ?? config.defaultPrefix }add_player < player name >\`!` );
        }

        let res = await axios.get( `https://api.mojang.com/users/profiles/minecraft/${ args[ 0 ] }` )
            .catch( console.error );

        if ( !res || res.statusText !== 'OK' ) {
            return await message.reply( 'that player does not exist!' );
        }

        if ( guildConfig.playerIds.includes( res.data.id ) ) {
            return await message.reply( `that player is already on the leaderboard!` );
        }

        guildConfig.playerIds.push( res.data.id );

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
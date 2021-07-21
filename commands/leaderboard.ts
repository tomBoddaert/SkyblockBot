import { Guild } from 'discord.js';
import { ICommand } from 'types';

import leaderboard from '../send_leaderboard';

const command: ICommand = {

    name: 'leaderboard',
    description: 'Sends the leaderboard',
    aliases: [ 'lb' ],
    usage: '',

    guildOnly: true,

    execute: ( message, args, guildConfig, config ) => {

        if ( !guildConfig ) return;

        leaderboard( ( message.guild as Guild ).id, guildConfig, config, message.client )
            .catch( async ( ) => {
                await message.reply( `cannot sent message to channel, use \`${ guildConfig.prefix ?? config.defaultPrefix }set_channel #< channel name >\` to set the leaderboard channel` );
            } );

    }
}

export default command;
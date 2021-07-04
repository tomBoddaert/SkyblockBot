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
        leaderboard( guildConfig, config, message.client );
    }
}

export default command;
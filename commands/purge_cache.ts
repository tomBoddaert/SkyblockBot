import { purgeCache } from '../apiCalls';

import { ICommand } from 'types';

const command: ICommand = {

    name: 'purge_cache',
    description: 'Purges the cache',
    aliases: [ 'clear_cache', 'pc' ],

    requiresDev: true,

    execute: async ( message, args, guildConfig, config ) => {

        purgeCache( );
        await message.reply( 'purged cache' );

    }
}

export default command;
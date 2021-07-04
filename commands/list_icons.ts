import { readdir } from 'fs/promises';

import { ICommand } from 'types';

const icons = await readdir( './data/icons' );

const command: ICommand = {

    name: 'list_icons',
    description: 'Lists the avaliable icons',
    aliases: [ 'lsic' ],

    execute: async ( message, args, guildConfig, config ) => {

        const data: string[ ] = [ ];

        data.push( 'Icons:' );
        data.push( `\`${ icons.join( '`, `' ) }\`` );
        data.push( `To set the leaderboard icon, type \`${ guildConfig?.prefix ?? config.defaultPrefix }set_icon < icon name >\`` );

        try {

            await message.author.send( data, { split: true } )
            if ( message.channel.type !== 'dm') await message.reply( `I have send you a DM` );
            
        } catch ( error ) {

            await message.reply( `I could not send you a DM, do you have your DMs disabled?` );
            console.error( error );

        }

    }
}

export default command;
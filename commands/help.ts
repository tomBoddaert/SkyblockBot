import { ICommand } from 'types';

import commands from './commands';

const command: ICommand = {

    name: 'help',
    description: 'List all commands and their uses',
    aliases: [ 'h', 'commands' ],
    usage: '[ command name ]',

    execute: async ( message, args, guildConfig, config ) => {
        
        const data: string[ ] = [ ];

        if ( !args.length ) {
            data.push(
                'Commands:',
                `\`${ commands.filter( command => !command.hidden ).map( command => command.name ).join( '`, `' ) }\``,
                `For help with a command, type \`${ guildConfig?.prefix ?? config.defaultPrefix }help < command name >\``
            );
        } else {
            
            const command = commands.find( command => command.name === args[ 0 ].toLowerCase( ) || command.aliases?.includes( args[ 0 ].toLowerCase( ) ) );

            if ( !command ) {
                return await message.reply( `there is no command or alias called \`${ args[ 0 ].toLowerCase( ) }\`!` );
            }

            data.push( `**Name**: \`${ command.name }\`` );

            if ( command.aliases ) data.push( `  **Aliases**: \`${ command.aliases.join( '\`, \`' ) }\`` );
            if ( command.description ) data.push( `  **Description**: ${ command.description }` );
            if ( command.usage ) data.push( `  **Usage**: \`${ guildConfig?.prefix ?? config.defaultPrefix }${ command.name } ${ command.usage }` );

            data.push( `  **Cooldown**: ${ command.cooldown ?? guildConfig?.defaultCooldown ?? config.defaultCooldown }s` );

        }

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
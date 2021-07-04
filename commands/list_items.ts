import { ICommand, IItemSkillNames } from 'types';

const items = ( ( await import( '../data/itemSkillNames.json' ) ).default as IItemSkillNames ).items;

const command: ICommand = {

    name: 'list_items',
    description: 'Lists all avaliable items',
    aliases: [ 'lsi' ],

    execute: async ( message, args, guildConfig, config ) => {

        const data: string[ ] = [ ];

        data.push( 'Items:' );
        data.push( `\`${ Object.values( items ).join( '`, `' ) }\`` );
        data.push( `To add an item to the leaderboard, type \`${ guildConfig?.prefix ?? config.defaultPrefix }add_item < item name >\`` );
        data.push( `To remove an item from the leaderboard, type \`${ guildConfig?.prefix ?? config.defaultPrefix }remove_item < item name >\`` );

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
import { ICommand, IItemSkillNames } from 'types';

const skills = ( ( await import( '../data/itemSkillNames.json' ) ).default as IItemSkillNames ).skills;

const command: ICommand = {

    name: 'list_skills',
    description: 'Lists all avaliable skills',
    aliases: [ 'lss' ],

    execute: async ( message, args, guildConfig, config ) => {

        const data: string[ ] = [ ];

        data.push( 'Skills:' );
        data.push( `\`${ Object.values( skills ).join( '`, `' ) }\`` );
        data.push( `To add a skill to the leaderboard, type \`${ guildConfig?.prefix ?? config.defaultPrefix }add_skill < skill name >\`` );
        data.push( `To remove a skill from the leaderboard, type \`${ guildConfig?.prefix ?? config.defaultPrefix }remove_skill < skill name >\`` );

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
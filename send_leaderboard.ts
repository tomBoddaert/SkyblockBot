import { Client, MessageEmbed, TextChannel } from 'discord.js';
import { IConfig, IGuildConfig, IItemSkillNames } from 'types';
import { getName, getItemsAndSkills, logCache } from './apiCalls';

const itemSkillNames = ( await import( './data/itemSkillNames.json' ) ).default as IItemSkillNames;

const leaderboard = async ( guildId: string, guildConfig: IGuildConfig, config: IConfig, client: Client ) => {
    
    if ( !guildConfig.apiKey ) {
        return await ( client.channels.cache.get( guildConfig.channelId ) as TextChannel ).send( `API key not set! Please use \`${ guildConfig.prefix ?? config.defaultPrefix }set_api_key < Hypixel API key >\`!` );
    }

    if ( !guildConfig.playerIds.length ) {
        return await ( client.channels.cache.get( guildConfig.channelId ) as TextChannel ).send( `Leaderboard players not set! Please use \`${ guildConfig.prefix ?? config.defaultPrefix }add_player < player name >\` to add a player!` );
    }

    if ( !guildConfig.itemIds.length && !guildConfig.skillIds.length ) {
        return await ( client.channels.cache.get( guildConfig.channelId ) as TextChannel ).send( `Leaderboard items and skills not set! Please use \`${ guildConfig.prefix ?? config.defaultPrefix }add_item < item name >\` to add an item or \`${ guildConfig.prefix ?? config.defaultPrefix }add_skill < skill name >\` to add a skill!` );
    }

    const names: { [ uuid: string ]: string } = { };

    ( await Promise.all( guildConfig.playerIds.map( getName ) ) )
        .forEach( ( [ uuid, name ] ) => {
            names[ uuid ] = name;
        } );

    const memberData: {
        [ uuid: string ]: [
            { [ itemId: string ]: number } | undefined,
            { [ skillId: string ]: number } | undefined,
            number
    ] } = { };
        
    ( await Promise.all( guildConfig.playerIds.map( uuid =>
        getItemsAndSkills( uuid, guildConfig.itemIds, guildConfig.skillIds, guildConfig.apiKey as string )
    ) ) ).forEach( ( [ uuid, ...data ] ) => memberData[ uuid ] = data );

    const newEmbed = new MessageEmbed( )
        .setTimestamp( )
        .setTitle( `SkyBlock Leaderboards` )
        .setColor( guildConfig.colour ?? config.defaultColour )
        .attachFiles( [ `./data/icons/${ guildConfig.icon ?? config.defaultIcon }` ] )
        .setThumbnail( `attachment://${ guildConfig.icon ?? config.defaultIcon }` );

    Object.entries( memberData ).sort( ( [, [,, m1 ] ], [, [,, m2 ] ] ) => m2 - m1 ).forEach( ( [ memberId, member ] ) => {

        if ( member[ 2 ] === -1 ) {
            return newEmbed.addField( names[ memberId ], '( API off )' );
        }

        newEmbed.addField(

            names[ memberId ],

            ( member[ 0 ] ? Object.entries( member[ 0 ] ).reduce(
                ( acc, [ itemId, score ] ) => `\
${ acc }${ acc === '' ? '' : '\n' }\
${ score > 1_000_000_000 ? score.toPrecision( 3 ) : score.toString( ).replace( /\B(?=(\d{3})+(?!\d))/g, ',' ) } \
${ itemSkillNames.items[ itemId ] }`,
                ''
            ) : '' ) +

            ( member[ 1 ] ? Object.entries( ( member[ 1 ] as { [ skillId: string]: number } ) ).reduce(
                ( acc, [ skillId, score ] ) => `\
${ acc }
${ score > 1_000_000_000 ? score.toPrecision( 3 ) : score.toString( ).replace( /\B(?=(\d{3})+(?!\d))/g, ',' ) } \
${ itemSkillNames.skills[ skillId ] } xp`,
                ''
            ) : '' )

        );
    } );

    guildConfig.playerIds.filter( id => !Object.keys( memberData ).includes( id ) ).forEach( memberId => {
        newEmbed.addField( names[ memberId ], '( not on SkyBlock )');
    } );

    const channel = client.guilds.cache.get( guildId )?.channels.cache.get( guildConfig.channelId );

    if ( channel?.type !== 'text' ) {
        throw new Error( 'Channel not found or not text ( send_leaderboard )!' );
    }

    await ( channel as TextChannel ).send( newEmbed )
        .catch( console.error );

};

export default leaderboard;
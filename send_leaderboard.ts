import axios from 'axios';
import { Client, MessageEmbed, TextChannel } from 'discord.js';
import { IConfig, IGuildConfig, IItemSkillNames } from 'types';

const itemSkillNames = ( await import( './data/itemSkillNames.json' ) ).default as IItemSkillNames;

const leaderboard = async ( guildConfig: IGuildConfig, config: IConfig, client: Client ) => {
    
    if ( !guildConfig.apiKey ) {
        return ( client.channels.cache.get( guildConfig.channelId ) as TextChannel ).send( `API key not configured! Please use \`${ guildConfig.prefix ?? config.defaultPrefix }set_api_key < Hypixel API key >\`!` );
    }

    const promises: Promise< any >[ ] = [ ];

    guildConfig.playerIds.forEach( ( uuid: string ) => {

        promises.push( axios.get( `https://api.hypixel.net/skyblock/profiles?key=${ guildConfig.apiKey }&uuid=${ uuid }` )
            .catch( console.error ) );

        promises.push( axios.get( `https://api.mojang.com/user/profiles/${ uuid.replace( /-/g, '' ) }/names` )
            .catch( console.error ) );

    } );

    const data = await Promise.all( promises );

    const memberData: {
        [ uuid: string ]: [
            { [ itemId: string]: number },
            { [ skillId: string ]: number },
            number
        ]
    } = { };

    const memberNames: { [ uuid: string ]: string } = { };

    data.forEach( ( res: {

        config: {
            url: string
        },

        data: {

            success: boolean,

            profiles: {
                members: {

                    [ key: string ]: any,
                    collection: { [ key: string ]: number }

                }[ ]
            }[ ]

        } | {

            name: string,
            changedToAt: number

        }[ ]

    } ) => {
        
        if ( !Array.isArray( res.data ) ) {

            if ( !res.data.success ) return console.error( 'Skyblock API failture!' );

            if ( !res.data.profiles ) return;

            const itemScores: { [ itemId: string]: number } = { };
            const skillScores: { [ skillId: string ]: number } = { };
            const uuid = res.config.url.split( 'uuid=' )[ 1 ].replace( /-/g, '' );

            res.data.profiles.forEach( ( profile ) => {
                Object.entries( profile.members ).forEach( ( [ memberUuid, member ] ) => {

                    if ( memberUuid === uuid && member.collection ) {
                        guildConfig.itemIds.forEach( itemId => {
                            if ( member.collection[ itemId ] > ( itemScores[ itemId ] ?? -1 ) ){

                                itemScores[ itemId ] = member.collection[ itemId ];

                            }
                        } );

                        guildConfig.skillIds.forEach( skillId => {
                            if ( ~~member[ skillId ] > ( skillScores[ skillId ] ?? -1 ) ){

                                skillScores[ skillId ] = ~~member[ skillId ];

                            }
                        } );
                    }

                } );
            } );

            return memberData[ uuid ] = [
                itemScores,
                skillScores,
                Object.values( itemScores ).reduce( ( acc, curr ) => acc + curr, 0 )
            ];
        }

        const latestName = { name: '', time: -1 };
        const uuid = res.config.url.replace( 'https://api.mojang.com/user/profiles/', '' ).replace( '/names', '' );

        res.data.forEach( name => {

            if ( !name.changedToAt && !latestName.name ) {
                return latestName.name = name.name;
            }

            if ( name.changedToAt > latestName.time ) {
                latestName.name = name.name;
                latestName.time = name.changedToAt;
            }

        } );

        memberNames[ uuid ] = latestName.name;

    } );

    const newEmbed = new MessageEmbed( )
        .setTimestamp( )
        .setTitle( `SkyBlock Leaderboards` )
        .setColor( guildConfig.colour ?? config.defaultColour )
        .attachFiles( [ `./data/icons/${ guildConfig.icon ?? config.defaultIcon }` ] )
        .setThumbnail( `attachment://${ guildConfig.icon ?? config.defaultIcon }` );

    // ! Rewrite with `( [, [,, m1 ] ], [, [,, m2 ] ] ) => m2 - m1` ?

    Object.entries( memberData ).sort( ( m1, m2 ) => m2[ 1 ][ 2 ] - m1[ 1 ][ 2 ] ).forEach( ( [ memberId, member ] ) => {
        if ( !Object.keys( member[ 0 ] ).length && !Object.keys( member[ 1 ] ).length ) {
            return newEmbed.addField( memberNames[ memberId ], '( API off )' );
        };
        newEmbed.addField(
            memberNames[ memberId ],
            Object.entries( member[ 0 ] ).reduce(
                ( acc, [ itemId, score ] ) => `\
${ acc }${ acc === '' ? '' : '\n' }\
${ score > 1_000_000_000 ? score.toPrecision( 3 ) : score.toString( ).replace( /\B(?=(\d{3})+(?!\d))/g, ',' ) } \
${ itemSkillNames.items[ itemId ] }`,
                ''
            ) +
            Object.entries( member[ 1 ] ).reduce(
                ( acc, [ skillId, score ] ) => `\
${ acc }
${ score > 1_000_000_000 ? score.toPrecision( 3 ) : score.toString( ).replace( /\B(?=(\d{3})+(?!\d))/g, ',' ) } \
${ itemSkillNames.skills[ skillId ] } xp`,
                ''
            )
        );
    } );

    ( client.channels.cache.get( guildConfig.channelId ) as TextChannel )
        .send( newEmbed )
        .catch( console.error )

};

export default leaderboard;
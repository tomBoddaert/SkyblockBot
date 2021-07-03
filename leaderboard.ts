import axios from "axios";
import { MessageEmbed } from "discord.js";

const leaderboardIcons = (await import('./data/leaderboardIcons.json')).default as {
    [ itemId: string ]: string
}

const leaderboard = ( guildConfig: {

    channelId: string,
    prefix: string | null,
    defaultCooldown: number | null,
    apiKey: string | null,
    itemIds: string[],
    skillIds: string[],
    playerIds: string[],
    cron: string | null,
    icon: string,
    colour: string

} ) => {
    
    let promises: Promise< any >[ ] = [ ];

    guildConfig.playerIds.forEach( ( uuid: string ) => {

        promises.push( axios.get( `https://api.hypixel.net/skyblock/profiles?key=${ guildConfig.apiKey }&uuid=${ uuid }` )
            .catch( console.error ) );

        promises.push( axios.get( `https://api.mojang.com/user/profiles/${ uuid.replace( /-/g, '' ) }/names` )
            .catch( console.error ) );

    } );

    Promise.all( promises )
        .then( data => {

            let memberData: {
                [ uuid: string ]: [
                    { [ itemId: string]: number },
                    { [ skillId: string ]: number }
                ]
            } = { };
            let memberNames: { [ uuid: string ]: string } = { };

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

                    let itemScores: { [ itemId: string]: number } = { };
                    let skillScores: { [ skillId: string ]: number } = { };
                    let uuid = res.config.url.split( 'uuid=' )[ 1 ].replace( /-/g, '' );

                    res.data.profiles.forEach( ( profile ) => {
                        Object.entries( profile.members ).forEach( ( [ memberUuid, member ] ) => {

                            if ( memberUuid === uuid && member.collection ) {
                                guildConfig.itemIds.forEach( itemId => {
                                    if ( member.collection[ itemId ] > itemScores[ itemId ] ){

                                        itemScores[ itemId ] = member.collection[ itemId ];

                                    }
                                } );

                                guildConfig.skillIds.forEach( skillId => {
                                    if ( member[ skillId ] > skillScores[ skillId ] ){

                                        skillScores[ skillId ] = member[ skillId ];

                                    }
                                } );
                            }

                        } );
                    } );

                    return memberData[ uuid ] = [ itemScores, skillScores ];
                }

                let latestName = { name: '', time: -1 };
                let uuid = res.config.url.replace( 'https://api.mojang.com/user/profiles/', '' ).replace( '/names', '' );

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

            var newEmbed = new MessageEmbed( )
                .setTimestamp( )
                .setTitle( `SkyBlock Leaderboards` )
                .setColor( guildConfig.colour )

        } );

};

export default leaderboard;
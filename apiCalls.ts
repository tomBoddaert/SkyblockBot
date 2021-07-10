import axios, { AxiosResponse } from 'axios';

import { IConfig, IItemSkillNames } from 'types';

const config = ( await import( './config.json' ) ).default as IConfig;
const itemSkillNames = ( await import( './data/itemSkillNames.json' ) ).default as IItemSkillNames;

type ICollection = { [ id: string ]: number };

const cache: {
    [ uuid: string ]: {
        name?: [ string, number ],
        collection?: { [ id: string ]: number },
        skills?: { [ id: string ]: number },
        collectionSkillsTimeout?: number
        clear?: number
    }
} = { };

function removePlayerCache( uuid: string ) {
    delete cache[ uuid ];
}

async function getName( uuid: string ) {
    
    const now = Date.now( );
    let player = cache[ uuid ];

    if ( player && player.name && ( player.name as [ string, number ] )[ 1 ] >= now ) {
        clearInterval( player.clear );
        player.clear = setInterval( removePlayerCache, config.cacheLengths.player * 1000, uuid );
        return [ uuid, player.name[ 0 ] ];
    }

    const names: [
        {
            name: string,
            changedToAt: number | undefined
        }
    ] = ( await axios.get(
        `https://api.mojang.com/user/profiles/${ uuid }/names`,
        config.proxy.on ? { proxy: { host: config.proxy.host, port: config.proxy.port } } : undefined
    ).catch( console.error ) )?.data;

    const name = names.reduce( ( acc, curr ) => 
        ( curr.changedToAt ?? -1 ) > ( acc.changedToAt ?? -1 )
            ? curr
            : acc
    );

    if ( !player ) {
        player = { };
        cache[ uuid ] = player;
    }

    player.name = [ name.name, now + config.cacheLengths.property * 1000 ];

    clearInterval( player.clear );
    player.clear = setInterval( removePlayerCache, config.cacheLengths.player * 1000, uuid );
    
    return [ uuid, player.name[ 0 ] ];
}

async function getItemsAndSkills( uuid: string, items: string[ ], skills: string[ ], apiKey: string ): Promise< [
    string,
    ICollection | undefined,
    ICollection | undefined,
    number
] > {

    const now = Date.now( );
    let player = cache[ uuid ];

    if ( !player || ( player.collectionSkillsTimeout ?? -1 ) < now ) {

        const res = ( await axios.get(
            `https://api.hypixel.net/skyblock/profiles?key=${ apiKey }&uuid=${ uuid }`,
            config.proxy.on ? { proxy: { host: config.proxy.host, port: config.proxy.port } } : undefined
        ).catch( console.error ) ) as AxiosResponse< {
    
            success: boolean,

            profiles: {
                members: {

                    [ uuid: string ] : {
                        [ key: string ]: any,
                        collection: { [ key: string ]: number }
                    }

                }
            }[ ]

        } >;

        if ( !res?.data.success && !player.collectionSkillsTimeout ) {
            clearInterval( player.clear );
            player.clear = setInterval( removePlayerCache, config.cacheLengths.player * 1000, uuid );
            return [ uuid, undefined, undefined, -1 ];
        }

        if ( res.data.success ) {

            if ( !res.data.profiles ) {

                player.collection = undefined;
                player.skills = undefined;
                player.collectionSkillsTimeout = now;

            } else {

                let itemAmounts: ICollection | undefined = { };
                let skillAmounts: ICollection | undefined = { };

                res.data.profiles.forEach( profile => {

                    if ( profile.members[ uuid ].collection ) {

                        Object.entries( profile.members[ uuid ].collection ).forEach( ( [ itemId, amount ] ) => {
                            if ( amount > ( ( itemAmounts as ICollection )[ itemId ] ?? -1 ) ) {
                                ( itemAmounts as ICollection )[ itemId ] = amount;
                            }
                        } );

                    }

                    if ( profile.members[ uuid ][ Object.keys( itemSkillNames.skills )[ 0 ] ] ) {

                        Object.keys( itemSkillNames.skills ).forEach( skillId => {
                            if ( ~~profile.members[ uuid ][ skillId ] > ( ( skillAmounts as ICollection )[ skillId ] ?? -1 ) ) {
                                ( skillAmounts as ICollection )[ skillId ] = ~~profile.members[ uuid ][ skillId ];
                            }
                        } );

                    }

                } );

                player.collection = Object.keys( itemAmounts ).length ? itemAmounts : undefined;
                player.skills = Object.keys( skillAmounts ).length ? skillAmounts : undefined;
                player.collectionSkillsTimeout = now + config.cacheLengths.property * 1000;

            }

        }

    }

    let filteredCollection: ICollection | undefined = { };
    let highestAmount = 0;
    let filteredSkills: ICollection | undefined = { };

    if ( player.collection ) {

        items.forEach( itemId => {
            ( filteredCollection as ICollection )[ itemId ] = ( player.collection as ICollection )[ itemId ];
            if ( ( filteredCollection as ICollection )[ itemId ] > highestAmount ) {
                highestAmount = ( filteredCollection as ICollection )[ itemId ];
            }
        } );

    } else {
        filteredCollection = undefined;
        highestAmount = -1
    }

    if ( player.skills ) {

        skills.forEach( skillId => {
            ( filteredSkills as ICollection )[ skillId ] = ( player.skills as ICollection )[ skillId ];
        } );

    } else {
        filteredSkills = undefined;
    }

    clearInterval( player.clear );
    player.clear = setInterval( removePlayerCache, config.cacheLengths.player * 1000, uuid );

    return [
        uuid,
        filteredCollection,
        filteredSkills,
        highestAmount
    ];

}

function logCache( ) {
    console.log( cache );
}

export {
    getName,
    getItemsAndSkills,
    logCache
}
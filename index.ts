import { writeFile } from 'fs/promises';
import axios from 'axios';

import { IConfig } from 'types';
import update from './update';
import bot from './bot';

const config = ( await import( './config.json' ) ).default as IConfig;

const versionStr = ( await import( './package.json' ) ).default.version;

( async function ( ) {
    {
        const version = versionStr.split( '.' ).map( parseInt );
        const currentVersion = config.version.split( '.' ).map( parseInt );

        if ( currentVersion[0] !== version[0] || currentVersion[1] !== version[1] ) update( );

        const itemCollections: {
            [ type: string ]: {
                items: {
                    [ itemId: string ]: {
                        name: string
                    }
                }
            }
        } = await axios.get( 'https://api.hypixel.net/resources/skyblock/collections' )
            .then( res => res.data )
            .then( data => {

                if ( !data.success ) {
                    throw new Error( 'Hypixel API collections call failed!' );
                }

                return data.collections;

            } );

        const skillCollections: {
            [ skillId: string ]: {
                name: string
            }
        } = await axios.get( 'https://api.hypixel.net/resources/skyblock/skills' )
            .then( res => res.data )
            .then( data => {

                if ( !data.success ) {
                    throw new Error( 'Hypixel API skills call failed!' );
                }

                return data.skills;

            } );

        const items: { [ id: string ]: string } = { };
        const skills: { [ id: string ]: string } = { };

        Object.values( itemCollections ).forEach( type => {
            Object.entries( type.items ).forEach(
                ( [ itemId, { name } ]) =>
            {

                items[ itemId ] = name;

            } );
        } );

        Object.entries( skillCollections ).forEach( ( [ id, { name } ] ) => {
            skills[ `experience_skill_${ id.toLowerCase( ) }` ] = name;
        } );

        await writeFile( './data/itemSkillNames.json', JSON.stringify( {
            items,
            skills
        } ) );
    }

    bot( );

} )( );
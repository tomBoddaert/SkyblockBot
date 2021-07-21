import { readdir, readFile, writeFile } from 'fs/promises';
import axios from 'axios';

import { IConfig } from 'types';
import update from './update';

const config = ( await import( './config.json' ) ).default as IConfig;

const versionStr = ( await import( './package.json' ) ).default.version;

{
    const version = versionStr.split( '.' ).map( parseInt );
    const currentVersion = config.version.split( '.' ).map( parseInt );

    if ( currentVersion[0] !== version[0] || currentVersion[1] !== version[1] ) update( ( currentVersion as [ number, number, number] ), config, versionStr );

    const dataFiles = ( await readdir( './data', { withFileTypes: true } ) ).filter( dirent => dirent.isFile( ) );

    if ( !dataFiles.find( dirent => dirent.name === 'token' ) ) {
        await writeFile( './data/token', 'xxxxxxxxxxxxxxxxxxxxxxxx.xxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxx' );
        throw new Error( 'Token file ( ./data/token ) non-existant! A template file has been generated!' );
    }

    const token: string = ( await readFile( './data/token' ) ).toString( ).replace( /\n/g, '' );

    if ( token === 'xxxxxxxxxxxxxxxxxxxxxxxx.xxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxx' ) {
        throw new Error( 'Token file ( ./data/token ) must be replaced with your bot token!' );
    }

    const tokenRegex = /^([a-z]|[A-Z]|\d){24}.([a-z]|[A-Z]|\d){6}.([a-z]|[A-Z]|\d){27}$/;

    if ( !tokenRegex.exec( token ) ) {
        throw new Error( 'Token ( in ./data/token ) is invalid' );
    }

    if ( !dataFiles.find( dirent => dirent.name === 'guilds.json' ) ) {

        console.log( 'No guilds.json file ( ./data/guilds.json ) present, creating one...' );
        await writeFile( './data/guilds.json', '{}' );
        
    }

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

( await import( './bot') ).default()
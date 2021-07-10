import { writeFile } from "fs/promises";

import { IConfig } from "types";

export default async ( currentVersion: [ number, number, number ], config: IConfig ) => {

    if ( currentVersion[ 0 ] <= 1 && ( currentVersion[ 0 ] === 1 ? currentVersion[ 1 ] < 1 : true ) ) {
        config.cacheLengths = {
            player: 7200,
            property: 300
        }
        config.proxy = {
            on: false,
            host: 'localhost',
            port: 5555
        }
    }

    config.version = '1.1.0';

    await writeFile( './config.json', JSON.stringify( config ) );

};
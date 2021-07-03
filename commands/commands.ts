import { Message } from "discord.js";

const commands: {

    name: string,
    aliases?: string[ ],

    guildOnly?: boolean,
    cooldown?: number,
    
    requiresPermLevel?: 0 | 1 | 2,
    requiresDev?: boolean,

    execute: ( message: Message, args: string[ ] ) => void

}[ ] = [
    
]

export default commands;
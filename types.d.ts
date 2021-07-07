import { Message } from "discord.js";

export interface IConfig {

    version: string,
    defaultPrefix: string,
    defaultCooldown: number,
    defaultColour: string,
    defaultIcon: string,
    adminRoleName: string,
    developers: string[ ]

}

export interface IGuildConfig {

    channelId: string,
    prefix: string | null,
    defaultCooldown: number | null,
    apiKey: string | null,
    itemIds: string[ ],
    skillIds: string[ ],
    playerIds: string[ ],
    cron: string | null,
    icon: string | null,
    colour: string | null

}

export interface IGuildConfigs {
    [ id: string ]: IGuildConfig
}

export interface IItemSkillNames {
    items: { [ id: string ]: string },
    skills: { [ id: string ]: string }
}

export interface ICommand {

    name: string,
    description?: string,
    aliases?: string[ ],
    usage?: string,

    guildOnly?: boolean,
    cooldown?: number,
    
    requiresPermLevel?: 0 | 1 | 2,
    requiresDev?: boolean,
    hidden?: boolean

    execute: ( message: Message, args: string[ ], guildConfig: IGuildConfig | undefined, config: IConfig ) => Promise

}
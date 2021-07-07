import { ICommand } from 'types';

// Command imports
import help from './help';
import leaderboard from './leaderboard';
import add_player from './add_player';
import remove_player from './remove_player';
import list_items from './list_items';
import add_item from './add_item';
import remove_item from './remove_item';
import list_skills from './list_skills';
import add_skill from './add_skill';
import remove_skill from './remove_skill';
import list_icons from './list_icons';
import set_icon from './set_icon';
import set_colour from './set_colour';
import set_prefix from './set_prefix';
import set_api_key from './set_api_key';
import set_channel from './set_channel';
import set_cron from './set_cron';

const commands: ICommand[ ] = [
    help,
    leaderboard,
    add_player,
    remove_player,
    list_items,
    add_item,
    remove_item,
    list_skills,
    add_skill,
    remove_skill,
    list_icons,
    set_icon,
    set_colour,
    set_prefix,
    set_api_key,
    set_channel,
    set_cron
]

export default commands;
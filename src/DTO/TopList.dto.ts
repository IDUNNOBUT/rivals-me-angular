import {HeroDto} from './Hero.dto';

export type HeroTopDto = HeroDto & { pickRate: number, winRate: number };

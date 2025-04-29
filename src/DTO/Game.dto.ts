import {HeroDto} from './Hero.dto';
import {MapDto} from './Map.dto';

export type GameDto = {
  id: string;
  user: string;
  date: string;
  duration: number;
  hero: HeroDto;
  map: MapDto;
  ranked: boolean;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
};

export type CreateGameDto = Omit<GameDto, "id" | "user" | "hero" | "map"> & { hero: string, map: string };

export type UpdateGameDto = Partial<Omit<GameDto, "id" | "user" | "hero" | "map">> & { hero?: string, map?: string };

export type GameFilterDto = {
  id?: string;
  date?: string;
  hero?: string;
  map?: string;
  ranked?: boolean;
  win?: boolean;
};

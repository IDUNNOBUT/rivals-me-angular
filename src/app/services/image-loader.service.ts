import {IMAGE_LOADER, ImageLoaderConfig} from '@angular/common';
import {environment} from '../../environments/environment';

export function customImageLoader(config: ImageLoaderConfig): string {
  if (!config.src) {
    throw new Error('Image src is required');
  }

  if (config.src.startsWith('http') || config.src.startsWith('data:')) {
    return config.src;
  }

  if (config.src.startsWith('heroes/')) {
    const parts = config.src.split('/');
    const heroName = parts[1];

    if (parts.length > 2) {
      const imageType = parts[2];

      if (config.width && ['portrait', 'background'].includes(imageType)) {
        if (config.width <= 400) {
          return `${environment.apiUrl}/public/heroes/${encodeURIComponent(heroName)}/${imageType}/400w.webp`;
        } else if (config.width <= 600) {
          return `${environment.apiUrl}/public/heroes/${encodeURIComponent(heroName)}/${imageType}/600w.webp`;
        } else if (config.width <= 800) {
          return `${environment.apiUrl}/public/heroes/${encodeURIComponent(heroName)}/${imageType}/800w.webp`;
        } else if (config.width <= 1200) {
          return `${environment.apiUrl}/public/heroes/${encodeURIComponent(heroName)}/${imageType}/1200w.webp`;
        }
      }

      return `${environment.apiUrl}/public/heroes/${encodeURIComponent(heroName)}/${imageType}/image.webp`;
    }

    return `${environment.apiUrl}/public/heroes/${encodeURIComponent(heroName)}/icon/image.webp`;
  }

  if (config.src.startsWith('maps/')) {
    const parts = config.src.split('/');
    const mapName = parts[1];

    if (config.width) {
      if (config.width <= 400) {
        return `${environment.apiUrl}/public/maps/${encodeURIComponent(mapName)}/400w.webp`;
      } else if (config.width <= 600) {
        return `${environment.apiUrl}/public/maps/${encodeURIComponent(mapName)}/600w.webp`;
      } else {
        return `${environment.apiUrl}/public/maps/${encodeURIComponent(mapName)}/800w.webp`;
      }
    }

    return `${environment.apiUrl}/public/maps/${encodeURIComponent(mapName)}/image.webp`;
  }

  return config.src;
}

export const CUSTOM_IMAGE_LOADER = {
  provide: IMAGE_LOADER,
  useValue: customImageLoader
};

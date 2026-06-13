import type { ImageSourcePropType } from 'react-native';

/** Nature background images used behind key screens. */
export const backgrounds = {
  coast: require('../../assets/backgrounds/bg-coast.png') as ImageSourcePropType,
  forest: require('../../assets/backgrounds/bg-forest.png') as ImageSourcePropType,
  mountains: require('../../assets/backgrounds/bg-mountains.png') as ImageSourcePropType,
};

export type BackgroundKey = keyof typeof backgrounds;

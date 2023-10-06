import { Feature } from 'src/tools/docs/Feature';

export const sortFeatures = (featA: Feature, featB: Feature) => featA.displayName.localeCompare(featB.displayName);
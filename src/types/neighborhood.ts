export interface NeighborhoodProperties {
  '@id': string;
  name?: string;
  comuna?: string;
  admin_level?: string;
  boundary?: string;
  place?: string;
  type?: string;
  ref?: string;
  landuse?: string;
  is_in?: string;
  wikidata?: string;
  wikipedia?: string;
}

export interface NeighborhoodGeometry {
  type: 'Polygon' | 'Point' | 'MultiPolygon';
  coordinates: number[][][] | number[][]; // Polygon o MultiPolygon
}

export interface NeighborhoodFeature {
  type: 'Feature';
  properties: NeighborhoodProperties;
  geometry: NeighborhoodGeometry;
}

export interface NeighborhoodCollection {
  type: 'FeatureCollection';
  features: NeighborhoodFeature[];
}

export interface Zone {
  id: string;
  name: string;
  neighborhoodCount: number;
  neighborhoods: NeighborhoodFeature[];
}

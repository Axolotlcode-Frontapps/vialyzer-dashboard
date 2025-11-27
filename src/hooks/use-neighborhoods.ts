import geojsonUrl from '@/assets/utils/cali.geojson?url';
import { useEffect, useState } from 'react';
import type {
  NeighborhoodCollection,
  NeighborhoodFeature,
  Zone,
} from '@/types/neighborhood';
import {
  extractCaliBoundary,
  groupNeighborhoodByZone,
} from '@/lib/utils/neighborhood-tools';

export function useNeighborhoods() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [caliBoundary, setCaliBoundary] = useState<NeighborhoodFeature | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const loadNeighborhood = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(geojsonUrl, { signal });

        if (!res.ok) {
          throw new Error(
            `Failed to fetch geojson: ${res.status} ${res.statusText}`
          );
        }

        const geojson = (await res.json()) as NeighborhoodCollection;

        if (!geojson || !Array.isArray(geojson.features)) {
          throw new Error('GeoJSON invalid or missing features');
        }

        console.log('First feature:', geojson.features[0]);
        console.log(
          'First feature properties:',
          geojson.features[0]?.properties
        );
        console.log(
          'First feature geometry type:',
          geojson.features[0]?.geometry?.type
        );

        const caliFeature = extractCaliBoundary(geojson);

        if (caliFeature) setCaliBoundary(caliFeature);

        const processedZones = groupNeighborhoodByZone(geojson);
        setZones(processedZones);
        setError(null);
      } catch (e) {
        if ((e as any).name === 'AbortError') return;
        console.error('Error loading neighborhoods: ', e);
        setError(e instanceof Error ? e : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    loadNeighborhood();

    return () => controller.abort();
  }, []);

  return { zones, caliBoundary, isLoading, error };
}

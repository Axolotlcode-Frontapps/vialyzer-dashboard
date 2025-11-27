export type HeatmapType = 'accidents' | 'construction' | 'traffic' | 'combined';

export interface HeatmapConfig {
  radius: number;
  opacity: number;
  gradient?: string[];
  maxIntensity?: number;
  dissipating?: boolean;
}

export const HEATMAP_CONFIGS: Record<HeatmapType, HeatmapConfig> = {
  accidents: {
    radius: 200,
    opacity: 0.5,
    maxIntensity: 25,
    dissipating: true,
    gradient: [
      'rgba(0, 255, 255, 0)',
      'rgba(0, 255, 255, 0.3)',
      'rgba(0, 191, 255, 0.6)',
      'rgba(0, 127, 255, 0.8)',
      'rgba(255, 191, 0, 0.9)',
      'rgba(255, 127, 0, 1)',
      'rgba(255, 63, 0, 1)',
      'rgba(255, 0, 0, 1)',
      'rgba(191, 0, 0, 1)',
    ],
  },
  construction: {
    radius: 200,
    opacity: 0.5,
    maxIntensity: 25,
    dissipating: true,
    gradient: [
      'rgba(255, 255, 0, 0)',
      'rgba(255, 255, 0, 0.2)',
      'rgba(255, 223, 0, 0.5)',
      'rgba(255, 191, 0, 0.7)',
      'rgba(255, 159, 0, 0.9)',
      'rgba(255, 127, 0, 1)',
      'rgba(255, 95, 0, 1)',
      'rgba(255, 63, 0, 1)',
    ],
  },
  traffic: {
    radius: 200,
    opacity: 0.5,
    maxIntensity: 25,
    dissipating: true,
    gradient: [
      'rgba(0, 255, 0, 0)',
      'rgba(0, 255, 0, 0.3)',
      'rgba(127, 255, 0, 0.6)',
      'rgba(255, 255, 0, 0.7)',
      'rgba(255, 191, 0, 0.85)',
      'rgba(255, 127, 0, 1)',
      'rgba(255, 63, 0, 1)',
      'rgba(255, 0, 0, 1)',
    ],
  },
  combined: {
    radius: 200,
    opacity: 0.5,
    maxIntensity: 25,
    dissipating: true,
    gradient: [
      'rgba(102, 255, 0, 0)',
      'rgba(147, 255, 0, 0.3)',
      'rgba(193, 255, 0, 0.6)',
      'rgba(238, 255, 0, 0.75)',
      'rgba(244, 227, 0, 0.85)',
      'rgba(249, 198, 0, 0.95)',
      'rgba(255, 170, 0, 1)',
      'rgba(255, 113, 0, 1)',
      'rgba(255, 57, 0, 1)',
      'rgba(255, 0, 0, 1)',
    ],
  },
};

export interface HeatmapPoint {
  location: google.maps.LatLng;
  weight: number;
}

/**
 * Convierte datos de accidentes/construcción a puntos de heatmap
 */
export function convertToHeatmapData(
  items: Array<{
    location: { latitude: number; longitude: number };
    severity?: string;
  }>,
  defaultWeight: number = 1
): HeatmapPoint[] {
  // Mapeo de severidad string a peso numérico
  const severityToWeight: Record<string, number> = {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    CRITICAL: 4,
  };

  return items.map((item) => {
    const weight = item.severity
      ? severityToWeight[item.severity] || defaultWeight
      : defaultWeight;

    return {
      location: new google.maps.LatLng(
        item.location.latitude,
        item.location.longitude
      ),
      weight,
    };
  });
}

/**
 * Genera puntos de tráfico simulados basados en las ubicaciones de cámaras
 */
export function generateTrafficHeatmapData(
  cameras: Array<{ location: { latitude: string; longitude: string } }>,
  trafficIntensity: number = 3
): HeatmapPoint[] {
  const points: HeatmapPoint[] = [];

  cameras.forEach((camera) => {
    const lat = parseFloat(camera.location.latitude);
    const lng = parseFloat(camera.location.longitude);

    // Punto principal en la cámara
    points.push({
      location: new google.maps.LatLng(lat, lng),
      weight: trafficIntensity,
    });

    // Puntos adicionales alrededor para simular flujo de tráfico
    const radius = 0.0002; // ~200 metros
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI / 2) * i;
      const offsetLat = lat + radius * Math.cos(angle);
      const offsetLng = lng + radius * Math.sin(angle);

      points.push({
        location: new google.maps.LatLng(offsetLat, offsetLng),
        weight: trafficIntensity * 0.6,
      });
    }
  });

  return points;
}

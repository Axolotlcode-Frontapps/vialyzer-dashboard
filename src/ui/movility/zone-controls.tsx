import type { NeighborhoodFeature, Zone } from '@/logic/types/neighborhood';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

interface ZoneControlsProps {
  zones: Zone[];
  selectedZone: string | null;
  selectedNeighborhood: string | null;
  showCaliBoundary: boolean;
  onZoneSelect: (zoneId: string | null) => void;
  onNeighborhoodSelect: (neighborhood: NeighborhoodFeature | null) => void;
  onToggleCaliBoundary: () => void;
}

export function ZoneControls({
  zones,
  selectedZone,
  selectedNeighborhood,
  showCaliBoundary,
  onZoneSelect,
  onNeighborhoodSelect,
  onToggleCaliBoundary,
}: ZoneControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'zones' | 'neighborhoods'>('zones');

  const currentZone = zones.find((zone) => zone.id === selectedZone);
  const selectedNeighborhoodName = currentZone?.neighborhoods.find(
    (neighborhood) => neighborhood.properties['@id'] === selectedNeighborhood
  )?.properties.name;

  const handleZoneClick = (zoneId: string) => {
    onZoneSelect(zoneId);
    setViewMode('neighborhoods');
  };

  const handleNeighborhoodClick = (neighborhood: NeighborhoodFeature) => {
    onNeighborhoodSelect(neighborhood);
    setIsOpen(false);
  };

  const handleBack = () => {
    setViewMode('zones');
    onZoneSelect(null);
    onNeighborhoodSelect(null);
  };

  const handleClear = () => {
    onZoneSelect(null);
    onNeighborhoodSelect(null);
    setViewMode('zones');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`rounded-lg shadow-lg border p-3 transition-all flex items-center gap-2 ${
          selectedZone || selectedNeighborhood
            ? 'bg-primary text-white border-primary'
            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
        }`}
        aria-label="Zonas y Barrios"
      >
        <MapPin className="w-5 h-5" />
        <span className="text-sm font-medium hidden sm:inline">
          {selectedNeighborhoodName
            ? selectedNeighborhoodName
            : selectedZone
              ? currentZone?.name
              : 'Zonas'}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-0 left-full ml-2 bg-white rounded-lg shadow-2xl border border-gray-200 w-80 z-50 animate-fade-in max-h-[500px] flex flex-col">
            {/* Header */}
            <div className="p-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-700">
                  {viewMode === 'zones' ? 'Zonas de Cali' : currentZone?.name}
                </h3>
                {viewMode === 'neighborhoods' && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="text-gray-500 hover:text-gray-700 p-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1">
              {viewMode === 'zones' ? (
                <>
                  {/* Toggle para límite de Cali */}
                  <div className="p-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        Límite de Cali
                      </span>
                      <button
                        type="button"
                        onClick={onToggleCaliBoundary}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                          showCaliBoundary ? 'bg-primary' : 'bg-gray-200'
                        }`}
                        role="switch"
                        aria-checked={showCaliBoundary}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            showCaliBoundary ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Lista de zonas */}
                  <div className="p-2 space-y-1">
                    {zones.map((zone) => (
                      <button
                        key={zone.id}
                        type="button"
                        onClick={() => handleZoneClick(zone.id)}
                        className={`w-full text-left rounded-lg p-3 transition-all border ${
                          selectedZone === zone.id
                            ? 'border-primary bg-primary/5'
                            : 'border-transparent hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {zone.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {zone.neighborhoodCount} barrios
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="p-2 space-y-1">
                  {currentZone?.neighborhoods.map((neighborhood) => (
                    <button
                      key={neighborhood.properties['@id']}
                      type="button"
                      onClick={() => handleNeighborhoodClick(neighborhood)}
                      className={`w-full text-left rounded-lg p-3 transition-all border ${
                        selectedNeighborhood === neighborhood.properties['@id']
                          ? 'border-primary bg-primary/5'
                          : 'border-transparent hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-sm font-medium text-gray-900">
                        {neighborhood.properties.name}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {(selectedZone || selectedNeighborhood) && (
              <div className="p-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleClear}
                  className="w-full px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Limpiar Selección
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

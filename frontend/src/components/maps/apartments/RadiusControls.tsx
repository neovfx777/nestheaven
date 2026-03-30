import { useApartmentMapSearchStore } from '../../../stores/apartmentMapSearchStore';

export function RadiusControls() {
  const radiusKm = useApartmentMapSearchStore((s) => s.radiusKm);
  const setRadiusKm = useApartmentMapSearchStore((s) => s.setRadiusKm);

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/90 p-3 shadow-md ring-1 ring-black/5 backdrop-blur">
      <div className="min-w-[110px]">
        <div className="text-xs font-medium text-gray-500">Radius</div>
        <div className="text-sm font-semibold text-gray-900">{radiusKm.toFixed(1)} km</div>
      </div>

      <input
        type="range"
        min={0.5}
        max={25}
        step={0.5}
        value={radiusKm}
        onChange={(e) => setRadiusKm(Number(e.target.value))}
        className="h-2 w-full cursor-pointer accent-yellow-400"
      />

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setRadiusKm(radiusKm - 0.5)}
          className="h-9 w-9 rounded-xl border border-gray-200 bg-white text-lg leading-none text-gray-700 shadow-sm transition hover:bg-gray-50"
          aria-label="Decrease radius"
        >
          −
        </button>
        <button
          type="button"
          onClick={() => setRadiusKm(radiusKm + 0.5)}
          className="h-9 w-9 rounded-xl border border-gray-200 bg-white text-lg leading-none text-gray-700 shadow-sm transition hover:bg-gray-50"
          aria-label="Increase radius"
        >
          +
        </button>
      </div>
    </div>
  );
}


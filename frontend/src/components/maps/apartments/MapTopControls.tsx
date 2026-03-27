import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, Map as MapIcon, SlidersHorizontal } from 'lucide-react';
import { useApartmentMapSearchStore } from '../../../stores/apartmentMapSearchStore';

type ViewMode = 'gallery' | 'map' | 'filters';

function ViewToggleButton({
  active,
  label,
  icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition',
        active
          ? 'bg-yellow-400 text-black shadow-sm'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
      ].join(' ')}
    >
      <span className={active ? 'text-black' : 'text-gray-600'}>{icon}</span>
      {label}
    </button>
  );
}

export function MapTopControls({
  viewMode = 'map',
  onOpenFilters,
}: {
  viewMode?: ViewMode;
  onOpenFilters?: () => void;
}) {
  const navigate = useNavigate();
  const search = useApartmentMapSearchStore((s) => s.search);
  const setSearch = useApartmentMapSearchStore((s) => s.setSearch);

  const placeholder = useMemo(() => "Toshkent bo'yicha qidirish...", []);

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex w-full flex-col gap-3 rounded-2xl bg-white/90 p-3 shadow-md ring-1 ring-black/5 backdrop-blur md:flex-row md:items-center">
        <div className="flex w-full items-center justify-center gap-2 md:w-auto md:justify-start">
          <ViewToggleButton
            active={viewMode === 'gallery'}
            label="Galereya"
            icon={<LayoutGrid className="h-4 w-4" />}
            onClick={() => navigate('/apartments')}
          />
          <ViewToggleButton
            active={viewMode === 'map'}
            label="Xaritada"
            icon={<MapIcon className="h-4 w-4" />}
            onClick={() => navigate('/apartments/map')}
          />
          <ViewToggleButton
            active={viewMode === 'filters'}
            label="Filtrlar"
            icon={<SlidersHorizontal className="h-4 w-4" />}
            onClick={() => onOpenFilters?.()}
          />
        </div>

        <div className="flex-1">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={placeholder}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200"
          />
        </div>
      </div>
    </div>
  );
}

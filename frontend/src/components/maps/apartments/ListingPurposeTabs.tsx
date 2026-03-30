import { ListingPurpose, useApartmentMapSearchStore } from '../../../stores/apartmentMapSearchStore';

const TABS: Array<{ id: ListingPurpose; label: string }> = [
  { id: 'sale', label: 'Sotuv' },
  { id: 'rent', label: 'Ijara' },
  { id: 'daily', label: 'Kunlik' },
  { id: 'buyers', label: 'Xaridorlar' },
];

export function ListingPurposeTabs() {
  const purpose = useApartmentMapSearchStore((s) => s.purpose);
  const setPurpose = useApartmentMapSearchStore((s) => s.setPurpose);

  return (
    <div className="flex items-center gap-2 overflow-x-auto rounded-full bg-white/90 p-1 shadow-sm ring-1 ring-black/5 backdrop-blur">
      {TABS.map((tab) => {
        const active = tab.id === purpose;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setPurpose(tab.id)}
            className={[
              'whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition',
              active
                ? 'bg-yellow-400 text-black shadow-sm'
                : 'text-gray-700 hover:bg-gray-100',
            ].join(' ')}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}


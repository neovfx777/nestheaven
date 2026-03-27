import { Link } from 'react-router-dom';
import { Apartment } from '../../../api/apartments';

function formatPrice(price: number) {
  try {
    return new Intl.NumberFormat('ru-RU').format(price);
  } catch {
    return String(price);
  }
}

export function SelectedApartmentCard({
  apartment,
  onClose,
}: {
  apartment: Apartment;
  onClose?: () => void;
}) {
  const title =
    apartment.title?.uz || apartment.title?.ru || apartment.title?.en || apartment.titleUz || 'Apartment';

  return (
    <div className="pointer-events-auto w-full max-w-md rounded-2xl bg-white p-4 shadow-lg ring-1 ring-black/5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-gray-900">{title}</div>
          <div className="mt-1 text-xs text-gray-500">
            {apartment.rooms} xona • {Math.round(apartment.area)} m² • {apartment.complex?.city || 'Tashkent'}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="rounded-xl bg-yellow-400 px-3 py-1.5 text-sm font-bold text-black">
            {formatPrice(apartment.price)}
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-xl border border-gray-200 bg-white px-2.5 py-2 text-xs font-semibold text-gray-600 shadow-sm transition hover:bg-gray-50"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="text-xs text-gray-500">
          {apartment.complex?.title || apartment.complex?.name?.uz || apartment.address || ''}
        </div>
        <Link
          to={`/apartments/${apartment.id}`}
          className="inline-flex items-center rounded-xl bg-black px-3 py-2 text-xs font-semibold text-white transition hover:bg-gray-800"
        >
          Ko'rish
        </Link>
      </div>
    </div>
  );
}

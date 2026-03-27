import L from 'leaflet';

export function formatPriceShort(price: number) {
  if (!Number.isFinite(price)) return '';
  if (price >= 1_000_000_000) return `${Math.round(price / 1_000_000_000)}B`;
  if (price >= 1_000_000) return `${Math.round(price / 1_000_000)}M`;
  if (price >= 1_000) return `${Math.round(price / 1_000)}k`;
  return `${Math.round(price)}`;
}

export function createPriceMarkerIcon({
  price,
  selected,
  hovered,
}: {
  price: number;
  selected: boolean;
  hovered: boolean;
}) {
  const label = formatPriceShort(price);

  const cls = [
    'nh-price-marker',
    selected ? 'nh-price-marker--selected' : '',
    hovered ? 'nh-price-marker--hovered' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return L.divIcon({
    className: cls,
    html: `<span class="nh-price-marker__label">${label}</span>`,
    iconSize: [1, 1],
    iconAnchor: [0, 0],
  });
}


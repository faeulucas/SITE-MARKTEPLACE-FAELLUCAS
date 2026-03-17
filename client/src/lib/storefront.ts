export function getStorefrontHref(
  sellerId?: number | null,
  fallbackListingId?: number | null
) {
  if (sellerId) return `/loja/${sellerId}`;
  if (fallbackListingId) return `/anuncio/${fallbackListingId}`;
  return "/lojas";
}

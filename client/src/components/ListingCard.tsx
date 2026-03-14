import { Link } from "wouter";
import { Heart, MapPin, Eye, Zap, BadgeCheck, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ListingCardProps {
  id: number;
  title: string;
  price?: string | null;
  priceType?: string | null;
  cityId?: number | null;
  neighborhood?: string | null;
  isBoosted?: boolean | null;
  isFeatured?: boolean | null;
  viewCount?: number | null;
  createdAt: Date | string;
  images?: { url: string; isPrimary?: boolean | null }[];
  seller?: { name?: string | null; isVerified?: boolean | null | undefined };
  categoryName?: string;
  type?: string | null;
  onFavorite?: (id: number) => void;
  isFavorited?: boolean | null;
  cityName?: string;
}

const TYPE_LABELS: Record<string, string> = {
  product: "Produto",
  service: "Serviço",
  vehicle: "Veículo",
  property: "Imóvel",
  food: "Comida",
  job: "Emprego",
};

export default function ListingCard({
  id, title, price, priceType, cityId, neighborhood, isBoosted, isFeatured,
  viewCount, createdAt, images, seller, categoryName, type, onFavorite, isFavorited, cityName
}: ListingCardProps) {
  const primaryImage = images?.find(i => i.isPrimary) || images?.[0];

  const formatPrice = () => {
    if (!price || priceType === "free") return "Grátis";
    if (priceType === "on_request") return "Sob consulta";
    if (priceType === "negotiable") return `R$ ${Number(price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} (negociável)`;
    return `R$ ${Number(price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  };

  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: ptBR });

  return (
    <div className={`listing-card group relative ${isBoosted ? "boost-pulse ring-2 ring-amber-400" : ""}`}>
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {isBoosted && (
          <span className="flex items-center gap-1 bg-amber-400 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md">
            <Zap className="w-3 h-3" /> DESTAQUE
          </span>
        )}
        {type && (
          <span className="bg-blue-600 text-white text-xs font-medium px-2 py-0.5 rounded-full">
            {TYPE_LABELS[type] || type}
          </span>
        )}
      </div>

      {/* Favorite button */}
      <button
        onClick={(e) => { e.preventDefault(); onFavorite?.(id); }}
        className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:scale-110 transition-transform"
      >
        <Heart className={`w-4 h-4 ${isFavorited ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
      </button>

      <Link href={`/anuncio/${id}`}>
        {/* Image */}
        <div className="aspect-[4/3] overflow-hidden bg-gray-100">
          {primaryImage ? (
            <img
              src={primaryImage.url}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="text-blue-300 text-4xl font-bold font-display">
                {title.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3">
          {/* Category */}
          {categoryName && (
            <span className="text-xs text-blue-600 font-medium">{categoryName}</span>
          )}

          {/* Title */}
          <h3 className="font-semibold text-gray-900 text-sm mt-0.5 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>

          {/* Price */}
          <p className="text-base font-bold mt-1" style={{ color: "oklch(0.48 0.22 255)" }}>
            {formatPrice()}
          </p>

          {/* Location & time */}
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{neighborhood || cityName || "Norte Pioneiro"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{timeAgo}</span>
            </div>
          </div>

          {/* Seller */}
          {seller && (
            <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-100">
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                {seller.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <span className="text-xs text-gray-600 truncate">{seller.name || "Anunciante"}</span>
              {seller.isVerified && <BadgeCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
              {viewCount !== undefined && (
                <div className="ml-auto flex items-center gap-0.5 text-gray-400">
                  <Eye className="w-3 h-3" />
                  <span className="text-xs">{viewCount}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}

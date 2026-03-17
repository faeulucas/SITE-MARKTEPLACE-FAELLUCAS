import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  BadgeCheck,
  Clock3,
  ExternalLink,
  MapPin,
  MessageCircle,
  Phone,
  Store,
} from "lucide-react";
import { Link, useParams } from "wouter";

export default function StorefrontPage() {
  const { sellerId } = useParams<{ sellerId: string }>();
  const sellerIdAsNumber = Number(sellerId);
  const isValidSellerId = Number.isFinite(sellerIdAsNumber) && sellerIdAsNumber > 0;
  const { data, isLoading } = trpc.public.sellerProfile.useQuery({
    sellerId: sellerIdAsNumber,
  }, {
    enabled: isValidSellerId,
  });
  const { data: cities } = trpc.public.cities.useQuery();

  const seller = data?.seller;
  const listings = data?.listings ?? [];
  const cityName =
    cities?.find(city => city.id === seller?.cityId)?.name ?? "Norte Pioneiro";
  const locationLabel = [seller?.neighborhood, cityName].filter(Boolean).join(", ");
  const displayName =
    seller?.personType === "pj"
      ? seller.companyName || seller.name || "Loja"
      : seller?.name || "Anunciante";
  const whatsappHref = seller?.whatsapp
    ? `https://wa.me/55${seller.whatsapp.replace(/\D/g, "")}`
    : null;
  const phoneDigits =
    seller?.phone?.replace(/\D/g, "") ||
    seller?.whatsapp?.replace(/\D/g, "") ||
    "";
  const phoneHref = phoneDigits ? `tel:${phoneDigits}` : null;
  const joinedLabel = seller?.createdAt
    ? formatDistanceToNow(new Date(seller.createdAt), {
        addSuffix: true,
        locale: ptBR,
      })
    : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-56 rounded-[32px] bg-slate-200" />
            <div className="h-8 w-2/3 rounded bg-slate-200" />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-72 rounded-[28px] bg-slate-200" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isValidSellerId || !data || !seller) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container py-20 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100">
            <Store className="h-10 w-10 text-slate-400" />
          </div>
          <h1 className="mt-6 font-display text-3xl font-black text-slate-900">
            Loja nao encontrada
          </h1>
          <p className="mt-3 text-slate-500">
            Essa vitrine nao esta disponivel ou ainda nao possui anuncios publicos.
          </p>
          <Link href="/lojas">
            <Button className="mt-6 rounded-2xl bg-slate-900 text-white hover:bg-slate-800">
              Ver outras lojas
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff8ef_0%,#f8fafc_32%,#f8fafc_100%)]">
      <Header />
      <main className="container py-6">
        <div className="mb-4 flex items-center gap-2 overflow-hidden text-sm text-slate-500">
          <Link href="/" className="hover:text-blue-600">
            Inicio
          </Link>
          <span>/</span>
          <Link href="/lojas" className="hover:text-blue-600">
            Lojas
          </Link>
          <span>/</span>
          <span className="truncate font-medium text-slate-900">{displayName}</span>
        </div>

        <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
          <div className="relative h-48 bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_42%,#f97316_125%)] sm:h-64">
            {seller.bannerUrl ? (
              <img
                src={seller.bannerUrl}
                alt={displayName}
                className="h-full w-full object-cover"
              />
            ) : null}
            <div className="absolute inset-0 bg-slate-900/25" />
          </div>

          <div className="relative px-5 pb-6 sm:px-8">
            <div className="-mt-14 flex flex-col gap-5 sm:-mt-16 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[28px] border-4 border-white bg-white text-3xl font-black text-slate-700 shadow-lg sm:h-28 sm:w-28">
                  {seller.avatar ? (
                    <img
                      src={seller.avatar}
                      alt={displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    displayName.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="break-words font-display text-3xl font-black text-slate-900 sm:text-4xl">
                      {displayName}
                    </h1>
                    {seller.isVerified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                        <BadgeCheck className="h-4 w-4" />
                        Verificada
                      </span>
                    )}
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                        seller.isOpenNow
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {seller.isOpenNow ? "Aberta agora" : "Fora do horario"}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500">
                    {locationLabel && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-orange-500" />
                        {locationLabel}
                      </span>
                    )}
                    {joinedLabel && (
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 className="h-4 w-4 text-blue-500" />
                        No portal {joinedLabel}
                      </span>
                    )}
                  </div>
                  {seller.bio && (
                    <p className="mt-4 max-w-3xl whitespace-pre-wrap text-sm leading-7 text-slate-600 sm:text-base">
                      {seller.bio}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {whatsappHref && (
                  <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full rounded-2xl bg-green-500 text-white hover:bg-green-600">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      WhatsApp
                    </Button>
                  </a>
                )}
                {phoneHref && (
                  <a href={phoneHref}>
                    <Button className="w-full rounded-2xl bg-slate-900 text-white hover:bg-slate-800">
                      <Phone className="mr-2 h-4 w-4" />
                      Ligar
                    </Button>
                  </a>
                )}
                {locationLabel && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationLabel)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sm:col-span-2"
                  >
                    <Button variant="outline" className="w-full rounded-2xl">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Abrir localizacao
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-600">
                Vitrine
              </p>
              <h2 className="font-display text-3xl font-black text-slate-900">
                Produtos e anuncios da loja
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {listings.length} item(ns) publicado(s) no portal.
              </p>
            </div>
          </div>

          {listings.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {listings.map(listing => (
                <ListingCard
                  key={listing.id}
                  {...listing}
                  cityName={cityName}
                  seller={{
                    name: displayName,
                    isVerified: seller.isVerified,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-slate-200 bg-white p-12 text-center">
              <Store className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-4 text-slate-500">
                Esta loja ainda nao publicou produtos ou anuncios visiveis.
              </p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

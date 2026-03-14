import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import {
  BadgeCheck,
  Building2,
  ChevronRight,
  MapPin,
  MessageCircle,
  Store,
} from "lucide-react";
import { Link, useParams } from "wouter";

export default function StorefrontPage() {
  const { sellerId } = useParams<{ sellerId: string }>();
  const numericSellerId = Number(sellerId);

  const { data, isLoading } = trpc.public.sellerProfile.useQuery(
    { sellerId: numericSellerId },
    { enabled: Number.isFinite(numericSellerId) }
  );
  const { data: categories } = trpc.public.categories.useQuery();
  const { data: cities } = trpc.public.cities.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-64 rounded-[28px] bg-gray-200" />
            <div className="h-10 w-1/2 rounded bg-gray-200" />
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-56 rounded-2xl bg-gray-200" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!data?.seller) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container py-20 text-center">
          <Store className="mx-auto h-12 w-12 text-gray-300" />
          <h1 className="mt-4 font-display text-2xl font-bold text-gray-900">
            Vitrine nao encontrada
          </h1>
          <p className="mt-2 text-gray-500">
            Essa loja ainda nao tem uma vitrine publica disponivel.
          </p>
          <Link href="/busca">
            <Button className="mt-6 rounded-2xl bg-brand-gradient text-white">
              Voltar para a busca
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const { seller, listings } = data;
  const displayName =
    seller.personType === "pj"
      ? seller.companyName || seller.name || "Loja"
      : seller.name || "Anunciante";
  const sellerInitial = displayName.charAt(0).toUpperCase();
  const coverImage =
    listings.flatMap(item => item.images ?? []).find(image => image.isPrimary)
      ?.url ||
    listings.flatMap(item => item.images ?? [])[0]?.url ||
    null;
  const cityName =
    cities?.find(city => city.id === seller.cityId)?.name || "Norte Pioneiro";
  const whatsappHref = seller.whatsapp
    ? `https://wa.me/55${seller.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Ola! Vi sua vitrine no Norte Vivo e quero saber mais sobre seus produtos.`
      )}`
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container py-6">
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-blue-600">
            Inicio
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-medium text-gray-900">{displayName}</span>
        </div>

        <section className="overflow-hidden rounded-[28px] bg-white shadow-sm">
          <div className="relative h-52 bg-gray-100 sm:h-64">
            {coverImage ? (
              <img
                src={coverImage}
                alt={displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-hero-gradient" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-900/10 to-transparent" />
          </div>

          <div className="relative px-5 pb-6 sm:px-8">
            <div className="-mt-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[28px] border-4 border-white bg-white text-3xl font-black text-blue-700 shadow-lg">
                  {seller.avatar ? (
                    <img
                      src={seller.avatar}
                      alt={displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    sellerInitial
                  )}
                </div>
                <div className="pb-2">
                  <div className="flex items-center gap-2">
                    <h1 className="font-display text-2xl font-black text-gray-900 sm:text-3xl">
                      {displayName}
                    </h1>
                    {seller.isVerified && (
                      <BadgeCheck className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      Vitrine publica da loja
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {cityName}
                    </span>
                  </div>
                </div>
              </div>

              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="rounded-2xl bg-green-500 px-6 text-white hover:bg-green-600">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Chamar no WhatsApp
                  </Button>
                </a>
              )}
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
              <div className="rounded-[24px] bg-gray-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                  Sobre a loja
                </p>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  {seller.bio?.trim() ||
                    "Esta loja faz parte do portal Norte Vivo e usa esta vitrine para mostrar seus produtos, servicos e oportunidades da regiao."}
                </p>
              </div>
              <div className="rounded-[24px] bg-blue-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                  Presenca no portal
                </p>
                <div className="mt-3 space-y-2 text-sm text-gray-700">
                  <p>{listings.length} item(ns) publicado(s)</p>
                  <p>Membro desde {new Date(seller.createdAt).getFullYear()}</p>
                  <p>Perfil publico da loja ativo</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-gray-900">
                Produtos e anuncios da loja
              </h2>
              <p className="text-sm text-gray-500">
                Tudo o que {displayName} publicou dentro do portal.
              </p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-600 shadow-sm">
              {listings.length} item(ns)
            </span>
          </div>

          {listings.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {listings.map(item => (
                <ListingCard
                  key={item.id}
                  {...item}
                  cityName={cities?.find(city => city.id === item.cityId)?.name}
                  categoryName={
                    categories?.find(
                      category => category.id === item.categoryId
                    )?.name
                  }
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[24px] bg-white p-10 text-center shadow-sm">
              <Store className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-4 text-gray-500">
                Esta loja ainda nao publicou itens na vitrine.
              </p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

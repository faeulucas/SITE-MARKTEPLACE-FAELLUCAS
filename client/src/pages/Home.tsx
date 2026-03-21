import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { LOGIN_ROUTE } from "@/const";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import ListingCardCompact from "@/components/ListingCardCompact";
import AppInstallBanner from "@/components/AppInstallBanner";
import { Button } from "@/components/ui/button";
import { getStorefrontHref } from "@/lib/storefront";
import {
  Ambulance,
  ArrowRight,
  BadgeCheck,
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  HeartHandshake,
  Home as HomeIcon,
  LayoutGrid,
  MapPin,
  Percent,
  Phone,
  Search,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Star,
  Store,
  Stethoscope,
  Utensils,
  Wrench,
  Zap,
} from "lucide-react";

type HomeHighlightListing = {
  id: number;
  userId: number;
  title: string;
  type?: string | null;
  createdAt?: Date | string;
  cityId?: number | null;
  categoryId?: number | null;
  subcategory?: string | null;
  whatsapp?: string | null;
  neighborhood?: string | null;
  price?: string | null;
  priceType?: string | null;
  extraDataJson?: string | null;
  viewCount?: number | null;
  images?: { url: string; isPrimary?: boolean | null }[];
  seller?: {
    id?: number;
    name?: string | null;
    companyName?: string | null;
    avatar?: string | null;
    bannerUrl?: string | null;
    whatsapp?: string | null;
    cityId?: number | null;
    neighborhood?: string | null;
    isVerified?: boolean | null;
    isOpenNow?: boolean | null;
  } | null;
};

function parseHomeExtraData(value?: string | null) {
  if (!value) return {};
  try {
    return JSON.parse(value) as Record<string, string>;
  } catch {
    return {};
  }
}

const GUIDE_SHORTCUTS = [
  {
    title: "Saúde",
    description: "Hospitais, clínicas e farmácias",
    href: "/busca?q=saude",
    icon: Stethoscope,
    tone: "bg-emerald-50 text-emerald-700",
  },
  {
    title: "Segurança",
    description: "Polícia, apoio e serviços úteis",
    href: "/busca?q=seguranca",
    icon: Shield,
    tone: "bg-blue-50 text-blue-700",
  },
  {
    title: "Emergências",
    description: "Atalhos rápidos para urgências",
    href: "/busca?q=emergencia",
    icon: Ambulance,
    tone: "bg-rose-50 text-rose-700",
  },
  {
    title: "Oficinas",
    description: "Mecânicos, eletricistas e reparos",
    href: "/busca?q=oficina",
    icon: Wrench,
    tone: "bg-amber-50 text-amber-700",
  },
  {
    title: "Serviços",
    description: "Prestadores e negócios locais",
    href: "/busca?q=servicos",
    icon: HeartHandshake,
    tone: "bg-violet-50 text-violet-700",
  },
  {
    title: "Empresas",
    description: "Lojas, comércios e contatos úteis",
    href: "/lojas",
    icon: Building2,
    tone: "bg-slate-100 text-slate-700",
  },
];

const PILLARS = [
  {
    label: "Guia Local",
    description: "Encontre telefones, serviços e empresas da sua cidade.",
    href: "/guia",
    emoji: "🧭",
    badge: "Informativo local",
    tone:
      "border-blue-200 bg-white text-slate-900 hover:border-blue-300 hover:shadow-lg",
  },
  {
    label: "Marketplace Regional",
    description: "Descubra produtos, ofertas e oportunidades perto de você.",
    href: "/busca",
    emoji: "🛍️",
    badge: "Compra e venda",
    tone:
      "border-orange-200 bg-orange-500 text-white hover:bg-orange-600 hover:shadow-lg",
  },
  {
    label: "Crie sua Loja",
    description: "Monte sua vitrine online e apareça para novos clientes.",
    href: "/lojas",
    emoji: "🏪",
    badge: "Para quem não tem site",
    tone:
      "border-slate-800 bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg",
  },
];

const QUICK_SEGMENTS = [
  { label: "Seja d+", icon: "🩷" },
  { label: "Lanches", icon: "🥪" },
  { label: "Pizza", icon: "🍕" },
  { label: "Burguer", icon: "🍔" },
  { label: "Porções", icon: "🍟" },
  { label: "Marmita", icon: "🍱" },
  { label: "Sushi", icon: "🍣" },
];

const MOBILE_TABS = [
  { label: "Tudo", href: "/", emoji: "✨" },
  { label: "Restaurantes", href: "/busca?type=food", emoji: "🍽️" },
  { label: "Mercados", href: "/busca?q=mercado", emoji: "🛒" },
  { label: "Lojas", href: "/lojas", emoji: "🏪" },
  { label: "Serviços", href: "/busca?q=servicos", emoji: "🛠️" },
  { label: "Guia local", href: "/guia", emoji: "🧭" },
];

const CATEGORY_SHORTCUTS = [
  { label: "Promoções", href: "/busca?q=promo", emoji: "🧧", tone: "bg-orange-50 text-orange-700" },
  { label: "Delivery", href: "/busca?type=food", emoji: "🍽️", tone: "bg-rose-50 text-rose-700" },
  { label: "Mercado", href: "/busca?q=mercado", emoji: "🛒", tone: "bg-amber-50 text-amber-700" },
  { label: "Lojas", href: "/lojas", emoji: "🏬", tone: "bg-indigo-50 text-indigo-700" },
  { label: "Serviços", href: "/busca?q=servicos", emoji: "🛠️", tone: "bg-emerald-50 text-emerald-700" },
  { label: "Imóveis", href: "/busca?type=property", emoji: "🏡", tone: "bg-blue-50 text-blue-700" },
  { label: "Eventos", href: "/busca?q=eventos", emoji: "📅", tone: "bg-purple-50 text-purple-700" },
  { label: "Empregos", href: "/busca?type=job", emoji: "💼", tone: "bg-cyan-50 text-cyan-700" },
];

const FILTER_CHIPS = ["Filtros", "Entrega grátis", "Promoções"];

const PROMO_BANNERS = [
  {
    id: "club-cupom",
    title: "clube de cupons",
    subtitle: "receba cupons exclusivos e economize todo mês!",
    cta: "ver ofertas",
    href: "/busca?q=promo",
  },
  {
    id: "mega-off",
    title: "35% OFF",
    subtitle: "os rangos que são sucesso com cupom: ESTRELAS",
    cta: "usar cupom",
    href: "/busca?q=estrelas",
  },
];

const COLLECTION_CARD = {
  title: "coleções de lojas e promos",
  href: "/busca?q=promocoes",
  cardTitle: "Promos que adoramos",
  cardSubtitle: "sei que seu hobby é pagar no precinho",
};
function isServiceProviderListing(
  item: HomeHighlightListing,
  categoryName?: string
) {
  const haystack = [categoryName, item.subcategory, item.title]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return item.whatsapp != null || item.seller?.whatsapp != null
    ? item.title.toLowerCase().includes("serv") ||
        haystack.includes("serv") ||
        haystack.includes("oficina") ||
        haystack.includes("manut") ||
        haystack.includes("assist") ||
        haystack.includes("instal") ||
        haystack.includes("tecnico") ||
        haystack.includes("eletric") ||
        haystack.includes("encan") ||
        haystack.includes("limpeza") ||
        haystack.includes("delivery") ||
        haystack.includes("saude") ||
        haystack.includes("beleza")
    : false;
}

function isFoodListing(item: HomeHighlightListing) {
  const haystack = [item.title, item.subcategory]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    item.type === "food" ||
    haystack.includes("lanche") ||
    haystack.includes("pizza") ||
    haystack.includes("hamb") ||
    haystack.includes("hamburguer") ||
    haystack.includes("hamburger") ||
    haystack.includes("espet") ||
    haystack.includes("pastel") ||
    haystack.includes("marmita") ||
    haystack.includes("porcao") ||
    haystack.includes("combo") ||
    haystack.includes("acai") ||
    haystack.includes("coxinha") ||
    haystack.includes("hot dog") ||
    haystack.includes("cachorro") ||
    haystack.includes("batata") ||
    haystack.includes("refeicao") ||
    haystack.includes("prato")
  );
}

function isJobListing(item: HomeHighlightListing, categoryName?: string) {
  const haystack = [item.title, item.subcategory, categoryName]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    item.type === "job" ||
    haystack.includes("vaga") ||
    haystack.includes("emprego") ||
    haystack.includes("contrata") ||
    haystack.includes("freela") ||
    haystack.includes("diarista") ||
    haystack.includes("estagio")
  );
}

function isEventListing(item: HomeHighlightListing, categoryName?: string) {
  const haystack = [item.title, item.subcategory, categoryName]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    haystack.includes("evento") ||
    haystack.includes("show") ||
    haystack.includes("feira") ||
    haystack.includes("festival") ||
    haystack.includes("rodeio") ||
    haystack.includes("festa") ||
    haystack.includes("encontro")
  );
}

function formatListingPrice(price?: string | null, priceType?: string | null) {
  if (!price || priceType === "free") return "Grátis";
  if (priceType === "on_request") return "Sob consulta";

  const formatted = `R$ ${Number(price).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
  })}`;

  if (priceType === "negotiable") return formatted;

  return formatted;
}

function getPriceTypeLabel(priceType?: string | null) {
  if (priceType === "negotiable") return "Negociável";
  if (priceType === "on_request") return "Sob consulta";
  if (priceType === "free") return "Grátis";
  return "Preço fixo";
}

function SectionHeader({
  eyebrow,
  title,
  description,
  actionHref,
  actionLabel,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:mb-7 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-600">
          {eyebrow}
        </p>
        <h2 className="mt-2 font-display text-2xl font-black text-slate-900 sm:text-3xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
            {description}
          </p>
        ) : null}
      </div>

      {actionHref && actionLabel ? (
        <Link href={actionHref}>
          <Button variant="outline" className="rounded-2xl">
            {actionLabel}
          </Button>
        </Link>
      ) : null}
    </div>
  );
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [selectedCity, setSelectedCity] = useState<number | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<number | "all">(
    "all"
  );

  const { data: categories } = trpc.public.categories.useQuery();
  const { data: cities } = trpc.public.cities.useQuery();
  const { data: featured } = trpc.public.featuredListings.useQuery({
    limit: 8,
    cityId: selectedCity ?? undefined,
  });
  const { data: recent } = trpc.public.recentListings.useQuery({
    limit: 16,
    cityId: selectedCity ?? undefined,
  });
  const { data: deliveryListings } = trpc.public.listingsByCategory.useQuery({
    categorySlug: "delivery",
    limit: 6,
  });

  const featuredListings = (featured ?? []) as HomeHighlightListing[];
  const recentListings = (recent ?? []) as HomeHighlightListing[];
  const selectedCityName =
    cities?.find((city) => city.id === selectedCity)?.name ?? "sua cidade";
  const primaryListings =
    featuredListings.length > 0 ? featuredListings : recentListings;
  const visibleListings =
    activeCategoryId === "all"
      ? primaryListings
      : primaryListings.filter((item) => item.categoryId === activeCategoryId);
  const openNearby = visibleListings
    .filter((item) => item.seller?.isOpenNow)
    .slice(0, 12);

  const companyHighlights = useMemo(
    () =>
      (featuredListings.length ? featuredListings : recentListings)
        .reduce<HomeHighlightListing[]>((acc, item) => {
          const key = (
            item.seller?.companyName ||
            item.seller?.name ||
            item.title
          )
            .trim()
            .toLowerCase();

          if (
            !acc.some((existing) => {
              const existingKey = (
                existing.seller?.companyName ||
                existing.seller?.name ||
                existing.title
              )
                .trim()
                .toLowerCase();

              return existingKey === key;
            })
          ) {
            acc.push(item);
          }

          return acc;
        }, [])
        .slice(0, 8),
    [featuredListings, recentListings]
  );

  const serviceProviders = useMemo(() => {
    return (featuredListings.length ? featuredListings : recentListings)
      .filter((item) =>
        isServiceProviderListing(
          item,
          categories?.find((category) => category.id === item.categoryId)?.name
        )
      )
      .reduce<HomeHighlightListing[]>((acc, item) => {
        const key = (
          item.seller?.companyName ||
          item.seller?.name ||
          item.title
        )
          .trim()
          .toLowerCase();

        if (
          !acc.some((existing) => {
            const existingKey = (
              existing.seller?.companyName ||
              existing.seller?.name ||
              existing.title
            )
              .trim()
              .toLowerCase();

            return existingKey === key;
          })
        ) {
          acc.push(item);
        }

        return acc;
      }, [])
      .slice(0, 8);
  }, [categories, featuredListings, recentListings]);

  const foodListings = useMemo(() => {
    const source = (deliveryListings ?? []) as HomeHighlightListing[];
    return source
      .filter((item) => isFoodListing(item) && item.seller?.isOpenNow)
      .slice(0, 6);
  }, [deliveryListings]);

  const jobListings = useMemo(() => {
    return recentListings
      .filter((item) =>
        isJobListing(
          item,
          categories?.find((category) => category.id === item.categoryId)?.name
        )
      )
      .slice(0, 4);
  }, [categories, recentListings]);

  const eventListings = useMemo(() => {
    return recentListings
      .filter((item) =>
        isEventListing(
          item,
          categories?.find((category) => category.id === item.categoryId)?.name
        )
      )
      .slice(0, 4);
  }, [categories, recentListings]);

  const handleSearch = (query: string) => {
    navigate(`/busca?q=${encodeURIComponent(query)}&city=${selectedCity || ""}`);
  };

  const cityNameById = (cityId?: number | null) =>
    cities?.find((city) => city.id === cityId)?.name || "Norte Pioneiro";

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_18%,#f8fafc_100%)]">
      <AppInstallBanner
        title="Use o aplicativo"
        subtitle="Acesso rápido e fácil no app"
        ctaLabel="Abrir"
        ctaHref="/app"
      />

      <div className="hidden md:block">
        <Header
          selectedCity={selectedCity}
          onCityChange={setSelectedCity}
          onSearch={handleSearch}
        />
      </div>

      <main className="pb-24 md:pb-0">
        <div className="md:hidden">
          <section className="border-b border-slate-100 bg-white/95 backdrop-blur">
            <div className="container space-y-3 pt-3 pb-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <MapPin className="h-4 w-4 text-orange-500" />
                  <span>{selectedCityName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={isAuthenticated ? "/favoritos" : LOGIN_ROUTE}>
                    <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm">
                      <span className="text-base">⭐</span>
                    </button>
                  </Link>
                  <Link href={isAuthenticated ? "/anunciante" : LOGIN_ROUTE}>
                    <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm">
                      <span className="text-base">🧭</span>
                    </button>
                  </Link>
                  <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm">
                    <span className="text-base">🔔</span>
                  </button>
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {MOBILE_TABS.map((tab) => (
                  <Link
                    key={tab.label}
                    href={tab.href}
                    className="flex min-w-[96px] items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm transition hover:border-orange-200 hover:bg-orange-50"
                  >
                    <span className="text-base">{tab.emoji}</span>
                    <span className="truncate">{tab.label}</span>
                  </Link>
                ))}
              </div>

              <button
                className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-800 shadow-sm"
                onClick={() => handleSearch("")}
              >
                <Search className="h-4 w-4 text-orange-600" />
                Buscar em tudo
              </button>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {["Favoritos", "Cupons", "Serviços", "Mercados"].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleSearch(chip.toLowerCase())}
                    className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <div className="container mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
            {PROMO_BANNERS.map((banner) => (
              <Link
                key={`mobile-banner-${banner.id}`}
                href={banner.href}
                className="min-w-[250px] snap-center rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-black px-4 py-4 text-white shadow-lg"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-orange-200">
                  {banner.title}
                </p>
                <p className="mt-1 text-lg font-extrabold leading-tight">{banner.subtitle}</p>
                <div className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-orange-200">
                  {banner.cta}
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>

          <div className="container mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
            {CATEGORY_SHORTCUTS.map((item) => {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex min-h-[88px] flex-col items-center justify-between rounded-2xl border border-slate-100 bg-white p-3 text-center shadow-sm transition hover:border-orange-200 hover:shadow-md"
                >
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl text-xl ${item.tone}`}
                  >
                    {item.emoji}
                  </span>
                  <span className="text-[12px] font-semibold leading-tight text-slate-800">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          <section className="bg-white">
            <div className="container space-y-6 pt-4 pb-8">
              <div className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-orange-50 via-white to-slate-50 p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-orange-100 p-3 text-orange-700">
                    <HomeIcon className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
                      Norte Vivo app
                    </p>
                    <h2 className="mt-1 font-display text-2xl font-black text-slate-900">
                      Tudo da sua cidade na mão
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Guia local, lojas, serviços e delivery em um app leve.
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button
                    className="h-11 rounded-2xl bg-slate-900 text-white hover:bg-slate-800"
                    onClick={() => handleSearch("")}
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Explorar agora
                  </Button>

                  <Link href={isAuthenticated ? "/anunciante/novo" : LOGIN_ROUTE}>
                    <Button
                      variant="outline"
                      className="h-11 w-full rounded-2xl border-slate-300 text-slate-900 hover:bg-slate-50"
                    >
                      <Store className="mr-2 h-4 w-4" />
                      Divulgar negócio
                    </Button>
                  </Link>
                </div>

                <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                  {FILTER_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() =>
                        handleSearch(chip === "Filtros" ? "" : chip.replace(" ", "+"))
                      }
                      className="shrink-0 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {PILLARS.map((item) => {
                  return (
                    <Link
                      key={`mobile-${item.label}`}
                      href={item.href}
                      className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 shadow-[0_6px_18px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5"
                    >
                      <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-white px-3 py-2 text-lg">
                          {item.emoji}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                            {item.badge}
                          </p>
                          <h3 className="mt-1 font-display text-lg font-black text-slate-900">
                            {item.label}
                          </h3>
                          <p className="mt-1 text-xs leading-5 text-slate-600">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">Atalhos rápidos</p>
                  <Link href="/busca" className="text-xs font-semibold text-orange-600">
                    ver todos
                  </Link>
                </div>

                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {QUICK_SEGMENTS.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleSearch(item.label)}
                      className="inline-flex shrink-0 items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800"
                    >
                      <span className="text-lg leading-none">{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">Abertos agora</p>
                  <Link href="/busca" className="text-xs font-semibold text-orange-600">
                    ver todos
                  </Link>
                </div>

                <div className="mt-3 space-y-3">
                  {openNearby.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      Nenhuma loja aberta no momento. Volte em instantes.
                    </p>
                  ) : (
                    openNearby.slice(0, 6).map((item) => {
                      const image =
                        item.images?.find((img) => img.isPrimary)?.url ||
                        item.images?.[0]?.url;

                      return (
                        <ListingCardCompact
                          key={`near-${item.id}`}
                          id={item.id}
                          title={item.title}
                          price={item.price}
                          priceType={item.priceType}
                          neighborhood={item.neighborhood ?? undefined}
                          cityName={cities?.find((c) => c.id === item.cityId)?.name}
                          images={image ? [{ url: image, isPrimary: true }] : []}
                          seller={item.seller}
                          type={item.type}
                          isBoosted
                        />
                      );
                    })
                  )}
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">
                    Serviços & empresas
                  </p>
                  <Link href="/guia" className="text-xs font-semibold text-orange-600">
                    ver guia
                  </Link>
                </div>

                <div className="mt-3 space-y-3">
                  {serviceProviders.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      Em breve vamos mostrar prestadores e empresas da sua cidade aqui.
                    </p>
                  ) : (
                    serviceProviders.slice(0, 6).map((item) => {
                      const image =
                        item.images?.find((img) => img.isPrimary)?.url ||
                        item.images?.[0]?.url;

                      return (
                        <ListingCardCompact
                          key={`service-${item.id}`}
                          id={item.id}
                          title={item.title}
                          price={item.price}
                          priceType={item.priceType}
                          neighborhood={item.neighborhood ?? undefined}
                          cityName={cities?.find((c) => c.id === item.cityId)?.name}
                          images={image ? [{ url: image, isPrimary: true }] : []}
                          seller={item.seller}
                          type={item.type}
                        />
                      );
                    })
                  )}
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">Filtrar vitrine</p>
                  <span className="text-xs font-semibold text-slate-500">{selectedCityName}</span>
                </div>

                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => setActiveCategoryId("all")}
                    className={`shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition ${
                      activeCategoryId === "all"
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-slate-50 text-slate-800"
                    }`}
                  >
                    Tudo
                  </button>

                  {(categories ?? []).slice(0, 10).map((category) => (
                    <button
                      key={`mobile-cat-${category.id}`}
                      type="button"
                      onClick={() => setActiveCategoryId(category.id)}
                      className={`shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition ${
                        activeCategoryId === category.id
                          ? "border-orange-300 bg-orange-50 text-orange-700"
                          : "border-slate-200 bg-white text-slate-800"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">
                    Ofertas e produtos
                  </p>
                  <Link href="/busca" className="text-xs font-semibold text-orange-600">
                    ver todos
                  </Link>
                </div>

                <div className="mt-3 space-y-3">
                  {visibleListings.slice(0, 6).map((item) => {
                    const image =
                      item.images?.find((img) => img.isPrimary)?.url ||
                      item.images?.[0]?.url;

                    return (
                      <ListingCardCompact
                        key={`list-${item.id}`}
                        id={item.id}
                        title={item.title}
                        price={item.price}
                        priceType={item.priceType}
                        neighborhood={item.neighborhood ?? undefined}
                        cityName={cities?.find((c) => c.id === item.cityId)?.name}
                        images={image ? [{ url: image, isPrimary: true }] : []}
                        seller={item.seller}
                        type={item.type}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">
                  Eventos e oportunidades
                </p>

                <div className="mt-3 space-y-3">
                  {eventListings.length === 0 && jobListings.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      Divulgue próximos eventos e vagas para eles aparecerem aqui.
                    </p>
                  ) : (
                    <>
                      {eventListings.slice(0, 3).map((item) => {
                        const image =
                          item.images?.find((image) => image.isPrimary)?.url ||
                          item.images?.[0]?.url;
                        const extra = parseHomeExtraData(item.extraDataJson);

                        return (
                          <Link
                            key={`event-${item.id}`}
                            href={`/anuncio/${item.id}`}
                            className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 transition hover:border-blue-200 hover:bg-blue-50/60"
                          >
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                              {image ? (
                                <img
                                  src={image}
                                  alt={item.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <CalendarDays className="h-5 w-5 text-slate-400" />
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-700">
                                Evento
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-700" />
                                {[item.neighborhood, cityNameById(item.cityId)]
                                  .filter(Boolean)
                                  .join(", ") || "Norte Pioneiro"}
                              </div>
                              <p className="mt-1 line-clamp-2 font-display text-base font-bold text-slate-900">
                                {item.title}
                              </p>
                              {(extra.eventDate || extra.eventVenue) && (
                                <p className="mt-1 text-xs font-semibold text-blue-700">
                                  {[extra.eventDate, extra.eventVenue]
                                    .filter(Boolean)
                                    .join(" · ")}
                                </p>
                              )}
                            </div>
                          </Link>
                        );
                      })}

                      {jobListings.slice(0, 3).map((item) => {
                        const image =
                          item.images?.find((image) => image.isPrimary)?.url ||
                          item.images?.[0]?.url;
                        const extra = parseHomeExtraData(item.extraDataJson);

                        return (
                          <Link
                            key={`job-${item.id}`}
                            href={`/anuncio/${item.id}`}
                            className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-emerald-50 p-3 transition hover:border-emerald-200"
                          >
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
                              {image ? (
                                <img
                                  src={image}
                                  alt={item.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <BriefcaseBusiness className="h-5 w-5 text-emerald-500" />
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
                                Vaga
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                                {[item.neighborhood, cityNameById(item.cityId)]
                                  .filter(Boolean)
                                  .join(", ") || "Norte Pioneiro"}
                              </div>
                              <p className="mt-1 line-clamp-2 font-display text-base font-bold text-slate-900">
                                {item.title}
                              </p>
                              {(extra.jobSalary || extra.jobMode) && (
                                <p className="mt-1 text-xs font-semibold text-emerald-700">
                                  {[extra.jobSalary, extra.jobMode]
                                    .filter(Boolean)
                                    .join(" · ")}
                                </p>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">Cupons e destaques</p>
                  <Link href={COLLECTION_CARD.href} className="text-xs font-semibold text-orange-600">
                    ver tudo
                  </Link>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-1">
                  {PROMO_BANNERS.map((banner) => (
                    <Link
                      key={banner.id}
                      href={banner.href}
                      className="block min-w-[240px] rounded-2xl bg-slate-50 px-4 py-4 shadow-sm transition hover:shadow-md"
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        {banner.title}
                      </p>
                      <p className="mt-2 text-lg font-bold text-slate-900">
                        {banner.subtitle}
                      </p>
                      <div className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-orange-600">
                        {banner.cta}
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </Link>
                  ))}

                  <Link
                    href={COLLECTION_CARD.href}
                    className="block min-w-[240px] rounded-2xl bg-slate-900 p-4 text-white shadow-sm transition hover:shadow-md"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-orange-200">
                      {COLLECTION_CARD.title}
                    </p>
                    <p className="mt-2 text-lg font-extrabold leading-tight text-white">
                      {COLLECTION_CARD.cardTitle}
                    </p>
                    <p className="mt-2 text-sm text-slate-100">
                      {COLLECTION_CARD.cardSubtitle}
                    </p>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="hidden md:block">
          <section className="container pt-3 sm:pt-6">
          <div className="overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_45%,#f97316_130%)] px-5 py-6 text-white shadow-[0_20px_70px_rgba(15,23,42,0.18)] sm:px-8 sm:py-10 lg:px-10 lg:py-12">
            <div className="mx-auto max-w-6xl">
              <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-sm font-semibold text-white">
                    <span>🛡️</span>
                    Guia local + marketplace + lojas online
                  </div>

                  <h1 className="mt-4 font-display text-3xl font-black leading-tight text-white sm:text-5xl">
                    Tudo da sua cidade em um só lugar.
                  </h1>

                  <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-50/90 sm:text-lg">
                    Encontre empresas, serviços e produtos da sua região ou crie
                    sua loja online e comece a aparecer para novos clientes em{" "}
                    <span className="font-bold text-white">
                      {selectedCityName}
                    </span>
                    .
                  </p>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Button
                      className="h-12 rounded-2xl bg-white px-6 text-slate-900 hover:bg-slate-100"
                      onClick={() => handleSearch("")}
                    >
                      <span className="mr-2 text-base">🔍</span>
                      Explorar agora
                    </Button>

                    <Link href={isAuthenticated ? "/anunciante/novo" : LOGIN_ROUTE}>
                      <Button className="h-12 rounded-2xl bg-orange-500 px-6 text-white hover:bg-orange-600">
                        <span className="mr-2 text-base">🏪</span>
                        Criar minha loja
                      </Button>
                    </Link>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    {[
                      "Buscar serviços locais",
                      "Encontrar lojas da região",
                      "Ver produtos em destaque",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => handleSearch(suggestion)}
                        className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-left text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/16"
                      >
                        <span>{suggestion}</span>
                        <span className="shrink-0 text-base">➡️</span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3 sm:max-w-xl sm:grid-cols-4">
                    <div className="rounded-[22px] bg-white/10 p-4 backdrop-blur-sm">
                      <p className="text-2xl font-black text-white">
                        {featuredListings.length || recentListings.length}
                      </p>
                      <p className="text-sm text-blue-100">Anúncios ativos</p>
                    </div>
                    <div className="rounded-[22px] bg-white/10 p-4 backdrop-blur-sm">
                      <p className="text-2xl font-black text-white">
                        {companyHighlights.length}
                      </p>
                      <p className="text-sm text-blue-100">Lojas visíveis</p>
                    </div>
                    <div className="rounded-[22px] bg-white/10 p-4 backdrop-blur-sm">
                      <p className="text-2xl font-black text-white">
                        {serviceProviders.length}
                      </p>
                      <p className="text-sm text-blue-100">Serviços</p>
                    </div>
                    <div className="rounded-[22px] bg-white/10 p-4 backdrop-blur-sm">
                      <p className="text-2xl font-black text-white">
                        {foodListings.length}
                      </p>
                      <p className="text-sm text-blue-100">Lojas abertas</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur-md">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-200">
                    Como usar o Norte Vivo
                  </p>

                  <div className="mt-4 space-y-3">
                    {PILLARS.map((item) => {
                      return (
                        <Link
                          key={item.label}
                          href={item.href}
                          className={`block rounded-[24px] border p-4 transition ${item.tone}`}
                        >
                          <div className="flex items-start gap-4">
                            <div className="rounded-2xl bg-black/10 p-3 text-lg">
                              {item.emoji}
                            </div>

                            <div className="min-w-0">
                              <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-80">
                                {item.badge}
                              </p>
                              <h3 className="mt-1 font-display text-xl font-bold">
                                {item.label}
                              </h3>
                              <p className="mt-1 text-sm leading-6 opacity-90">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  <div className="mt-5 rounded-[22px] bg-white/10 p-4">
                    <p className="text-base font-semibold text-white">
                      Tem uma loja e ainda não tem site?
                    </p>
                    <p className="mt-1 text-sm leading-6 text-blue-50/90">
                      Crie sua vitrine, publique seus produtos e receba contatos
                      pelo WhatsApp.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container py-8 sm:py-10">
          <SectionHeader
            eyebrow="3 formas de usar"
            title="Escolha a melhor porta de entrada para o que você precisa"
            description="A Home agora guia melhor o usuário: primeiro ele entende o produto, depois escolhe como navegar dentro da plataforma."
          />

          <div className="grid gap-4 lg:grid-cols-3">
            {PILLARS.map((item) => {
              const isDark =
                item.label === "Marketplace Regional" || item.label === "Crie sua Loja";

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`rounded-[28px] border p-6 shadow-sm transition hover:-translate-y-1 ${
                    isDark
                      ? item.label === "Marketplace Regional"
                        ? "border-orange-200 bg-orange-500 text-white"
                        : "border-slate-800 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-900"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="rounded-2xl bg-black/10 p-3 text-xl">
                      {item.emoji}
                    </div>
                    <span className="rounded-full bg-black/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="mt-5 font-display text-2xl font-black">
                    {item.label}
                  </h3>

                  <p
                    className={`mt-3 text-sm leading-7 ${
                      isDark ? "text-white/85" : "text-slate-500"
                    }`}
                  >
                    {item.description}
                  </p>

                  <div className="mt-5 inline-flex items-center gap-1 text-sm font-semibold">
                    Entrar
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section id="marketplace" className="container py-2 sm:py-4">
          <SectionHeader
            eyebrow="Destaques da semana"
            title="Produtos patrocinados com mais visibilidade"
            description="Essa é a área comercial mais forte da plataforma. Aqui ficam os anúncios impulsionados para gerar clique e venda."
            actionHref="/booster"
            actionLabel="Ver destaques"
          />

          {featuredListings.length > 0 ? (
            <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 xl:grid xl:grid-cols-4 xl:overflow-visible xl:pb-0">
              {featuredListings.map((listing) => {
                const primaryImage =
                  listing.images?.find((image) => image.isPrimary)?.url ||
                  listing.images?.[0]?.url;

                return (
                  <div
                    key={listing.id}
                    className="min-w-[78%] snap-center overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm sm:min-w-[360px] xl:min-w-0"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                      <div className="inline-flex items-center gap-1 rounded-full bg-orange-500 px-2.5 py-1 text-[11px] font-black text-white">
                        <Zap className="h-3.5 w-3.5" />
                        PATROCINADO
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500">
                        Maior destaque
                      </span>
                    </div>

                    <div className="sm:hidden">
                      <Link href={`/anuncio/${listing.id}`} className="block">
                        <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                          {primaryImage ? (
                            <img
                              src={primaryImage}
                              alt={listing.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-50 to-orange-100">
                              <span className="font-display text-4xl font-black text-slate-700">
                                {listing.title.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="p-4">
                          <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700">
                            {[
                              categories?.find((category) => category.id === listing.categoryId)
                                ?.name,
                              listing.subcategory,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </div>

                          <h3 className="mt-3 line-clamp-2 text-lg font-bold leading-6 text-slate-900">
                            {listing.title}
                          </h3>

                          <p className="mt-2 text-2xl font-black text-blue-700">
                            {formatListingPrice(listing.price, listing.priceType)}
                          </p>

                          <div className="mt-3 flex flex-col gap-1.5 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {listing.neighborhood ||
                                cityNameById(listing.cityId)}
                            </span>
                            <span>
                              {listing.createdAt
                                ? new Date(listing.createdAt).toLocaleDateString("pt-BR")
                                : ""}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </div>

                    <div className="hidden sm:block">
                      <ListingCard
                        {...listing}
                        createdAt={listing.createdAt ?? new Date()}
                        cityName={cityNameById(listing.cityId)}
                        categoryName={
                          categories?.find((category) => category.id === listing.categoryId)
                            ?.name
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-amber-200 bg-white p-10 text-center">
              <Zap className="mx-auto h-12 w-12 text-amber-300" />
              <p className="mt-4 text-slate-500">
                Assim que houver anúncios impulsionados, eles aparecerão aqui.
              </p>
            </div>
          )}
        </section>

        <section id="guia-local" className="container py-8 sm:py-10">
          <SectionHeader
            eyebrow="Guia local"
            title={`Serviços e contatos essenciais em ${selectedCityName}`}
            description="O guia precisa ser útil de verdade. Ele deve resolver rápido a busca por telefones, empresas e contatos da cidade."
            actionHref="/guia"
            actionLabel="Abrir guia local"
          />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {GUIDE_SHORTCUTS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50/40 sm:rounded-[28px]"
                >
                  <div className={`inline-flex rounded-2xl p-3 ${item.tone}`}>
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="mt-4 font-display text-2xl font-bold text-slate-900">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {item.description}
                  </p>

                  <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-orange-600">
                    Explorar
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section id="lojas-empresas" className="container py-2 sm:py-4">
          <SectionHeader
            eyebrow="Lojas em destaque"
            title="Negócios locais que já podem vender online pelo Norte Vivo"
            description="Aqui está seu diferencial mais forte: dar presença digital para quem vende na região, mesmo sem ter site próprio."
            actionHref="/lojas"
            actionLabel="Ver lojas"
          />

          {companyHighlights.length > 0 ? (
            <>
              <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:hidden">
                {companyHighlights.map((item) => {
                  const displayName =
                    item.seller?.companyName?.trim() ||
                    item.seller?.name?.trim() ||
                    item.title;

                  const cityName = cityNameById(item.seller?.cityId);
                  const neighborhood = item.seller?.neighborhood?.trim();
                  const subtitle =
                    categories?.find((category) => category.id === item.categoryId)?.name ||
                    item.subcategory ||
                    "Negócio local";

                  return (
                    <Link
                      key={item.id}
                      href={getStorefrontHref(item.seller?.id, item.id)}
                      className="min-w-[86%] snap-center rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[22px] bg-slate-100 text-lg font-black text-blue-700">
                        {item.seller?.avatar ? (
                          <img
                            src={item.seller.avatar}
                            alt={displayName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          displayName.charAt(0).toUpperCase()
                        )}
                      </div>

                      <div className="mt-4">
                        <p className="truncate font-display text-2xl font-bold leading-tight text-slate-900">
                          {displayName}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                            <Store className="h-3.5 w-3.5" />
                            {subtitle}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                            <BadgeCheck className="h-3.5 w-3.5" />
                            {item.seller?.isVerified ? "Verificada" : "Perfil ativo"}
                          </span>
                        </div>

                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
                          Conheça a loja, veja os produtos publicados e fale
                          direto com quem vende.
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-slate-400" />
                            {[neighborhood, cityName].filter(Boolean).join(", ")}
                          </span>

                          {(item.seller?.whatsapp || item.whatsapp) && (
                            <span className="inline-flex items-center gap-1.5 text-emerald-700">
                              <Phone className="h-4 w-4" />
                              WhatsApp
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <div className="hidden gap-4 overflow-x-auto pb-2 md:flex">
                {companyHighlights.map((item) => {
                  const cover =
                    item.seller?.bannerUrl ||
                    item.images?.find((image) => image.isPrimary)?.url ||
                    item.images?.[0]?.url;

                  const displayName =
                    item.seller?.companyName?.trim() ||
                    item.seller?.name?.trim() ||
                    item.title;

                  const cityName = cityNameById(item.seller?.cityId);
                  const neighborhood = item.seller?.neighborhood?.trim();
                  const subtitle =
                    categories?.find((category) => category.id === item.categoryId)?.name ||
                    item.subcategory ||
                    "Negócio local";

                  return (
                    <article
                      key={item.id}
                      className="min-w-[280px] max-w-[320px] flex-1 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"
                    >
                      <Link
                        href={getStorefrontHref(item.seller?.id, item.id)}
                        className="block"
                      >
                        <div className="relative h-40 bg-slate-100">
                          {cover ? (
                            <img
                              src={cover}
                              alt={displayName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-100 to-orange-100">
                              <span className="font-display text-4xl font-black text-slate-700">
                                {displayName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                      </Link>

                      <div className="p-5">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                            <Store className="h-3.5 w-3.5" />
                            {subtitle}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            <BadgeCheck className="h-3.5 w-3.5" />
                            {item.seller?.isVerified ? "Verificada" : "Perfil ativo"}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-lg font-black text-blue-700">
                            {item.seller?.avatar ? (
                              <img
                                src={item.seller.avatar}
                                alt={displayName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              displayName.charAt(0).toUpperCase()
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-display text-xl font-bold text-slate-900">
                              {displayName}
                            </p>
                            <p className="truncate text-sm text-slate-500">
                              {subtitle}
                            </p>
                          </div>
                        </div>

                        <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-500">
                          Veja a vitrine da loja, os itens publicados e os canais
                          de contato disponíveis.
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-slate-400" />
                            {[neighborhood, cityName].filter(Boolean).join(", ")}
                          </span>

                          {(item.seller?.whatsapp || item.whatsapp) && (
                            <span className="inline-flex items-center gap-1.5 text-emerald-700">
                              <Phone className="h-4 w-4" />
                              WhatsApp disponível
                            </span>
                          )}
                        </div>

                        <div className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-orange-600">
                          Ver perfil
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="rounded-[28px] border border-dashed border-slate-200 bg-white p-10 text-center">
              <Building2 className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-4 text-slate-500">
                As primeiras lojas e empresas aparecerão aqui.
              </p>
            </div>
          )}
        </section>

        <section className="container py-8 sm:py-10">
          <SectionHeader
            eyebrow="Marketplace regional"
            title="Novidades e oportunidades recentes"
            description="Depois que o usuário entende o produto, ele entra no fluxo natural de descoberta: anúncios, produtos e oportunidades da região."
            actionHref="/busca"
            actionLabel="Ver mais"
          />

          {recentListings.length > 0 ? (
            <>
              <div className="space-y-3 md:hidden">
                {recentListings.slice(0, 6).map((listing) => {
                  const image =
                    listing.images?.find((photo) => photo.isPrimary)?.url ||
                    listing.images?.[0]?.url;

                  return (
                    <Link
                      key={listing.id}
                      href={`/anuncio/${listing.id}`}
                      className="flex items-center gap-3 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                        {image ? (
                          <img
                            src={image}
                            alt={listing.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-slate-100">
                            <LayoutGrid className="h-5 w-5 text-slate-400" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-display text-lg font-bold text-slate-900">
                          {listing.title}
                        </p>

                        <p className="mt-1 text-base font-black text-orange-600">
                          {formatListingPrice(listing.price, listing.priceType)}
                        </p>

                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600">
                            {getPriceTypeLabel(listing.priceType)}
                          </span>
                          <span className="rounded-full bg-blue-50 px-2.5 py-1 font-semibold text-blue-700">
                            {listing.type === "food"
                              ? "Comida"
                              : listing.type === "service"
                              ? "Serviço"
                              : listing.type === "property"
                              ? "Imóvel"
                              : listing.type === "vehicle"
                              ? "Veículo"
                              : "Produto"}
                          </span>
                        </div>

                        <p className="mt-2 truncate text-xs text-slate-500">
                          {[listing.neighborhood, cityNameById(listing.cityId)]
                            .filter(Boolean)
                            .join(", ") || "Norte Pioneiro"}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <div className="hidden grid-cols-2 gap-4 md:grid xl:grid-cols-5">
                {recentListings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    {...listing}
                    createdAt={listing.createdAt ?? new Date()}
                    cityName={cityNameById(listing.cityId)}
                    categoryName={
                      categories?.find((category) => category.id === listing.categoryId)
                        ?.name
                    }
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-[28px] border border-dashed border-slate-200 bg-white p-12 text-center">
              <LayoutGrid className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-4 text-slate-500">
                Assim que novos anúncios entrarem no portal, a Home vai refletir
                isso aqui.
              </p>
            </div>
          )}
        </section>

        <section className="bg-orange-50 py-8 sm:py-10">
          <div className="container">
            <SectionHeader
              eyebrow="O que comer hoje"
              title="Bateu a fome? Peça agora nas melhores lojas abertas"
              description="Essa seção ajuda o usuário no dia a dia e aumenta recorrência de visita ao site."
              actionHref="/busca?q=lanche"
              actionLabel="Ver lanches"
            />

            {foodListings.length > 0 ? (
              <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 lg:grid-cols-6">
                {foodListings.map((listing, index) => {
                  const image =
                    listing.images?.find((photo) => photo.isPrimary)?.url ||
                    listing.images?.[0]?.url;

                  const cityName = cityNameById(listing.cityId);
                  const popularityLabel =
                    index === 0 || (listing.viewCount ?? 0) >= 30
                      ? "Mais pedido"
                      : "Em destaque";

                  return (
                    <div
                      key={listing.id}
                      className="min-w-[84%] snap-center sm:min-w-0"
                    >
                      <div className="sm:hidden">
                        <Link
                          href={`/anuncio/${listing.id}`}
                          className="block overflow-hidden rounded-[28px] border border-orange-100 bg-white shadow-sm"
                        >
                          <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                            {image ? (
                              <img
                                src={image}
                                alt={listing.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100">
                                <ShoppingBag className="h-8 w-8 text-orange-300" />
                              </div>
                            )}

                            <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                              Lanche
                            </div>
                          </div>

                          <div className="p-4">
                            <div className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-[11px] font-semibold text-orange-700">
                              {listing.subcategory || "Lanche do dia"}
                            </div>

                            <h3 className="mt-3 line-clamp-2 text-xl font-bold leading-7 text-slate-900">
                              {listing.title}
                            </h3>

                            <p className="mt-2 text-2xl font-black text-blue-700">
                              {formatListingPrice(listing.price, listing.priceType)}
                            </p>

                            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 font-semibold text-amber-700">
                                <Star className="h-3.5 w-3.5 fill-current" />
                                {popularityLabel}
                              </span>

                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">
                                <BadgeCheck className="h-3.5 w-3.5" />
                                Aberto agora
                              </span>
                            </div>

                            <p className="mt-3 text-sm leading-6 text-slate-500">
                              Fale direto com quem vende e veja se atende a sua
                              cidade.
                            </p>

                            <div className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500">
                              <MapPin className="h-4 w-4 text-slate-400" />
                              {cityName}
                            </div>
                          </div>
                        </Link>
                      </div>

                      <div className="hidden sm:block">
                        <ListingCard
                          {...listing}
                          createdAt={listing.createdAt ?? new Date()}
                          cityName={cityName}
                          categoryName="Delivery"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-[28px] bg-white p-10 text-center shadow-sm">
                <ShoppingBag className="mx-auto h-12 w-12 text-orange-200" />
                <p className="mt-4 text-slate-500">
                  Assim que houver lanches de lojas abertas agora, eles aparecerão aqui.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="container py-8 sm:py-10">
          <SectionHeader
            eyebrow="Serviços locais"
            title="Profissionais e prestadores com contato rápido"
            description="Essa seção ajuda a transformar o site em utilidade diária para a cidade, não só em vitrine de anúncios."
            actionHref="/busca?q=servicos"
            actionLabel="Ver serviços"
          />

          {serviceProviders.length > 0 ? (
            <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 xl:grid xl:grid-cols-4 xl:overflow-visible xl:pb-0">
              {serviceProviders.map((item) => {
                const displayName =
                  item.seller?.companyName?.trim() ||
                  item.seller?.name?.trim() ||
                  item.title;

                const cityName =
                  cityNameById(item.seller?.cityId) || cityNameById(item.cityId);

                const whatsappNumber = item.seller?.whatsapp || item.whatsapp;
                const whatsappHref = whatsappNumber
                  ? `https://wa.me/55${whatsappNumber.replace(/\D/g, "")}`
                  : null;

                return (
                  <article
                    key={item.id}
                    className="min-w-[82%] snap-center rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:min-w-[300px] sm:rounded-[28px] xl:min-w-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[20px] bg-slate-100 text-lg font-black text-blue-700">
                        {item.seller?.avatar ? (
                          <img
                            src={item.seller.avatar}
                            alt={displayName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          displayName.charAt(0).toUpperCase()
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-display text-xl font-bold text-slate-900">
                          {displayName}
                        </p>
                        <p className="mt-1 truncate text-sm text-slate-500">
                          {cityName}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span>{cityName}</span>
                    </div>

                    {whatsappHref ? (
                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700"
                      >
                        <Phone className="h-4 w-4" />
                        Falar no WhatsApp
                      </a>
                    ) : (
                      <Link
                        href={`/anuncio/${item.id}`}
                        className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700"
                      >
                        <ArrowRight className="h-4 w-4" />
                        Ver perfil
                      </Link>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-slate-200 bg-white p-8 text-center">
              <HeartHandshake className="mx-auto h-10 w-10 text-violet-300" />
              <p className="mt-4 text-slate-500">
                Os primeiros prestadores com contato rápido aparecerão aqui.
              </p>
            </div>
          )}
        </section>

        <section className="container pb-8 sm:pb-10">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
                  <CalendarDays className="h-6 w-6" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
                    Eventos da região
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Feiras, shows, encontros e atrações locais em um só lugar.
                  </p>
                </div>
              </div>

              {eventListings.length > 0 ? (
                <div className="mt-5 space-y-3">
                  {eventListings.map((item) => {
                    const image =
                      item.images?.find((image) => image.isPrimary)?.url ||
                      item.images?.[0]?.url;

                    const extra = parseHomeExtraData(item.extraDataJson);

                    return (
                      <Link
                        key={item.id}
                        href={`/anuncio/${item.id}`}
                        className="block overflow-hidden rounded-[22px] border border-slate-200 bg-slate-50 p-3 transition hover:border-blue-200 hover:bg-blue-50/50"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
                            {image ? (
                              <img
                                src={image}
                                alt={item.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <CalendarDays className="h-6 w-6 text-slate-400" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                              Evento local
                            </span>

                            <p className="mt-2 line-clamp-2 font-display text-lg font-bold leading-6 text-slate-900">
                              {item.title}
                            </p>

                            <p className="mt-2 text-sm text-slate-500">
                              {[item.neighborhood, cityNameById(item.cityId)]
                                .filter(Boolean)
                                .join(", ") || "Norte Pioneiro"}
                            </p>

                            {(extra.eventDate || extra.eventVenue) && (
                              <p className="mt-1 truncate text-xs font-medium text-blue-700">
                                {[extra.eventDate, extra.eventVenue]
                                  .filter(Boolean)
                                  .join(" · ")}
                              </p>
                            )}

                            <div className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue-700">
                              Ver detalhes
                              <ArrowRight className="h-4 w-4" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-5 rounded-[22px] border border-dashed border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm leading-6 text-slate-500">
                    Ainda não há eventos publicados. Use o Norte Vivo para
                    divulgar a próxima atração da sua região.
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                  <BriefcaseBusiness className="h-6 w-6" />
                </div>

                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">
                    Vagas de emprego
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Vagas locais, trabalhos rápidos e oportunidades reais da região.
                  </p>
                </div>
              </div>

              {jobListings.length > 0 ? (
                <div className="mt-5 space-y-3">
                  {jobListings.map((item) => {
                    const image =
                      item.images?.find((image) => image.isPrimary)?.url ||
                      item.images?.[0]?.url;

                    const extra = parseHomeExtraData(item.extraDataJson);

                    return (
                      <Link
                        key={item.id}
                        href={`/anuncio/${item.id}`}
                        className="flex items-center gap-3 rounded-[22px] border border-slate-200 bg-slate-50 p-3 transition hover:border-emerald-200 hover:bg-emerald-50/50"
                      >
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
                          {image ? (
                            <img
                              src={image}
                              alt={item.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <BriefcaseBusiness className="h-6 w-6 text-slate-400" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-display text-lg font-bold text-slate-900">
                            {item.title}
                          </p>
                          <p className="mt-1 truncate text-sm text-slate-500">
                            {[item.neighborhood, cityNameById(item.cityId)]
                              .filter(Boolean)
                              .join(", ") || "Norte Pioneiro"}
                          </p>

                          {(extra.jobSalary || extra.jobMode) && (
                            <p className="mt-1 truncate text-xs font-medium text-emerald-700">
                              {[extra.jobSalary, extra.jobMode]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-5 rounded-[22px] border border-dashed border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm leading-6 text-slate-500">
                    Ainda não há vagas publicadas. Em breve essa área pode reunir
                    empregos e freelas da região.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="container pb-14">
          <div className="rounded-[32px] bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_55%,#f97316_140%)] p-6 text-white shadow-[0_22px_70px_rgba(15,23,42,0.18)] sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-200">
                  Para quem vende
                </p>

                <h2 className="mt-3 font-display text-3xl font-black">
                  Sua loja pode aparecer para toda a região, mesmo sem ter site.
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200 sm:text-base">
                  Cadastre produtos, serviços, contatos, horário de funcionamento
                  e impulsione o que você quer vender com mais destaque dentro da
                  plataforma.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Link href={isAuthenticated ? "/anunciante/novo" : LOGIN_ROUTE}>
                  <Button className="h-12 w-full rounded-2xl bg-white text-slate-900 hover:bg-slate-100">
                    <Store className="mr-2 h-4 w-4" />
                    Criar anúncio
                  </Button>
                </Link>

                <Link href="/planos">
                  <Button className="h-12 w-full rounded-2xl bg-orange-500 text-white hover:bg-orange-600">
                    <Zap className="mr-2 h-4 w-4" />
                    Ver planos
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        </div>
      </main>

      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
}



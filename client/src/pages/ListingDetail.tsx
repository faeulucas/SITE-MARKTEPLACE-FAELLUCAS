import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  MapPin,
  MessageCircle,
  Heart,
  Share2,
  Eye,
  Clock,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Zap,
  Flag,
  Bell,
  Store,
  Phone,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { getStorefrontHref } from "@/lib/storefront";
import { useAuth } from "@/_core/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import { Button } from "@/components/ui/button";

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();

  const [currentImage, setCurrentImage] = useState(0);
  const [isFollowingSeller, setIsFollowingSeller] = useState(false);
  const [hasPriceAlert, setHasPriceAlert] = useState(false);
  const [activeSection, setActiveSection] = useState<
    "visao-geral" | "detalhes" | "loja"
  >("visao-geral");

  const overviewRef = useRef<HTMLElement | null>(null);
  const detailsRef = useRef<HTMLElement | null>(null);
  const sellerRef = useRef<HTMLElement | null>(null);

  const { data: listing, isLoading } = trpc.public.listingById.useQuery({
    id: Number(id),
  });

  const { data: sellerListings } = trpc.public.sellerListings.useQuery(
    {
      sellerId: listing?.seller?.id ?? 0,
      excludeId: listing?.id,
      limit: 4,
    },
    { enabled: Boolean(listing?.seller?.id) }
  );

  const { data: relatedListings } = trpc.public.relatedListings.useQuery(
    {
      listingId: listing?.id ?? 0,
      categoryId: listing?.categoryId ?? 0,
      subcategory:
        "subcategory" in (listing ?? {})
          ? (listing?.subcategory ?? undefined)
          : undefined,
      cityId: listing?.cityId ?? undefined,
      limit: 8,
    },
    { enabled: Boolean(listing?.id && listing?.categoryId) }
  );

  const favMutation = trpc.advertiser.toggleFavorite.useMutation({
    onSuccess: (data) =>
      toast.success(
        data.favorited ? "Adicionado aos favoritos!" : "Removido dos favoritos"
      ),
  });

  const images = listing?.images || [];

  const sellerPersonType =
    listing?.seller && "personType" in listing.seller
      ? listing.seller.personType
      : undefined;

  const sellerCompanyName =
    listing?.seller && "companyName" in listing.seller
      ? listing.seller.companyName
      : undefined;

  const listingSubcategory =
    listing && "subcategory" in listing ? listing.subcategory : undefined;

  const listingCondition =
    listing && "itemCondition" in listing ? listing.itemCondition : undefined;

  const sellerDisplayName =
    sellerPersonType === "pj"
      ? sellerCompanyName || listing?.seller?.name || "Loja"
      : listing?.seller?.name || "Anunciante";

  const sellerInitial = sellerDisplayName.charAt(0)?.toUpperCase() || "?";

  const sellerStorageKey = listing?.seller?.id
    ? `norte-vivo:follow-seller:${listing.seller.id}`
    : "";

  const priceAlertKey = listing?.id
    ? `norte-vivo:price-alert:${listing.id}`
    : "";

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!listing) return;

    if (sellerStorageKey) {
      setIsFollowingSeller(
        window.localStorage.getItem(sellerStorageKey) === "1"
      );
    } else {
      setIsFollowingSeller(false);
    }

    setHasPriceAlert(
      priceAlertKey ? window.localStorage.getItem(priceAlertKey) === "1" : false
    );
  }, [listing, priceAlertKey, sellerStorageKey]);

  const topSellerItems = useMemo(
    () =>
      [...(sellerListings ?? [])]
        .sort(
          (a, b) =>
            Number(b.viewCount ?? 0) +
            Number(b.favoriteCount ?? 0) -
            (Number(a.viewCount ?? 0) + Number(a.favoriteCount ?? 0))
        )
        .slice(0, 3),
    [sellerListings]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_18%,#f8fafc_100%)]">
        <Header />
        <div className="container py-8">
          <div className="space-y-5">
            <div className="h-10 w-40 animate-pulse rounded bg-slate-200" />
            <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="aspect-[4/3] animate-pulse rounded-[28px] bg-slate-200" />
              <div className="space-y-4">
                <div className="h-8 w-2/3 animate-pulse rounded bg-slate-200" />
                <div className="h-6 w-1/3 animate-pulse rounded bg-slate-200" />
                <div className="h-24 animate-pulse rounded-[24px] bg-slate-200" />
                <div className="h-24 animate-pulse rounded-[24px] bg-slate-200" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_18%,#f8fafc_100%)]">
        <Header />
        <div className="container py-20 text-center">
          <h2 className="mb-4 font-display text-2xl font-bold text-slate-700">
            Anúncio não encontrado
          </h2>
          <p className="mb-6 text-slate-500">
            Esse anúncio pode ter sido removido ou não está mais disponível.
          </p>
          <Link href="/busca">
            <Button className="rounded-xl bg-brand-gradient text-white">
              Ver outros anúncios
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const formatPrice = () => {
    if (!listing.price || listing.priceType === "free") return "Grátis";
    if (listing.priceType === "on_request") return "Sob consulta";

    if (listing.priceType === "negotiable") {
      return `R$ ${Number(listing.price).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
      })} (negociável)`;
    }

    return `R$ ${Number(listing.price).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
    })}`;
  };

  const whatsappUrl = listing.whatsapp
    ? `https://wa.me/55${listing.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Olá! Vi seu anúncio "${listing.title}" no Norte Vivo e tenho interesse.`
      )}`
    : null;

  const shareText = `Olha esse anúncio no Norte Vivo: ${listing.title}`;
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const sellerLocation = [listing.neighborhood, "Ibaiti, PR"]
    .filter(Boolean)
    .join(", ");

  const phoneDigits = listing.whatsapp?.replace(/\D/g, "") ?? "";
  const callUrl = phoneDigits ? `tel:${phoneDigits}` : null;

  const storefrontHref = getStorefrontHref(listing.seller?.id, listing.id);

  const sellerMemberYear = listing.seller?.createdAt
    ? new Date(listing.seller.createdAt).getFullYear()
    : null;

  const productViews = Number(listing.viewCount ?? 0);

  const productAge = formatDistanceToNow(new Date(listing.createdAt), {
    addSuffix: true,
    locale: ptBR,
  });

  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(
    `${shareText}\n${shareUrl}`
  )}`;

  const scrollToSection = (section: "visao-geral" | "detalhes" | "loja") => {
    setActiveSection(section);

    const refs = {
      "visao-geral": overviewRef,
      detalhes: detailsRef,
      loja: sellerRef,
    } as const;

    refs[section].current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing.title,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch {
        // fallback
      }
    }

    window.open(whatsappShareUrl, "_blank", "noopener,noreferrer");
  };

  const toggleFollowSeller = () => {
    if (!isAuthenticated) {
      toast.info("Faça login para seguir esta loja.");
      return;
    }

    if (!sellerStorageKey || typeof window === "undefined") return;

    const nextValue = !isFollowingSeller;
    window.localStorage.setItem(sellerStorageKey, nextValue ? "1" : "0");
    setIsFollowingSeller(nextValue);

    toast.success(
      nextValue
        ? "Loja seguida com sucesso."
        : "Você deixou de seguir esta loja."
    );
  };

  const togglePriceAlert = () => {
    if (!isAuthenticated) {
      toast.info("Faça login para salvar alerta de preço.");
      return;
    }

    if (typeof window === "undefined") return;

    const nextValue = !hasPriceAlert;
    window.localStorage.setItem(priceAlertKey, nextValue ? "1" : "0");
    setHasPriceAlert(nextValue);

    toast.success(
      nextValue
        ? "Aviso de queda de preço ativado para este item."
        : "Aviso de queda de preço removido."
    );
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_18%,#f8fafc_100%)]">
      <Header />

      <main className="container py-4 sm:py-6">
        <div className="mb-4 flex items-center gap-2 overflow-hidden text-sm text-slate-500 sm:mb-6">
          <Link href="/" className="hover:text-blue-600">
            Início
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/busca" className="hover:text-blue-600">
            Anúncios
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="truncate font-medium text-slate-900">
            {listing.title}
          </span>
        </div>

        <section className="rounded-[32px] bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_45%,#f97316_130%)] p-5 text-white shadow-[0_20px_70px_rgba(15,23,42,0.18)] sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-sm font-semibold text-white">
                <Sparkles className="h-4 w-4" />
                Página de anúncio do Norte Vivo
              </div>

              <h1 className="mt-4 break-words font-display text-3xl font-black leading-tight text-white sm:text-5xl">
                {listing.title}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-blue-50/90">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 font-semibold">
                  <MapPin className="h-4 w-4" />
                  {sellerLocation || "Ibaiti, PR"}
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 font-semibold">
                  <Clock className="h-4 w-4" />
                  Publicado {productAge}
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 font-semibold">
                  <Eye className="h-4 w-4" />
                  {productViews} visualização(ões)
                </span>

                {listingSubcategory && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 font-semibold">
                    <Store className="h-4 w-4" />
                    {listingSubcategory}
                  </span>
                )}
              </div>

              <div className="mt-5 text-3xl font-black text-white sm:text-4xl">
                {formatPrice()}
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="h-12 rounded-2xl bg-green-500 px-6 text-white hover:bg-green-600">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Chamar no WhatsApp
                    </Button>
                  </a>
                )}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    void handleShare();
                  }}
                  className="h-12 rounded-2xl border-white/30 bg-white/10 px-6 text-white hover:bg-white/15"
                  title="Compartilhar anúncio"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Compartilhar
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[22px] bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-200">
                  Loja
                </p>
                <p className="mt-2 text-xl font-black text-white">
                  {sellerDisplayName}
                </p>
                <p className="mt-1 text-sm text-blue-100">
                  {sellerMemberYear ? `Desde ${sellerMemberYear}` : "Perfil ativo"}
                </p>
              </div>

              <div className="rounded-[22px] bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-200">
                  Confiança
                </p>
                <p className="mt-2 text-xl font-black text-white">
                  {listing.seller?.isVerified ? "Perfil verificado" : "Perfil ativo"}
                </p>
                <p className="mt-1 text-sm text-blue-100">
                  Contato direto com o anunciante
                </p>
              </div>

              <div className="rounded-[22px] bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-200">
                  Contato
                </p>
                <p className="mt-2 text-xl font-black text-white">
                  {listing.whatsapp ? "WhatsApp ativo" : "Consulte a loja"}
                </p>
                <p className="mt-1 text-sm text-blue-100">
                  Atendimento rápido quando disponível
                </p>
              </div>

              <div className="rounded-[22px] bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-200">
                  Tipo
                </p>
                <p className="mt-2 text-xl font-black text-white">
                  {listing.type === "product"
                    ? "Produto"
                    : listing.type === "service"
                    ? "Serviço"
                    : listing.type === "vehicle"
                    ? "Veículo"
                    : listing.type === "property"
                    ? "Imóvel"
                    : listing.type === "food"
                    ? "Delivery"
                    : listing.type === "job"
                    ? "Emprego"
                    : "Anúncio local"}
                </p>
                <p className="mt-1 text-sm text-blue-100">
                  {listingCondition || "Veja os detalhes abaixo"}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[24px] border border-slate-200/70 bg-white p-3 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "visao-geral", label: "Visão geral" },
              { id: "detalhes", label: "Detalhes" },
              { id: "loja", label: "Loja" },
            ].map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() =>
                  scrollToSection(
                    section.id as "visao-geral" | "detalhes" | "loja"
                  )
                }
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  activeSection === section.id
                    ? "bg-orange-500 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </section>

        <section
          ref={overviewRef}
          className="mt-8 scroll-mt-28 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]"
        >
          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="relative aspect-[4/3] bg-slate-100">
              {images.length > 0 ? (
                <img
                  src={images[currentImage]?.url}
                  alt={listing.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-50 to-orange-100">
                  <div className="font-display text-8xl font-black text-slate-300">
                    {listing.title.charAt(0).toUpperCase()}
                  </div>
                </div>
              )}

              {listing.isBoosted && (
                <div className="absolute left-4 top-4">
                  <span className="flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-sm font-bold text-white shadow-md">
                    <Zap className="h-4 w-4" />
                    DESTAQUE
                  </span>
                </div>
              )}

              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImage((i) => Math.max(0, i - 1))}
                    className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md transition-colors hover:bg-white"
                    type="button"
                    aria-label="Imagem anterior"
                    title="Imagem anterior"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  <button
                    onClick={() =>
                      setCurrentImage((i) => Math.min(images.length - 1, i + 1))
                    }
                    className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md transition-colors hover:bg-white"
                    type="button"
                    aria-label="Próxima imagem"
                    title="Próxima imagem"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto p-3 scrollbar-hide">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImage(i)}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                      i === currentImage ? "border-blue-500" : "border-transparent"
                    }`}
                    type="button"
                    aria-label={`Abrir imagem ${i + 1}`}
                    title={`Abrir imagem ${i + 1}`}
                  >
                    <img
                      src={img.url}
                      alt={`Miniatura ${i + 1} do anúncio`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap gap-2">
                {listing.type && (
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {listing.type === "product"
                      ? "Produto"
                      : listing.type === "service"
                      ? "Serviço"
                      : listing.type === "vehicle"
                      ? "Veículo"
                      : listing.type === "property"
                      ? "Imóvel"
                      : listing.type === "food"
                      ? "Delivery"
                      : "Emprego"}
                  </span>
                )}

                {listingCondition && (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {listingCondition}
                  </span>
                )}

                {listing.seller?.isVerified && (
                  <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                    Loja verificada
                  </span>
                )}
              </div>

              <h2 className="mt-4 break-words font-display text-3xl font-black text-slate-900">
                {listing.title}
              </h2>

              <div className="mt-3 break-words text-3xl font-black text-blue-700">
                {formatPrice()}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Localização
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {sellerLocation || "Ibaiti, PR"}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Publicado
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {productAge}
                  </p>
                </div>
              </div>

              {listing.description && (
                <div className="mt-6">
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Descrição
                  </h3>
                  <p className="whitespace-pre-wrap break-words leading-relaxed text-slate-600">
                    {listing.description}
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                Ações rápidas
              </p>

              <div className="mt-4 space-y-3">
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="w-full rounded-2xl bg-green-500 py-6 text-base font-bold text-white hover:bg-green-600">
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Chamar no WhatsApp
                    </Button>
                  </a>
                )}

                {callUrl && (
                  <a href={callUrl}>
                    <Button className="w-full rounded-2xl bg-slate-900 py-6 text-base font-bold text-white hover:bg-slate-800">
                      <Phone className="mr-2 h-5 w-5" />
                      Ligar agora
                    </Button>
                  </a>
                )}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (isAuthenticated) {
                      favMutation.mutate({ listingId: listing.id });
                    } else {
                      toast.info("Faça login para favoritar");
                    }
                  }}
                  className="w-full rounded-2xl py-6 text-base"
                  title="Favoritar anúncio"
                >
                  <Heart className="mr-2 h-5 w-5" />
                  Favoritar anúncio
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={togglePriceAlert}
                  className="w-full rounded-2xl py-6 text-base"
                  title="Ativar alerta de preço"
                >
                  <Bell className="mr-2 h-5 w-5" />
                  {hasPriceAlert ? "Aviso de preço ativo" : "Avisar queda de preço"}
                </Button>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">
                    Negocie com mais segurança
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Nunca pague antecipado sem garantia. Sempre confirme
                    informações, localização e condição do item antes de fechar.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          ref={detailsRef}
          className="mt-10 scroll-mt-28 grid gap-4 md:grid-cols-2 xl:grid-cols-4"
        >
          <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="w-fit rounded-2xl bg-orange-50 p-3 text-orange-600">
              <Clock className="h-5 w-5" />
            </div>
            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
              Publicado
            </p>
            <p className="mt-2 text-xl font-bold text-slate-900">{productAge}</p>
          </article>

          <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="w-fit rounded-2xl bg-blue-50 p-3 text-blue-600">
              <MapPin className="h-5 w-5" />
            </div>
            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
              Localização
            </p>
            <p className="mt-2 text-xl font-bold text-slate-900">
              {sellerLocation || "Ibaiti, PR"}
            </p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                sellerLocation || "Ibaiti, PR"
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-blue-700"
            >
              Abrir no mapa
              <ExternalLink className="h-4 w-4" />
            </a>
          </article>

          <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="w-fit rounded-2xl bg-emerald-50 p-3 text-emerald-600">
              <Phone className="h-5 w-5" />
            </div>
            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
              Contato rápido
            </p>
            <p className="mt-2 text-xl font-bold text-slate-900">
              {listing.whatsapp ? "WhatsApp ativo" : "Consulte a loja"}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Atendimento direto com o anunciante.
            </p>
          </article>

          <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="w-fit rounded-2xl bg-violet-50 p-3 text-violet-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
              Categoria
            </p>
            <p className="mt-2 text-xl font-bold text-slate-900">
              {listingSubcategory || "Anúncio local"}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {listingCondition || "Consulte detalhes com a loja."}
            </p>
          </article>
        </section>

        <section ref={sellerRef} className="mt-10 scroll-mt-28">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[24px] bg-brand-gradient text-2xl font-black text-white shadow-lg">
                  {listing.seller?.avatar ? (
                    <img
                      src={listing.seller.avatar}
                      alt={sellerDisplayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    sellerInitial
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="break-words font-display text-2xl font-black text-slate-900">
                      {sellerDisplayName}
                    </h2>

                    {listing.seller?.isVerified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        <BadgeCheck className="h-3.5 w-3.5" />
                        Verificado
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Veja a vitrine da loja, acompanhe novos itens e fale direto
                    com quem vende.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link href={storefrontHref}>
                      <Button className="rounded-2xl bg-slate-900 text-white hover:bg-slate-800">
                        <Store className="mr-2 h-4 w-4" />
                        Ver vitrine da loja
                      </Button>
                    </Link>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={toggleFollowSeller}
                      className="rounded-2xl"
                      title="Seguir loja"
                    >
                      <Bell className="mr-2 h-4 w-4" />
                      {isFollowingSeller ? "Seguindo loja" : "Seguir loja"}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Local
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {sellerLocation || "Ibaiti, PR"}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Membro desde
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {sellerMemberYear ? sellerMemberYear : "Perfil ativo"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-black text-slate-900">
                    Mais vistos da loja
                  </h2>
                  <p className="text-sm text-slate-500">
                    Itens com mais interesse no perfil deste anunciante.
                  </p>
                </div>
              </div>

              {topSellerItems.length > 0 ? (
                <div className="mt-6 space-y-4">
                  {topSellerItems.map((item, index) => (
                    <Link
                      key={item.id}
                      href={`/anuncio/${item.id}`}
                      className="flex flex-col gap-4 rounded-[24px] border border-slate-200 p-4 transition hover:border-orange-200 hover:bg-orange-50/40 sm:flex-row sm:items-center"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                        {index + 1}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-slate-900">
                          {item.title}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {Number(item.viewCount ?? 0)} visualizações
                        </p>
                      </div>

                      <ArrowRight className="h-4 w-4 text-slate-400" />
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="mt-6 text-sm text-slate-500">
                  A loja ainda não tem outros produtos suficientes para este ranking.
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-[32px] bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_50%,#f97316_140%)] p-6 text-white shadow-[0_22px_70px_rgba(15,23,42,0.22)] sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-200">
                Quer negociar?
              </p>
              <h2 className="mt-3 font-display text-3xl font-black">
                Fale com a loja e acompanhe novidades.
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-200 sm:text-base">
                Nunca pague antecipado sem garantia. Prefira negociar
                pessoalmente ou via WhatsApp com o anunciante.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[340px]">
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="h-12 w-full rounded-2xl bg-green-500 text-white hover:bg-green-600">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Enviar mensagem
                  </Button>
                </a>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  void handleShare();
                }}
                className="h-12 rounded-2xl border-white/30 bg-white/10 text-white hover:bg-white/15"
                title="Compartilhar anúncio"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Compartilhar
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={toggleFollowSeller}
                className="h-12 rounded-2xl border-white/30 bg-white/10 text-white hover:bg-white/15"
                title="Seguir perfil da loja"
              >
                <Store className="mr-2 h-4 w-4" />
                {isFollowingSeller ? "Seguindo loja" : "Seguir perfil"}
              </Button>

              <button
                type="button"
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-4 text-sm font-medium text-white transition hover:bg-white/15"
                aria-label="Denunciar anúncio"
                title="Denunciar anúncio"
              >
                <Flag className="mr-2 h-4 w-4" />
                Denunciar anúncio
              </button>
            </div>
          </div>
        </section>

        {(sellerListings?.length || relatedListings?.length) && (
          <div className="mt-8 space-y-8">
            {sellerListings && sellerListings.length > 0 && (
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-slate-900">
                      Mais da mesma loja
                    </h2>
                    <p className="text-sm text-slate-500">
                      Outros itens publicados por {sellerDisplayName}.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                  {sellerListings.map((item) => (
                    <ListingCard key={item.id} {...item} />
                  ))}
                </div>
              </section>
            )}

            {relatedListings && relatedListings.length > 0 && (
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-slate-900">
                      Anúncios parecidos
                    </h2>
                    <p className="text-sm text-slate-500">
                      Itens da mesma categoria para comparar melhor antes de
                      falar com o anunciante.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                  {relatedListings.map((item) => (
                    <ListingCard key={item.id} {...item} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
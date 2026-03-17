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
  Star,
  Flag,
  Bell,
  Store,
  Phone,
  Sparkles,
  ExternalLink,
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
    "sobre" | "produto" | "avaliacoes"
  >("sobre");

  const aboutRef = useRef<HTMLElement | null>(null);
  const productRef = useRef<HTMLElement | null>(null);
  const reviewsRef = useRef<HTMLElement | null>(null);

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
    onSuccess: data =>
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
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-96 rounded-2xl bg-gray-200" />
            <div className="h-8 w-3/4 rounded bg-gray-200" />
            <div className="h-6 w-1/4 rounded bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container py-20 text-center">
          <h2 className="mb-4 font-display text-2xl font-bold text-gray-700">
            Anuncio nao encontrado
          </h2>
          <Link href="/busca">
            <Button className="rounded-xl bg-brand-gradient text-white">
              Ver outros anuncios
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatPrice = () => {
    if (!listing.price || listing.priceType === "free") return "Gratis";
    if (listing.priceType === "on_request") return "Sob consulta";
    if (listing.priceType === "negotiable") {
      return `R$ ${Number(listing.price).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
      })} (negociavel)`;
    }
    return `R$ ${Number(listing.price).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
    })}`;
  };

  const whatsappUrl = listing.whatsapp
    ? `https://wa.me/55${listing.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Ola! Vi seu anuncio "${listing.title}" no Norte Vivo e tenho interesse.`
      )}`
    : null;
  const shareText = `Olha esse anuncio no Norte Vivo: ${listing.title}`;
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

  const scrollToSection = (section: "sobre" | "produto" | "avaliacoes") => {
    setActiveSection(section);
    const refs = {
      sobre: aboutRef,
      produto: productRef,
      avaliacoes: reviewsRef,
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
        // Fall back to a WhatsApp share link.
      }
    }

    window.open(whatsappShareUrl, "_blank", "noopener,noreferrer");
  };

  const toggleFollowSeller = () => {
    if (!isAuthenticated) {
      toast.info("Faca login para seguir esta loja.");
      return;
    }
    if (!sellerStorageKey || typeof window === "undefined") return;

    const nextValue = !isFollowingSeller;
    window.localStorage.setItem(sellerStorageKey, nextValue ? "1" : "0");
    setIsFollowingSeller(nextValue);
    toast.success(
      nextValue
        ? "Loja seguida com sucesso."
        : "Voce deixou de seguir esta loja."
    );
  };

  const togglePriceAlert = () => {
    if (!isAuthenticated) {
      toast.info("Faca login para salvar alerta de preco.");
      return;
    }
    if (typeof window === "undefined") return;

    const nextValue = !hasPriceAlert;
    window.localStorage.setItem(priceAlertKey, nextValue ? "1" : "0");
    setHasPriceAlert(nextValue);
    toast.success(
      nextValue
        ? "Aviso de queda de preco ativado para este item."
        : "Aviso de queda de preco removido."
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container py-4 sm:py-6">
        <div className="mb-4 flex items-center gap-2 overflow-hidden text-sm text-gray-500 sm:mb-6">
          <Link href="/" className="hover:text-blue-600">
            Inicio
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/busca" className="hover:text-blue-600">
            Anuncios
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="truncate font-medium text-gray-900">
            {listing.title}
          </span>
        </div>

        <section className="rounded-[32px] border border-orange-100 bg-white/95 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.07)] sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[28px] bg-brand-gradient text-3xl font-black text-white shadow-lg sm:h-28 sm:w-28">
                {listing.seller?.avatar ? (
                  <img src={listing.seller.avatar} alt={sellerDisplayName} className="h-full w-full object-cover" />
                ) : (
                  sellerInitial
                )}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="break-words font-display text-3xl font-black text-slate-900 sm:text-4xl">
                    {sellerDisplayName}
                  </h1>
                  {listing.seller?.isVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                      <BadgeCheck className="h-4 w-4" />
                      Verificado
                    </span>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 font-semibold text-amber-700">
                    <Star className="h-4 w-4 fill-current" />
                    Produto em destaque
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-orange-500" />
                    {sellerLocation}
                  </span>
                  {listingSubcategory && (
                    <span className="inline-flex items-center gap-1.5">
                      <Store className="h-4 w-4 text-blue-500" />
                      {listingSubcategory}
                    </span>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-sm">
                  <Link href={storefrontHref}>
                    <span className="rounded-full bg-orange-50 px-3 py-1 font-medium text-orange-700 transition hover:bg-orange-100">
                      Ver vitrine da loja
                    </span>
                  </Link>
                  <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                    {listing.title}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                    {productViews} visualizacao(oes)
                  </span>
                  {sellerMemberYear && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                      Desde {sellerMemberYear}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[320px]">
              {callUrl && (
                <a href={callUrl}>
                  <Button className="h-12 w-full rounded-2xl bg-slate-900 text-white hover:bg-slate-800">
                    <Phone className="mr-2 h-4 w-4" />
                    Chamar
                  </Button>
                </a>
              )}
              {whatsappUrl && (
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <Button className="h-12 w-full rounded-2xl bg-green-500 text-white hover:bg-green-600">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    WhatsApp
                  </Button>
                </a>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (isAuthenticated) favMutation.mutate({ listingId: listing.id });
                  else toast.info("Faca login para favoritar");
                }}
                className="h-12 rounded-2xl border-rose-200 text-rose-600 hover:bg-rose-50"
              >
                <Heart className="mr-2 h-4 w-4" />
                Favoritar
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  void handleShare();
                }}
                className="h-12 rounded-2xl border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Compartilhar
              </Button>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[24px] border border-slate-200/70 bg-white/90 p-3 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {["sobre", "produto", "avaliacoes"].map(section => (
              <button
                key={section}
                type="button"
                onClick={() =>
                  scrollToSection(section as "sobre" | "produto" | "avaliacoes")
                }
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  activeSection === section
                    ? "bg-orange-500 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {section === "sobre"
                  ? "Sobre"
                  : section === "produto"
                    ? "Produto"
                    : "Avaliacoes"}
              </button>
            ))}
          </div>
        </section>

        <section ref={aboutRef} className="mt-8 scroll-mt-28">
          <div className="mb-5">
            <h2 className="font-display text-2xl font-black text-slate-900">
              Informacoes importantes
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Dados essenciais para o cliente decidir rapido.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
                Localizacao
              </p>
              <p className="mt-2 text-xl font-bold text-slate-900">{sellerLocation}</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(sellerLocation)}`}
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
                Contato rapido
              </p>
              <p className="mt-2 text-xl font-bold text-slate-900">WhatsApp ativo</p>
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
                {listingSubcategory || "Anuncio local"}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {listingCondition || "Consulte detalhes com a loja."}
              </p>
            </article>
          </div>
        </section>

        <section ref={productRef} className="mt-10 scroll-mt-28">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="overflow-hidden rounded-[28px] bg-white shadow-sm">
              <div className="relative aspect-[16/10] bg-gray-100">
                {images.length > 0 ? (
                  <img
                    src={images[currentImage]?.url}
                    alt={listing.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                    <div className="font-display text-8xl font-black text-blue-300">
                      {listing.title.charAt(0)}
                    </div>
                  </div>
                )}
                {listing.isBoosted && (
                  <div className="absolute left-4 top-4">
                    <span className="flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-sm font-bold text-white shadow-md">
                      <Zap className="h-4 w-4" /> DESTAQUE
                    </span>
                  </div>
                )}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImage(i => Math.max(0, i - 1))}
                      className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md transition-colors hover:bg-white"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentImage(i => Math.min(images.length - 1, i + 1))
                      }
                      className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md transition-colors hover:bg-white"
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
                    >
                      <img src={img.url} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="rounded-[28px] bg-white p-6 shadow-sm">
                <div className="flex flex-wrap gap-2">
                  {listing.type && (
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {listing.type === "product"
                        ? "Produto"
                        : listing.type === "service"
                          ? "Servico"
                          : listing.type === "vehicle"
                            ? "Veiculo"
                            : listing.type === "property"
                              ? "Imovel"
                              : listing.type === "food"
                                ? "Delivery"
                                : "Vaga"}
                    </span>
                  )}
                  {listingCondition && (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {listingCondition}
                    </span>
                  )}
                </div>
                <h2 className="mt-4 break-words font-display text-3xl font-black text-slate-900">
                  {listing.title}
                </h2>
                <div className="mt-3 break-words text-3xl font-black" style={{ color: "oklch(0.48 0.22 255)" }}>
                  {formatPrice()}
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {productViews} visualizacoes
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {productAge}
                  </span>
                </div>
                {listing.description && (
                  <div className="mt-6">
                    <h3 className="mb-2 font-bold text-slate-900">Descricao</h3>
                    <p className="whitespace-pre-wrap break-words leading-relaxed text-slate-600">
                      {listing.description}
                    </p>
                  </div>
                )}
              </div>

              <div className="rounded-[28px] bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Acoes rapidas
                </p>
                <div className="mt-4 space-y-3">
                  {whatsappUrl && (
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                      <Button className="w-full rounded-2xl bg-green-500 py-6 text-base font-bold text-white hover:bg-green-600">
                        <MessageCircle className="mr-2 h-5 w-5" />
                        Chamar no WhatsApp
                      </Button>
                    </a>
                  )}
                  <Button type="button" variant="outline" onClick={toggleFollowSeller} className="w-full rounded-2xl py-6 text-base">
                    <Store className="mr-2 h-5 w-5" />
                    {isFollowingSeller ? "Seguindo loja" : "Seguir loja"}
                  </Button>
                  <Button type="button" variant="outline" onClick={togglePriceAlert} className="w-full rounded-2xl py-6 text-base">
                    <Bell className="mr-2 h-5 w-5" />
                    {hasPriceAlert ? "Aviso de preco ativo" : "Avisar queda de preco"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
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
                      {Number(item.viewCount ?? 0)} views
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-sm text-slate-500">
              A loja ainda nao tem outros produtos suficientes para este ranking.
            </p>
          )}
        </section>

        <section ref={reviewsRef} className="mt-10 scroll-mt-28">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-display text-2xl font-black text-slate-900">
                  Avaliacoes
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Area pronta para reputacao e prova social da loja.
                </p>
              </div>
              <div className="rounded-[24px] bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <span className="font-semibold text-slate-900">Status:</span>{" "}
                sem avaliacoes publicas no portal
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-[32px] bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_50%,#f97316_140%)] p-6 text-white shadow-[0_22px_70px_rgba(15,23,42,0.22)] sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-200">
                Quer comprar?
              </p>
              <h2 className="mt-3 font-display text-3xl font-black">
                Fale com a loja e acompanhe novidades.
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-200 sm:text-base">
                Nunca pague antecipado. Prefira negociar pessoalmente ou via
                WhatsApp com o anunciante.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[340px]">
              {whatsappUrl && (
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
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
              >
                <Share2 className="mr-2 h-4 w-4" />
                Compartilhar
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={toggleFollowSeller}
                className="h-12 rounded-2xl border-white/30 bg-white/10 text-white hover:bg-white/15"
              >
                <Store className="mr-2 h-4 w-4" />
                {isFollowingSeller ? "Seguindo loja" : "Seguir perfil"}
              </Button>
              <button className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-4 text-sm font-medium text-white transition hover:bg-white/15">
                <Flag className="mr-2 h-4 w-4" />
                Denunciar anuncio
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
                    <h2 className="font-display text-2xl font-bold text-gray-900">
                      Mais da mesma loja
                    </h2>
                    <p className="text-sm text-gray-500">
                      Outros itens publicados por {sellerDisplayName}.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                  {sellerListings.map(item => (
                    <ListingCard key={item.id} {...item} />
                  ))}
                </div>
              </section>
            )}

            {relatedListings && relatedListings.length > 0 && (
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-gray-900">
                      Anuncios parecidos
                    </h2>
                    <p className="text-sm text-gray-500">
                      Itens da mesma categoria para comparar melhor antes de
                      falar com o anunciante.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                  {relatedListings.map(item => (
                    <ListingCard key={item.id} {...item} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

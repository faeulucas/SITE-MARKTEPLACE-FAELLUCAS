import { type ComponentType, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { LOGIN_ROUTE } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  CreditCard,
  LayoutGrid,
  Lock,
  LogIn,
  Mail,
  MapPin,
  Menu,
  MessageSquare,
  Pencil,
  Receipt,
  Rocket,
  Settings,
  Shield,
  ShoppingBag,
  Star,
  Store,
  User,
  Wallet,
} from "lucide-react";

type DashboardItem = {
  key: string;
  label: string;
  description: string;
  href?: string;
};

type DashboardGroup = {
  key: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  items: DashboardItem[];
};

type ActionCard = {
  key: string;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  href?: string;
  selectedKey?: string;
  tone?: "default" | "success" | "premium";
  badge?: string;
};

const ACCOUNT_GROUPS = (
  isAdvertiser: boolean,
  isStoreOwner: boolean
): DashboardGroup[] => [
  {
    key: "conta",
    label: "Minha Conta",
    icon: User,
    items: [
      {
        key: "perfil",
        label: "Informacoes do Perfil",
        description: "Dados principais da sua conta e apresentacao publica.",
        href: "/anunciante/meus-dados",
      },
      {
        key: "seguranca",
        label: "Seguranca",
        description: "Senha, acesso e protecao da conta.",
      },
      {
        key: "enderecos",
        label: "Enderecos",
        description: "Locais salvos para compras e contato.",
      },
      {
        key: "cartoes",
        label: "Cartoes",
        description: "Metodos de pagamento ja cadastrados.",
      },
      {
        key: "comunicacoes",
        label: "Comunicacoes",
        description: "Escolha o que voce quer receber.",
      },
      {
        key: "privacidade",
        label: "Privacidade",
        description: "Controle dos seus dados e permissoes.",
      },
    ],
  },
  {
    key: "compras",
    label: "Minhas Compras",
    icon: ShoppingBag,
    items: [
      {
        key: "pedidos",
        label: "Pedidos",
        description: "Acompanhe compras e negociacoes recentes.",
      },
      {
        key: "favoritos",
        label: "Favoritos",
        description: "Anuncios e lojas que voce salvou.",
        href: "/favoritos",
      },
      {
        key: "cashback",
        label: "Cashback",
        description: "Saldo e vantagens acumuladas no portal.",
      },
    ],
  },
  ...(isAdvertiser
    ? [
        {
          key: "anuncios",
          label: "Meus Anuncios",
          icon: LayoutGrid,
          items: [
            {
              key: "ativos",
              label: "Anuncios Ativos",
              description: "Itens publicados e aparecendo no portal.",
              href: "/anunciante",
            },
            {
              key: "pausados",
              label: "Anuncios Pausados",
              description: "Itens prontos para voltar ao ar.",
              href: "/anunciante",
            },
            {
              key: "novo",
              label: "Criar Novo Anuncio",
              description: "Publique mais produtos ou servicos.",
              href: "/anunciante/novo",
            },
            {
              key: "booster",
              label: "Booster",
              description: "Impulsione anuncios para ganhar alcance.",
              href: "/booster",
            },
          ],
        },
      ]
    : []),
  ...(isStoreOwner
    ? [
        {
          key: "lojas",
          label: "Minhas Lojas",
          icon: Store,
          items: [
            {
              key: "vitrine",
              label: "Minha Vitrine",
              description: "Resumo comercial da sua loja.",
              href: "/lojas",
            },
            {
              key: "produtos-loja",
              label: "Produtos da Loja",
              description: "Catalogo e itens vinculados ao perfil PJ.",
              href: "/anunciante",
            },
            {
              key: "pedidos-loja",
              label: "Pedidos da Loja",
              description: "Atendimento e movimentacao comercial.",
            },
            {
              key: "config-loja",
              label: "Configuracoes da Loja",
              description: "Perfil, horarios e contato da empresa.",
              href: "/anunciante/meus-dados",
            },
          ],
        },
      ]
    : []),
  {
    key: "faturamento",
    label: "Faturamento",
    icon: Wallet,
    items: [
      {
        key: "extrato",
        label: "Extrato",
        description: "Resumo financeiro da sua conta.",
      },
      {
        key: "pagamentos",
        label: "Pagamentos",
        description: "Movimentacoes, recebimentos e cobrancas.",
      },
      {
        key: "planos",
        label: "Planos e Assinaturas",
        description: "Booster, destaque e planos profissionais.",
        href: "/planos",
      },
    ],
  },
  {
    key: "configuracoes",
    label: "Configuracoes",
    icon: Settings,
    items: [
      {
        key: "notificacoes",
        label: "Notificacoes",
        description: "Alertas de anuncios, pedidos e conversas.",
      },
      {
        key: "preferencias",
        label: "Preferencias",
        description: "Escolhas de uso, cidade e interesses.",
      },
      {
        key: "ajuda",
        label: "Ajuda",
        description: "Suporte, orientacoes e contato.",
      },
    ],
  },
];

export default function MyAccountPanel() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    conta: true,
    compras: true,
    anuncios: true,
    lojas: true,
    faturamento: true,
    configuracoes: true,
  });
  const [selectedItem, setSelectedItem] = useState("perfil");

  const { data: advertiserStats } = trpc.advertiser.stats.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: favorites } = trpc.advertiser.myFavorites.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container py-20 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-100">
            <LogIn className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="font-display text-3xl font-black text-gray-900">
            Entre para acessar sua conta
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-gray-500">
            Veja seus dados, compras, favoritos, anuncios e tudo o que voce
            movimenta dentro do Norte Vivo.
          </p>
          <Link href={LOGIN_ROUTE}>
            <Button className="mt-6 rounded-2xl bg-brand-gradient px-8 py-6 text-white">
              Entrar / Cadastrar
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const listings = advertiserStats?.listings ?? [];
  const favoriteCount = favorites?.length ?? 0;
  const isStoreOwner = user.personType === "pj";
  const isAdvertiser = isStoreOwner || listings.length > 0;
  const hasBuyerSignals = favoriteCount > 0;
  const accountTypeLabel = isStoreOwner
    ? hasBuyerSignals
      ? "Ambos"
      : "Anunciante PJ"
    : isAdvertiser
      ? hasBuyerSignals
        ? "Ambos"
        : "Anunciante PF"
      : "Comprador";
  const displayName =
    user.personType === "pj" ? user.companyName || user.name : user.name;
  const displayNameText = displayName || "Perfil";
  const displayInitial = displayName?.charAt(0)?.toUpperCase() || "N";
  const avatarSrc = typeof user.avatar === "string" ? user.avatar : undefined;
  const planActive = Boolean(user.trialStartedAt);
  const groups = ACCOUNT_GROUPS(isAdvertiser, isStoreOwner);
  const flatItems = groups.flatMap(group => group.items);
  const selectedDetails =
    flatItems.find(item => item.key === selectedItem) ?? flatItems[0];

  const actionCards = useMemo<ActionCard[]>(() => {
    const cards: ActionCard[] = [
      {
        key: "perfil-card",
        title: "Informacoes do seu perfil",
        description: "Dados pessoais e da conta.",
        icon: User,
        href: "/anunciante/meus-dados",
        selectedKey: "perfil",
      },
      {
        key: "seguranca-card",
        title: "Seguranca",
        description: "Voce configurou a seguranca da sua conta.",
        icon: Lock,
        selectedKey: "seguranca",
        tone: "success",
        badge: "Protegida",
      },
      ...(planActive
        ? [
            {
              key: "plus-card",
              title: "NorteVivo+",
              description: "Assinatura com beneficios exclusivos.",
              icon: Star,
              href: "/planos",
              selectedKey: "planos",
              tone: "premium" as const,
              badge: "Ativo",
            },
          ]
        : []),
      {
        key: "cartoes-card",
        title: "Meus Cartoes",
        description: "Cartoes salvos na sua conta.",
        icon: CreditCard,
        selectedKey: "cartoes",
      },
      {
        key: "enderecos-card",
        title: "Meus Enderecos",
        description: "Enderecos salvos na sua conta.",
        icon: MapPin,
        selectedKey: "enderecos",
      },
      {
        key: "privacidade-card",
        title: "Privacidade",
        description: "Preferencias e controle do uso dos seus dados.",
        icon: Shield,
        selectedKey: "privacidade",
      },
      {
        key: "comunicacoes-card",
        title: "Comunicacoes",
        description: "Escolha que tipo de informacao quer receber.",
        icon: MessageSquare,
        selectedKey: "comunicacoes",
      },
      {
        key: "pedidos-card",
        title: "Meus Pedidos",
        description: "Acompanhe suas compras e vendas.",
        icon: ShoppingBag,
        selectedKey: "pedidos",
      },
      ...(isAdvertiser
        ? [
            {
              key: "anuncios-card",
              title: "Meus Anuncios",
              description: "Gerencie seus anuncios ativos e pausados.",
              icon: LayoutGrid,
              href: "/anunciante",
              selectedKey: "ativos",
              badge: `${listings.length}`,
            },
            {
              key: "booster-card",
              title: "Booster",
              description: "Impulsione seus anuncios e alcance mais clientes.",
              icon: Rocket,
              href: "/booster",
              selectedKey: "booster",
            },
          ]
        : []),
      ...(isStoreOwner
        ? [
            {
              key: "loja-card",
              title: "Minha Loja",
              description: "Gerencie sua vitrine e produtos.",
              icon: Store,
              href: "/anunciante/meus-dados",
              selectedKey: "config-loja",
            },
          ]
        : []),
      {
        key: "faturamento-card",
        title: "Faturamento",
        description: "Visualize seu extrato e pagamentos.",
        icon: Receipt,
        href: "/planos",
        selectedKey: "extrato",
      },
    ];

    return cards;
  }, [isAdvertiser, isStoreOwner, listings.length, planActive]);

  const handleItemClick = (item: DashboardItem) => {
    setSelectedItem(item.key);
    setMobileMenuOpen(false);
    if (item.href) {
      navigate(item.href);
    }
  };

  const renderSidebar = () => (
    <div className="flex h-full flex-col rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-5">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-600">
          Minha Conta
        </p>
        <h2 className="mt-2 font-display text-2xl font-black text-slate-900">
          Painel Norte Vivo
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Dados, compras, anuncios, loja e faturamento em um so lugar.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        {groups.map(group => {
          const Icon = group.icon;
          const expanded = expandedGroups[group.key] ?? true;
          return (
            <section key={group.key} className="mb-2">
              <button
                type="button"
                onClick={() =>
                  setExpandedGroups(current => ({
                    ...current,
                    [group.key]: !expanded,
                  }))
                }
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-slate-50"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="flex-1 font-semibold text-slate-900">
                  {group.label}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition-transform ${
                    expanded ? "rotate-180" : ""
                  }`}
                />
              </button>

              {expanded && (
                <div className="mt-1 space-y-1 pl-3">
                  {group.items.map(item => {
                    const active = selectedItem === item.key;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => handleItemClick(item)}
                        className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition-all ${
                          active
                            ? "bg-blue-50 font-semibold text-blue-700"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <span className="flex-1">{item.label}</span>
                        <ChevronRight className="h-4 w-4 shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>

      <div className="border-t border-slate-100 px-5 py-4">
        <button
          type="button"
          onClick={() => logout()}
          className="flex w-full items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
        >
          Sair da conta
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container py-4 sm:py-6">
        <div className="mb-4 flex items-center justify-between gap-3 lg:hidden">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-600">
              Minha Conta
            </p>
            <h1 className="font-display text-2xl font-black text-slate-900">
              Seu painel
            </h1>
          </div>
          <Button
            type="button"
            variant="outline"
            className="rounded-2xl"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="mr-2 h-4 w-4" />
            Menu
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[290px_minmax(0,1fr)]">
          <aside className="hidden lg:block">{renderSidebar()}</aside>

          <div className="space-y-6">
            <section className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-4">
                  <Avatar className="h-20 w-20 rounded-[26px] border border-slate-200">
                    <AvatarImage src={avatarSrc} alt={displayNameText} />
                    <AvatarFallback className="bg-brand-gradient text-2xl font-black text-white">
                      {displayInitial}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="font-display text-2xl font-black text-slate-900 sm:text-3xl">
                        {displayName}
                      </h1>
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                        {accountTypeLabel}
                      </span>
                    </div>
                    <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                      <Mail className="h-4 w-4 shrink-0" />
                      {user.email}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                      <span className="rounded-full bg-slate-100 px-3 py-1.5 font-semibold text-slate-600">
                        {favoriteCount} favorito(s)
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1.5 font-semibold text-slate-600">
                        {advertiserStats?.totalListings ?? 0} anuncio(s)
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1.5 font-semibold text-slate-600">
                        {advertiserStats?.totalViews ?? 0} visualizacao(oes)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link href="/anunciante/meus-dados" className="block">
                    <Button variant="outline" className="w-full rounded-2xl">
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar Perfil
                    </Button>
                  </Link>
                  {isAdvertiser && (
                    <Link href="/anunciante/novo" className="block">
                      <Button className="w-full rounded-2xl bg-orange-500 text-white hover:bg-orange-600">
                        Novo anuncio
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex flex-col gap-2 border-b border-slate-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-600">
                    Visao Geral
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-black text-slate-900">
                    Acessos rapidos da sua conta
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Abra as partes mais importantes do seu painel sem ficar
                    procurando menu por menu.
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <span className="font-semibold text-slate-900">
                    Em destaque:
                  </span>{" "}
                  {selectedDetails.label}
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {actionCards.map(card => {
                  const Icon = card.icon;
                  const toneClasses =
                    card.tone === "success"
                      ? "bg-emerald-50 text-emerald-700"
                      : card.tone === "premium"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-blue-50 text-blue-700";

                  const content = (
                    <article
                      className="group h-full rounded-[26px] border border-slate-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                      onClick={() => {
                        if (card.selectedKey) setSelectedItem(card.selectedKey);
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${toneClasses}`}
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                        {card.badge && (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                            {card.badge}
                          </span>
                        )}
                      </div>
                      <h3 className="mt-4 font-display text-xl font-black text-slate-900">
                        {card.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {card.description}
                      </p>
                      <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
                        Abrir
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </article>
                  );

                  return card.href ? (
                    <Link key={card.key} href={card.href} className="block">
                      {content}
                    </Link>
                  ) : (
                    <button
                      key={card.key}
                      type="button"
                      className="block text-left"
                      onClick={() => {
                        if (card.selectedKey) setSelectedItem(card.selectedKey);
                      }}
                    >
                      {content}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
              <article className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-600">
                  Secao selecionada
                </p>
                <h2 className="mt-2 font-display text-2xl font-black text-slate-900">
                  {selectedDetails.label}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
                  {selectedDetails.description}
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[24px] bg-slate-50 p-5">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                      Conta
                    </p>
                    <p className="mt-2 text-lg font-bold text-slate-900">
                      {accountTypeLabel}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      Seu painel adapta atalhos para compras, anuncios e
                      operacao de loja conforme o tipo da conta.
                    </p>
                  </div>
                  <div className="rounded-[24px] bg-slate-50 p-5">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                      Proximo passo
                    </p>
                    <p className="mt-2 text-lg font-bold text-slate-900">
                      {isAdvertiser
                        ? "Mantenha anuncios e perfil atualizados"
                        : "Complete seus dados e salve favoritos"}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      Quanto mais completa a conta, mais facil acompanhar
                      oportunidades, vendas e contatos.
                    </p>
                  </div>
                </div>
              </article>

              <aside className="space-y-4">
                <article className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                      <Bell className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-display text-xl font-black text-slate-900">
                        Alertas da conta
                      </h3>
                      <p className="text-sm text-slate-500">
                        Resumo rapido do que importa hoje.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="font-semibold text-slate-900">
                        {favoriteCount > 0
                          ? `${favoriteCount} item(ns) salvo(s) em favoritos`
                          : "Voce ainda nao salvou favoritos"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Use favoritos para acompanhar anuncios e voltar depois.
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="font-semibold text-slate-900">
                        {isAdvertiser
                          ? `${advertiserStats?.totalListings ?? 0} anuncio(s) no ar ou em gestao`
                          : "Sua conta esta pronta para comprar ou anunciar"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Acesse o painel sempre que quiser atualizar dados,
                        contatos e publicacoes.
                      </p>
                    </div>
                  </div>
                </article>

                <article className="rounded-[30px] bg-gradient-to-br from-slate-900 via-slate-900 to-orange-700 p-5 text-white shadow-lg">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-200">
                    Norte Vivo
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-black">
                    Sua conta como centro de compras, anuncios e negocios.
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-200">
                    Gerencie tudo em um painel unico e fique mais perto das
                    oportunidades da sua cidade.
                  </p>
                  <div className="mt-5 grid gap-3">
                    <Link href="/planos" className="block">
                      <Button className="w-full rounded-2xl bg-white text-slate-900 hover:bg-slate-100">
                        Ver planos
                      </Button>
                    </Link>
                    <Link href="/anunciante/novo" className="block">
                      <Button
                        variant="outline"
                        className="w-full rounded-2xl border-white/20 bg-white/10 text-white hover:bg-white/15"
                      >
                        Publicar anuncio
                      </Button>
                    </Link>
                  </div>
                </article>
              </aside>
            </section>
          </div>
        </div>
      </main>

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[88vw] max-w-sm p-0">
          <SheetHeader className="border-b border-slate-100 px-5 py-5 text-left">
            <SheetTitle className="font-display text-2xl font-black text-slate-900">
              Minha Conta
            </SheetTitle>
            <SheetDescription>
              Navegue pelas areas da sua conta no Norte Vivo.
            </SheetDescription>
          </SheetHeader>
          <div className="h-full overflow-y-auto p-3">{renderSidebar()}</div>
        </SheetContent>
      </Sheet>

      <Footer />
    </div>
  );
}

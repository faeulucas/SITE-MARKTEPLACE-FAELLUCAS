import { useMemo, useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { LOGIN_ROUTE } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  AlertTriangle,
  BadgeCheck,
  Ban,
  BarChart3,
  CheckCircle2,
  Clock3,
  LogIn,
  Search,
  Shield,
  Users,
  Package,
  XCircle,
  Zap,
} from "lucide-react";

type AdminTab = "overview" | "listings" | "users";

export default function AdminDashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [tab, setTab] = useState<AdminTab>("overview");
  const [listingFilter, setListingFilter] = useState("all");
  const [userQuery, setUserQuery] = useState("");
  const utils = trpc.useUtils();

  const canLoadAdmin = isAuthenticated && user?.role === "admin";
  const { data: adminStats } = trpc.admin.stats.useQuery(undefined, { enabled: canLoadAdmin });
  const { data: allListings } = trpc.admin.allListings.useQuery(
    listingFilter === "all" ? {} : { status: listingFilter },
    { enabled: canLoadAdmin }
  );
  const { data: allUsers } = trpc.admin.allUsers.useQuery({}, { enabled: canLoadAdmin });

  const moderateMutation = trpc.admin.moderateListing.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.admin.allListings.invalidate(), utils.admin.stats.invalidate()]);
      toast.success("Moderacao aplicada.");
    },
  });

  const banUserMutation = trpc.admin.banUser.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.admin.allUsers.invalidate(), utils.admin.stats.invalidate()]);
      toast.success("Status do usuario atualizado.");
    },
  });

  const filteredUsers = useMemo(() => {
    const items = allUsers ?? [];
    if (!userQuery.trim()) return items;
    const search = userQuery.toLowerCase();
    return items.filter(item =>
      [item.name, item.email, item.openId]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(search))
    );
  }, [allUsers, userQuery]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 px-6 text-white">
        <div className="max-w-md text-center">
          <Shield className="mx-auto mb-4 h-16 w-16 text-blue-400" />
          <h1 className="font-display text-3xl font-black">Area administrativa</h1>
          <p className="mt-3 text-gray-400">Entre com uma conta autorizada para acessar o painel.</p>
          <Link href={LOGIN_ROUTE}>
            <Button className="mt-6 rounded-2xl bg-brand-gradient px-8 text-white">
              <LogIn className="mr-2 h-4 w-4" />
              Entrar
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 px-6 text-white">
        <div className="max-w-md text-center">
          <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-amber-400" />
          <h1 className="font-display text-3xl font-black">Acesso negado</h1>
          <p className="mt-3 text-gray-400">Sua conta nao possui permissao para usar esta area.</p>
          <Link href="/">
            <Button className="mt-6 rounded-2xl bg-white text-gray-900 hover:bg-gray-100">
              Voltar ao site
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-gradient">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-display text-xl font-black">Painel Admin</div>
              <div className="text-xs text-gray-400">Moderacao, usuarios e operacao</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">{user?.name}</span>
            <Link href="/">
              <Button variant="outline" className="rounded-2xl border-gray-700 text-gray-200 hover:bg-gray-800">
                Ver site
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          {[
            { label: "Usuarios", value: adminStats?.totalUsers ?? 0, icon: Users, tone: "bg-blue-500/15 text-blue-300" },
            { label: "Anuncios", value: adminStats?.totalListings ?? 0, icon: Package, tone: "bg-emerald-500/15 text-emerald-300" },
            { label: "Ativos", value: adminStats?.activeListings ?? 0, icon: BadgeCheck, tone: "bg-green-500/15 text-green-300" },
            { label: "Pendentes", value: adminStats?.pendingListings ?? 0, icon: Clock3, tone: "bg-amber-500/15 text-amber-300" },
            { label: "Boosters", value: adminStats?.activeBoosters ?? 0, icon: Zap, tone: "bg-fuchsia-500/15 text-fuchsia-300" },
            { label: "Banidos", value: adminStats?.bannedUsers ?? 0, icon: Ban, tone: "bg-rose-500/15 text-rose-300" },
          ].map(item => {
            const Icon = item.icon;
            return (
              <article key={item.label} className="rounded-[24px] border border-gray-800 bg-gray-900 p-5">
                <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-2xl ${item.tone}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-3xl font-black text-white">{item.value.toLocaleString()}</div>
                <div className="mt-1 text-sm text-gray-400">{item.label}</div>
              </article>
            );
          })}
        </section>

        <section className="mt-6 flex flex-wrap gap-2 rounded-[24px] bg-gray-900 p-2">
          {[
            { id: "overview", label: "Visao geral" },
            { id: "listings", label: "Anuncios" },
            { id: "users", label: "Usuarios" },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id as AdminTab)}
              className={`rounded-2xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                tab === item.id ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </section>

        {tab === "overview" && (
          <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[28px] border border-gray-800 bg-gray-900 p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold">Resumo operacional</h2>
                  <p className="text-sm text-gray-400">Panorama rapido do marketplace.</p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { title: "Fila de moderacao", value: adminStats?.pendingListings ?? 0, note: "anuncio(s) aguardando aprovacao" },
                  { title: "Conteudo rejeitado", value: adminStats?.rejectedListings ?? 0, note: "anuncio(s) com bloqueio" },
                  { title: "Usuarios banidos", value: adminStats?.bannedUsers ?? 0, note: "conta(s) restrita(s)" },
                  { title: "Ativacao de boosters", value: adminStats?.activeBoosters ?? 0, note: "campanha(s) ativa(s)" },
                ].map(card => (
                  <div key={card.title} className="rounded-[22px] bg-gray-800 p-4">
                    <div className="text-sm font-semibold text-white">{card.title}</div>
                    <div className="mt-2 text-3xl font-black">{card.value}</div>
                    <div className="mt-1 text-xs text-gray-400">{card.note}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-gray-800 bg-gray-900 p-6">
              <h2 className="font-display text-2xl font-bold">Acoes rapidas</h2>
              <div className="mt-5 space-y-3">
                {[
                  { title: "Ir para anuncios pendentes", description: "Moderar o que esta aguardando aprovacao.", action: () => { setListingFilter("pending"); setTab("listings"); } },
                  { title: "Auditar usuarios", description: "Revisar perfis, acessos e bloqueios.", action: () => setTab("users") },
                  { title: "Voltar ao site", description: "Ver a experiencia publica do marketplace.", action: () => { window.location.href = "/"; } },
                ].map(item => (
                  <button
                    key={item.title}
                    onClick={item.action}
                    className="w-full rounded-[22px] border border-gray-800 bg-gray-950 px-4 py-4 text-left transition-colors hover:border-gray-700 hover:bg-gray-800"
                  >
                    <div className="font-semibold text-white">{item.title}</div>
                    <div className="mt-1 text-sm text-gray-400">{item.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {tab === "listings" && (
          <section className="mt-6 rounded-[28px] border border-gray-800 bg-gray-900 p-6">
            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold">Moderacao de anuncios</h2>
                <p className="text-sm text-gray-400">Revise status, responsavel e contexto de cada publicacao.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {["all", "pending", "active", "paused", "rejected"].map(item => (
                  <button
                    key={item}
                    onClick={() => setListingFilter(item)}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] ${listingFilter === item ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400"}`}
                  >
                    {item === "all" ? "Todos" : item}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {(allListings ?? []).map((listing: any) => (
                <article key={listing.id} className="rounded-[22px] border border-gray-800 bg-gray-950 p-4">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-white">{listing.title}</h3>
                        <span className="rounded-full bg-gray-800 px-2.5 py-1 text-[11px] font-semibold text-gray-300">
                          {listing.status}
                        </span>
                        {listing.isBoosted && (
                          <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-[11px] font-bold text-amber-300">
                            Boost
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-400">
                        <span>Anunciante: {listing.sellerName ?? "Sem nome"}</span>
                        <span>Cidade: {listing.cityName ?? "Sem cidade"}</span>
                        <span>Categoria: {listing.categoryName ?? "Sem categoria"}</span>
                        <span>Views: {listing.viewCount ?? 0}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-500" onClick={() => moderateMutation.mutate({ id: listing.id, status: "active" })}>
                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                        Aprovar
                      </Button>
                      <Button size="sm" variant="outline" className="rounded-xl border-amber-700 text-amber-300 hover:bg-amber-500/10" onClick={() => moderateMutation.mutate({ id: listing.id, status: "paused" })}>
                        <Clock3 className="mr-1 h-3.5 w-3.5" />
                        Pausar
                      </Button>
                      <Button size="sm" variant="outline" className="rounded-xl border-red-800 text-red-300 hover:bg-red-500/10" onClick={() => moderateMutation.mutate({ id: listing.id, status: "rejected" })}>
                        <XCircle className="mr-1 h-3.5 w-3.5" />
                        Rejeitar
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {tab === "users" && (
          <section className="mt-6 rounded-[28px] border border-gray-800 bg-gray-900 p-6">
            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold">Usuarios</h2>
                <p className="text-sm text-gray-400">Busque e aplique restricoes quando necessario.</p>
              </div>
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  value={userQuery}
                  onChange={event => setUserQuery(event.target.value)}
                  placeholder="Buscar por nome, email ou openId"
                  className="w-full rounded-2xl border border-gray-800 bg-gray-950 py-3 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredUsers.map(item => (
                <article key={item.id} className="flex flex-col gap-4 rounded-[22px] border border-gray-800 bg-gray-950 p-4 xl:flex-row xl:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-gradient font-bold text-white">
                      {item.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-white">{item.name || "Sem nome"}</h3>
                        {item.role === "admin" && (
                          <span className="rounded-full bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white">admin</span>
                        )}
                        {item.isBanned && (
                          <span className="rounded-full bg-red-500/15 px-2.5 py-1 text-[11px] font-bold text-red-300">banido</span>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-400">
                        <span>{item.email || "Sem email"}</span>
                        <span>OpenId: {item.openId}</span>
                        <span>Cadastro: {new Date(item.createdAt).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>
                  </div>
                  {item.role !== "admin" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className={`rounded-xl ${item.isBanned ? "border-emerald-700 text-emerald-300 hover:bg-emerald-500/10" : "border-red-800 text-red-300 hover:bg-red-500/10"}`}
                      onClick={() => banUserMutation.mutate({ id: item.id, banned: !item.isBanned })}
                    >
                      <Ban className="mr-1 h-3.5 w-3.5" />
                      {item.isBanned ? "Desbanir" : "Banir"}
                    </Button>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { LOGIN_ROUTE } from "@/const";
import {
  BadgeCheck,
  ChevronRight,
  Home,
  LayoutGrid,
  LogIn,
  Menu,
  MessageCircle,
  Search,
  ShoppingBag,
  Store,
  Wallet,
  Zap,
} from "lucide-react";

export default function MobileBottomNav() {
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const menuItems = [
    {
      label: isAuthenticated ? "Meu perfil" : "Entrar",
      href: isAuthenticated ? "/minha-conta" : LOGIN_ROUTE,
      icon: isAuthenticated ? Store : LogIn,
    },
    {
      label: "Chat",
      href: isAuthenticated ? "/anunciante" : LOGIN_ROUTE,
      icon: MessageCircle,
    },
    {
      label: "Meus anuncios",
      href: isAuthenticated ? "/anunciante" : LOGIN_ROUTE,
      icon: LayoutGrid,
    },
    {
      label: "Minhas vendas",
      href: isAuthenticated ? "/anunciante" : LOGIN_ROUTE,
      icon: ShoppingBag,
    },
    {
      label: "Plano profissional",
      href: "/planos",
      icon: BadgeCheck,
    },
    {
      label: "Minhas compras",
      href: isAuthenticated ? "/favoritos" : LOGIN_ROUTE,
      icon: Wallet,
    },
  ];

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-[61] border-t border-slate-200 bg-white/95 px-3 py-2 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-2">
          <Link
            href="/"
            className={`flex min-w-0 flex-col items-center gap-1 px-1 py-1 text-[11px] font-medium ${
              !menuOpen && location === "/" ? "text-orange-500" : "text-slate-700"
            }`}
          >
            <Home className="h-5 w-5" />
            <span className="whitespace-nowrap">Inicio</span>
          </Link>
          <Link
            href="/busca"
            className={`flex min-w-0 flex-col items-center gap-1 px-1 py-1 text-[11px] font-medium ${
              !menuOpen && location.startsWith("/busca")
                ? "text-orange-500"
                : "text-slate-700"
            }`}
          >
            <Search className="h-5 w-5" />
            <span className="whitespace-nowrap">Buscar</span>
          </Link>
          <Link
            href={isAuthenticated ? "/anunciante/novo" : LOGIN_ROUTE}
            className={`flex min-w-0 flex-col items-center gap-1 px-1 py-1 text-[11px] font-medium ${
              !menuOpen &&
              (location.startsWith("/anunciante/novo") || location.startsWith("/anunciar"))
                ? "text-orange-500"
                : "text-slate-700"
            }`}
          >
            <span className="relative inline-flex">
              <Zap className="h-5 w-5 animate-nav-bolt" />
              <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-orange-500/70 animate-nav-bolt-ping" />
            </span>
            <span className="whitespace-nowrap">Anunciar</span>
          </Link>
          <Link
            href={isAuthenticated ? "/anunciante" : LOGIN_ROUTE}
            className={`flex min-w-0 flex-col items-center gap-1 px-1 py-1 text-[11px] font-medium ${
              !menuOpen &&
              (location.startsWith("/anunciante") || location.startsWith("/entrar"))
                ? "text-orange-500"
                : "text-slate-700"
            }`}
          >
            <MessageCircle className="h-5 w-5" />
            <span className="whitespace-nowrap">Chat</span>
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen(current => !current)}
            className={`flex min-w-0 flex-col items-center gap-1 px-1 py-1 text-[11px] font-medium ${
              menuOpen ? "text-orange-500" : "text-slate-700"
            }`}
          >
            {menuOpen ? <LayoutGrid className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="whitespace-nowrap">Menu</span>
          </button>
        </div>
      </nav>

      <div
        className={`fixed inset-x-0 bottom-[72px] top-0 z-[60] overflow-hidden md:hidden ${
          menuOpen ? "pointer-events-auto bg-white" : "pointer-events-none bg-transparent"
        }`}
      >
        <div
          className={`h-full overflow-y-auto border-t border-slate-200 bg-white shadow-[0_-18px_60px_rgba(15,23,42,0.16)] transition-all duration-200 ease-out ${
            menuOpen
              ? "translate-y-0 translate-x-0 opacity-100"
              : "translate-y-4 opacity-0"
          }`}
          style={{ transformOrigin: "bottom right" }}
        >
          <div className="divide-y divide-slate-100">
            {menuItems.map(item => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-5 py-4 text-sm font-medium text-slate-800"
                >
                  <Icon className="h-5 w-5 text-slate-600" />
                  <span className="flex-1">{item.label}</span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

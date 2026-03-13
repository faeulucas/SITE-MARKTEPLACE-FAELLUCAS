import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { LOGIN_ROUTE } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin, Search, Bell, Plus, User, LogOut, LayoutDashboard,
  Shield, Heart, Menu, X, ChevronDown, Zap
} from "lucide-react";

interface HeaderProps {
  selectedCity?: number | null;
  onCityChange?: (cityId: number | null) => void;
  onSearch?: (q: string) => void;
}

export default function Header({ selectedCity, onCityChange, onSearch }: HeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();
  const [searchQ, setSearchQ] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: cities } = trpc.public.cities.useQuery();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(searchQ);
    else navigate(`/busca?q=${encodeURIComponent(searchQ)}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md border-b border-gray-100">
      {/* Top bar */}
      <div className="bg-brand-gradient text-white py-1.5 px-4 text-center text-xs font-medium">
        🚀 Anuncie grátis por 30 dias no Norte Vivo — O marketplace do Norte Pioneiro do Paraná!
      </div>

      {/* Main header */}
      <div className="container">
        <div className="flex items-center gap-3 py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 bg-brand-gradient rounded-xl flex items-center justify-center shadow-md">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-display font-black text-xl text-gray-900">Norte</span>
              <span className="font-display font-black text-xl" style={{ color: "oklch(0.68 0.19 45)" }}>Vivo</span>
            </div>
          </Link>

          {/* City selector */}
          <div className="hidden md:flex items-center gap-1 text-sm text-gray-600 shrink-0">
            <MapPin className="w-4 h-4 text-blue-600" />
            <Select
              value={selectedCity ? String(selectedCity) : "all"}
              onValueChange={(v) => onCityChange?.(v === "all" ? null : Number(v))}
            >
              <SelectTrigger className="border-0 shadow-none p-0 h-auto text-sm font-medium text-gray-700 focus:ring-0 w-[140px]">
                <SelectValue placeholder="Todas as cidades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as cidades</SelectItem>
                {cities?.map(c => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                placeholder="Buscar produtos, serviços, imóveis..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-gradient text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
              >
                Buscar
              </button>
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Anunciar button */}
            <Link href={isAuthenticated ? "/anunciante/novo" : LOGIN_ROUTE}>
              <Button className="bg-orange-gradient text-white font-bold rounded-xl shadow-md hover:opacity-90 hidden sm:flex items-center gap-1.5 px-4">
                <Plus className="w-4 h-4" />
                Anunciar
              </Button>
            </Link>

            {isAuthenticated ? (
              <>
                <Link href="/favoritos">
                  <Button variant="ghost" size="icon" className="text-gray-600 hover:text-red-500">
                    <Heart className="w-5 h-5" />
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 px-2">
                      <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center text-white text-sm font-bold">
                        {user?.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <ChevronDown className="w-3 h-3 text-gray-500 hidden sm:block" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2">
                      <p className="font-semibold text-sm text-gray-900">{user?.name || "Usuário"}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/anunciante")}>
                      <LayoutDashboard className="w-4 h-4 mr-2" /> Meu Painel
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/favoritos")}>
                      <Heart className="w-4 h-4 mr-2" /> Favoritos
                    </DropdownMenuItem>
                    {user?.role === "admin" && (
                      <DropdownMenuItem onClick={() => navigate("/admin")}>
                        <Shield className="w-4 h-4 mr-2" /> Admin
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => logout()} className="text-red-600">
                      <LogOut className="w-4 h-4 mr-2" /> Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link href={LOGIN_ROUTE}>
                <Button variant="outline" className="rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50 font-semibold hidden sm:flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  Entrar
                </Button>
              </Link>
            )}

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="sm:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <Select
              value={selectedCity ? String(selectedCity) : "all"}
              onValueChange={(v) => onCityChange?.(v === "all" ? null : Number(v))}
            >
              <SelectTrigger className="flex-1 rounded-xl">
                <SelectValue placeholder="Selecionar cidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as cidades</SelectItem>
                {cities?.map(c => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Link href={isAuthenticated ? "/anunciante/novo" : LOGIN_ROUTE}>
            <Button className="w-full bg-orange-gradient text-white font-bold rounded-xl">
              <Plus className="w-4 h-4 mr-2" /> Anunciar Grátis
            </Button>
          </Link>
          {!isAuthenticated && (
            <Link href={LOGIN_ROUTE}>
              <Button variant="outline" className="w-full rounded-xl">
                <User className="w-4 h-4 mr-2" /> Entrar / Cadastrar
              </Button>
            </Link>
          )}
        </div>
      )}
    </header>
  );
}

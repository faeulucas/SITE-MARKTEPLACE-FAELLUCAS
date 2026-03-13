import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { LOGIN_ROUTE } from "@/const";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { Heart, LogIn } from "lucide-react";

export default function FavoritesPage() {
  const { isAuthenticated } = useAuth();
  const { data: favorites, isLoading } = trpc.advertiser.myFavorites.useQuery(undefined, { enabled: isAuthenticated });
  const { data: cities } = trpc.public.cities.useQuery();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container py-20 text-center">
          <Heart className="w-16 h-16 text-red-200 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-gray-700 mb-3">Seus favoritos</h2>
          <p className="text-gray-500 mb-6">Faça login para ver seus anúncios favoritos</p>
          <Link href={LOGIN_ROUTE}>
            <Button className="bg-brand-gradient text-white rounded-xl px-8">
              <LogIn className="w-4 h-4 mr-2" /> Entrar
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <Heart className="w-5 h-5 text-red-500" />
          </div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Meus Favoritos</h1>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : favorites && favorites.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {favorites.map(listing => (
              <ListingCard key={listing.id} {...listing} cityName={cities?.find(c => c.id === listing.cityId)?.name} isFavorited={true} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl">
            <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="font-display font-bold text-gray-700 text-xl mb-2">Nenhum favorito ainda</h3>
            <p className="text-gray-500 mb-6">Explore os anúncios e salve os que te interessam</p>
            <Link href="/busca">
              <Button className="bg-brand-gradient text-white rounded-xl px-8">Explorar Anúncios</Button>
            </Link>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ListingCard from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { BadgeCheck, Sparkles, Zap } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { LOGIN_ROUTE } from "@/const";

export default function BoosterPage() {
  const { isAuthenticated } = useAuth();
  const { data: featured } = trpc.public.featuredListings.useQuery({ limit: 16 });
  const { data: categories } = trpc.public.categories.useQuery();
  const { data: cities } = trpc.public.cities.useQuery();

  const boostedListings = featured ?? [];

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff8ef_0%,#f8fafc_35%,#f8fafc_100%)]">
      <Header />
      <main className="container py-6">
        <section className="rounded-[32px] bg-[linear-gradient(135deg,#7c2d12_0%,#f97316_45%,#facc15_130%)] p-6 text-white shadow-[0_20px_70px_rgba(124,45,18,0.22)] sm:p-8">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4" />
              Booster
            </div>
            <h1 className="mt-4 font-display text-4xl font-black sm:text-5xl">
              Destaque premium para anuncios que precisam aparecer primeiro.
            </h1>
            <p className="mt-4 text-base leading-7 text-orange-50/95">
              Esta area valoriza produtos e servicos impulsionados para gerar
              mais visualizacao, mais contato e mais descoberta.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={isAuthenticated ? "/anunciante" : LOGIN_ROUTE}>
                <Button className="rounded-2xl bg-white text-orange-700 hover:bg-orange-50">
                  <Zap className="mr-2 h-4 w-4" />
                  Quero usar Booster
                </Button>
              </Link>
              <Link href="/planos">
                <Button className="rounded-2xl bg-white/10 text-white hover:bg-white/15">
                  Ver planos
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-3xl font-black text-slate-900">
                Anuncios impulsionados
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {boostedListings.length} destaque(s) ativo(s) no portal
              </p>
            </div>
          </div>

          {boostedListings.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {boostedListings.map(listing => (
                <div
                  key={listing.id}
                  className="overflow-hidden rounded-[28px] border border-amber-200 bg-white shadow-sm ring-1 ring-amber-100"
                >
                  <div className="flex items-center justify-between bg-amber-50 px-4 py-3">
                    <div className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-xs font-black text-white">
                      <Zap className="h-3.5 w-3.5" />
                      BOOSTER
                    </div>
                    <div className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      Premium
                    </div>
                  </div>
                  <ListingCard
                    {...listing}
                    cityName={cities?.find(city => city.id === listing.cityId)?.name}
                    categoryName={
                      categories?.find(category => category.id === listing.categoryId)?.name
                    }
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-amber-200 bg-white p-12 text-center">
              <Zap className="mx-auto h-12 w-12 text-amber-300" />
              <p className="mt-4 text-slate-500">
                Nenhum anuncio impulsionado no momento.
              </p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

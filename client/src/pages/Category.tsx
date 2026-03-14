import { useEffect } from "react";
import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import { getCashbackRuleBySlug } from "@/lib/cashback";
import { ChevronRight, Tag } from "lucide-react";

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: categories } = trpc.public.categories.useQuery();
  const { data: cities } = trpc.public.cities.useQuery();
  const { data: listings, isLoading } = trpc.public.listingsByCategory.useQuery({ categorySlug: slug, limit: 40 });
  const utils = trpc.useUtils();
  const trackCategoryView = trpc.public.trackCategoryView.useMutation({
    onSuccess: async () => {
      await utils.public.topCategories.invalidate();
    },
  });

  const category = categories?.find(c => c.slug === slug);
  const cashbackRule = getCashbackRuleBySlug(slug);

  useEffect(() => {
    if (!slug) return;
    trackCategoryView.mutate({ slug });
  }, [slug]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container py-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600">Início</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-900 font-medium">{category?.name || slug}</span>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${category?.color}20` || "#EEF2FF" }}>
            <Tag className="w-5 h-5" style={{ color: category?.color || "#4F46E5" }} />
          </div>
          <h1 className="font-display text-2xl font-bold text-gray-900">{category?.name || slug}</h1>
        </div>

        {cashbackRule && (
          <section className="mb-6 rounded-[24px] border border-emerald-100 bg-emerald-50 p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">
                  Cashback ativo nesta categoria
                </p>
                <h2 className="mt-2 font-display text-2xl font-bold text-gray-900">
                  ate {cashbackRule.rate}% de volta para fidelizar clientes
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-gray-600">
                  {cashbackRule.description}
                </p>
              </div>
              <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-emerald-700">
                Valido para compras recorrentes
              </div>
            </div>
          </section>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : listings && listings.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {listings.map(listing => (
              <ListingCard key={listing.id} {...listing} cityName={cities?.find(c => c.id === listing.cityId)?.name} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl">
            <Tag className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="font-display font-bold text-gray-700 text-xl mb-2">Nenhum anúncio nesta categoria</h3>
            <p className="text-gray-500">Seja o primeiro a anunciar aqui!</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

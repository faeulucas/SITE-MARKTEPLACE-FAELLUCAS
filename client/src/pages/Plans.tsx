import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { LOGIN_ROUTE } from "@/const";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle, Zap, Star, Crown } from "lucide-react";

const PLANS = [
  {
    id: "gratis",
    name: "Grátis",
    price: 0,
    period: "30 dias",
    icon: Zap,
    color: "border-gray-200",
    btnClass: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    badge: null,
    features: [
      "5 anúncios ativos",
      "3 fotos por anúncio",
      "Validade de 30 dias",
      "Busca padrão",
      "Suporte básico",
    ],
    notIncluded: ["Booster de destaque", "Destaque na home", "Selo verificado"],
  },
  {
    id: "profissional",
    name: "Profissional",
    price: 12.90,
    period: "/mês",
    icon: Star,
    color: "border-blue-500 ring-2 ring-blue-100",
    btnClass: "bg-brand-gradient text-white hover:opacity-90",
    badge: "MAIS POPULAR",
    features: [
      "15 anúncios ativos",
      "8 fotos por anúncio",
      "Validade de 30 dias",
      "Booster disponível (R$ 19,90)",
      "Prioridade na busca",
      "Suporte prioritário",
    ],
    notIncluded: ["Destaque garantido na home", "Selo verificado"],
  },
  {
    id: "premium",
    name: "Premium",
    price: 19.90,
    period: "/mês",
    icon: Crown,
    color: "border-amber-400 ring-2 ring-amber-100",
    btnClass: "bg-orange-gradient text-white hover:opacity-90",
    badge: "MELHOR CUSTO-BENEFÍCIO",
    features: [
      "Anúncios ilimitados",
      "20 fotos por anúncio",
      "Validade de 30 dias",
      "Booster incluso (1x/mês)",
      "Destaque garantido na home",
      "Selo de verificado",
      "Suporte VIP",
      "Relatórios avançados",
    ],
    notIncluded: [],
  },
];

const BOOSTERS = [
  { name: "Destaque Básico", price: 19.90, days: 7, desc: "Aparece no topo da categoria por 7 dias" },
  { name: "Destaque Plus", price: 39.90, days: 15, desc: "Destaque na home + topo da categoria por 15 dias" },
  { name: "Destaque Premium", price: 79.90, days: 30, desc: "Banner na home + destaque máximo por 30 dias" },
];

export default function PlansPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero */}
      <section className="bg-hero-gradient text-white py-16 text-center">
        <div className="container">
          <h1 className="font-display text-4xl font-black mb-3">Planos e Preços</h1>
          <p className="text-blue-100 text-lg max-w-xl mx-auto">
            Comece grátis por 30 dias. Sem cartão de crédito. Cancele quando quiser.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="container py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PLANS.map(plan => {
            const IconComp = plan.icon;
            return (
              <div key={plan.id} className={`bg-white rounded-2xl p-8 border-2 ${plan.color} relative shadow-sm`}>
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className={`text-xs font-black px-4 py-1.5 rounded-full whitespace-nowrap ${plan.id === "premium" ? "bg-amber-400 text-gray-900" : "bg-blue-600 text-white"}`}>
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${plan.id === "premium" ? "bg-orange-gradient" : plan.id === "profissional" ? "bg-brand-gradient" : "bg-gray-100"}`}>
                    <IconComp className={`w-5 h-5 ${plan.id !== "gratis" ? "text-white" : "text-gray-600"}`} />
                  </div>
                  <h3 className="font-display font-bold text-xl text-gray-900">{plan.name}</h3>
                </div>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black text-gray-900">
                    {plan.price === 0 ? "Grátis" : `R$ ${plan.price.toFixed(2).replace(".", ",")}`}
                  </span>
                  {plan.price > 0 && <span className="text-gray-500 text-sm">{plan.period}</span>}
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                  {plan.notIncluded.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-400 line-through">
                      <CheckCircle className="w-4 h-4 text-gray-300 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link href={isAuthenticated ? "/anunciante" : LOGIN_ROUTE}>
                  <Button className={`w-full rounded-xl py-5 font-bold text-base ${plan.btnClass}`}>
                    {plan.price === 0 ? "Começar Grátis" : "Assinar Agora"}
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Boosters */}
      <section className="bg-white py-14 border-y border-gray-100">
        <div className="container">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
              <Zap className="w-4 h-4" /> BOOSTER — Turbine seu anúncio
            </div>
            <h2 className="font-display text-3xl font-black text-gray-900 mb-3">
              Destaque seu anúncio e venda mais rápido
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Com o Booster, seu anúncio aparece no topo das buscas e na home do Norte Vivo. Receba até 10x mais contatos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {BOOSTERS.map(b => (
              <div key={b.name} className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
                <div className="w-10 h-10 bg-orange-gradient rounded-xl flex items-center justify-center mb-4">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-display font-bold text-lg text-gray-900 mb-1">{b.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{b.desc}</p>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-2xl font-black text-gray-900">R$ {b.price.toFixed(2).replace(".", ",")}</span>
                  <span className="text-gray-500 text-sm">/{b.days} dias</span>
                </div>
                <Link href={isAuthenticated ? "/anunciante" : LOGIN_ROUTE}>
                  <Button className="w-full bg-orange-gradient text-white rounded-xl font-bold hover:opacity-90">
                    Ativar Booster
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

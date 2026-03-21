import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
  Ambulance,
  ArrowRight,
  Briefcase,
  HeartHandshake,
  MapPin,
  Shield,
  Stethoscope,
  Wrench,
  Phone,
  Sparkles,
  Building2,
  Store,
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

const GUIDE_SECTIONS = [
  {
    title: "Saúde",
    description: "Hospitais, clínicas, farmácias e atendimentos úteis.",
    href: "/busca?q=saude",
    icon: Stethoscope,
    tone: "bg-emerald-50 text-emerald-700",
  },
  {
    title: "Educação",
    description: "Escolas, cursos, reforço e oportunidades de aprendizagem.",
    href: "/busca?q=educacao",
    icon: Briefcase,
    tone: "bg-orange-50 text-orange-700",
  },
  {
    title: "Segurança",
    description: "Polícia, apoio e serviços úteis para a cidade.",
    href: "/busca?q=seguranca",
    icon: Shield,
    tone: "bg-blue-50 text-blue-700",
  },
  {
    title: "Emergências",
    description: "Atalhos para urgências e contatos importantes.",
    href: "/busca?q=emergencia",
    icon: Ambulance,
    tone: "bg-rose-50 text-rose-700",
  },
  {
    title: "Oficinas",
    description: "Mecânicos, eletricistas, reparos e manutenções.",
    href: "/busca?q=oficina",
    icon: Wrench,
    tone: "bg-amber-50 text-amber-700",
  },
  {
    title: "Serviços Gerais",
    description: "Prestadores e negócios locais para o dia a dia.",
    href: "/busca?q=servicos",
    icon: HeartHandshake,
    tone: "bg-violet-50 text-violet-700",
  },
];

export default function GuidePage() {
  const { data: cities } = trpc.public.cities.useQuery();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_18%,#f8fafc_100%)]">
      <Header />

      <main className="container py-6">
        <section className="overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_50%,#0ea5e9_130%)] p-6 text-white shadow-[0_20px_70px_rgba(15,23,42,0.18)] sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-sm font-semibold text-white">
                <Sparkles className="h-4 w-4" />
                Guia local do Norte Vivo
              </div>

              <h1 className="mt-4 font-display text-3xl font-black leading-tight text-white sm:text-5xl">
                Telefones, contatos e serviços úteis da sua cidade.
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-blue-50/90 sm:text-lg">
                Um guia local pensado para ajudar rápido. Encontre serviços,
                empresas e contatos importantes sem ficar procurando em vários
                lugares.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="/busca?q=servicos">
                  <Button className="h-12 rounded-2xl bg-white px-6 text-slate-900 hover:bg-slate-100">
                    <Phone className="mr-2 h-4 w-4" />
                    Explorar serviços
                  </Button>
                </Link>

                <Link href="/">
                  <Button className="h-12 rounded-2xl bg-white/10 px-6 text-white hover:bg-white/15">
                    Voltar para Home
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-[22px] bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-2xl font-black text-white">
                  {GUIDE_SECTIONS.length}
                </p>
                <p className="text-sm text-blue-100">Áreas principais</p>
              </div>

              <div className="rounded-[22px] bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-2xl font-black text-white">
                  {cities?.length ?? 0}
                </p>
                <p className="text-sm text-blue-100">Cidades atendidas</p>
              </div>

              <div className="rounded-[22px] bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-2xl font-black text-white">24h</p>
                <p className="text-sm text-blue-100">Busca útil para o dia a dia</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-3">
          <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="w-fit rounded-2xl bg-orange-50 p-3 text-orange-600">
              <Phone className="h-5 w-5" />
            </div>
            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
              Utilidade rápida
            </p>
            <h2 className="mt-2 font-display text-2xl font-black text-slate-900">
              Encontre contatos sem complicação
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              O guia precisa resolver rápido a busca por telefones, serviços e
              negócios da cidade.
            </p>
          </article>

          <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="w-fit rounded-2xl bg-blue-50 p-3 text-blue-600">
              <Building2 className="h-5 w-5" />
            </div>
            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
              Organização
            </p>
            <h2 className="mt-2 font-display text-2xl font-black text-slate-900">
              Categorias pensadas para o cotidiano
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Saúde, oficinas, emergências, educação e serviços locais em uma
              estrutura mais clara.
            </p>
          </article>

          <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="w-fit rounded-2xl bg-emerald-50 p-3 text-emerald-600">
              <MapPin className="h-5 w-5" />
            </div>
            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
              Alcance local
            </p>
            <h2 className="mt-2 font-display text-2xl font-black text-slate-900">
              Conectado com a sua região
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              O guia reforça o Norte Vivo como portal local útil e não só como
              marketplace.
            </p>
          </article>
        </section>

        <section className="mt-8">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-600">
              Acessos rápidos
            </p>
            <h2 className="mt-2 font-display text-3xl font-black text-slate-900">
              O que as pessoas mais procuram na cidade
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Entradas diretas para serviços e contatos úteis no dia a dia.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {GUIDE_SECTIONS.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/30"
                >
                  <div className={`inline-flex rounded-2xl p-3 ${item.tone}`}>
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="mt-4 font-display text-2xl font-bold text-slate-900">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {item.description}
                  </p>

                  <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-700">
                    Acessar
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-10 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
              Cidades atendidas
            </p>
            <h2 className="mt-2 font-display text-3xl font-black text-slate-900">
              Explore a região por cidade
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Entre nos hubs locais e veja empresas, anúncios e serviços de cada cidade.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {cities?.map((city) => (
              <Link key={city.id} href={`/cidade/${city.slug}`}>
                <span className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  {city.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-[32px] bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_50%,#0ea5e9_140%)] p-6 text-white shadow-[0_22px_70px_rgba(15,23,42,0.22)] sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">
                Precisa encontrar algo agora?
              </p>
              <h2 className="mt-3 font-display text-3xl font-black">
                Use o guia local e chegue mais rápido no contato certo.
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-200 sm:text-base">
                O objetivo aqui é simples: facilitar a vida de quem procura
                serviços, empresas e telefones úteis da cidade.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[340px]">
              <Link href="/busca?q=servicos">
                <Button className="h-12 w-full rounded-2xl bg-white text-slate-900 hover:bg-slate-100">
                  <Phone className="mr-2 h-4 w-4" />
                  Buscar serviços
                </Button>
              </Link>

              <Link href="/lojas">
                <Button
                  variant="outline"
                  className="h-12 w-full rounded-2xl border-white/30 bg-white/10 text-white hover:bg-white/15"
                >
                  <Store className="mr-2 h-4 w-4" />
                  Ver lojas
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

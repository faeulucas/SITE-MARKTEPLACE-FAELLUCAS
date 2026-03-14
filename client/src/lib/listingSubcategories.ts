export const CATEGORY_SUBCATEGORY_OPTIONS: Record<string, string[]> = {
  eletronicos: [
    "Celular",
    "Fone",
    "Cabo",
    "Carregador",
    "Notebook",
    "Tablet",
    "Smartwatch",
    "Caixa de som",
    "Video game",
    "Acessorios",
  ],
  veiculos: [
    "Carro",
    "Moto",
    "Caminhonete",
    "SUV",
    "Utilitario",
  ],
  "servicos-gerais": [
    "Pintura",
    "Eletrica",
    "Hidraulica",
    "Limpeza",
    "Montagem",
    "Jardinagem",
    "Frete",
    "Manutencao",
  ],
  imoveis: [
    "Casa",
    "Apartamento",
    "Terreno",
    "Comercial",
    "Chacara",
    "Kitnet",
  ],
  delivery: [
    "Lanche",
    "Combo",
    "Bebida",
    "Porcao",
    "Marmita",
    "Pizza",
    "Sobremesa",
  ],
  empregos: [
    "Vaga CLT",
    "Freelancer",
    "Estagio",
    "Temporario",
    "Meio periodo",
  ],
};

export function getSubcategoryOptionsBySlug(slug?: string | null) {
  if (!slug) return [];
  return CATEGORY_SUBCATEGORY_OPTIONS[slug] ?? [];
}

export function getSubcategoryFieldLabel(slug?: string | null) {
  if (slug === "delivery") return "Tipo do item *";
  if (slug === "empregos") return "Tipo da vaga *";
  return "Subcategoria *";
}

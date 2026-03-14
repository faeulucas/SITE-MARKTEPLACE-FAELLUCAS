type DashboardListing = {
  id: number;
  title: string;
  description?: string | null;
  createdAt: string | Date;
  status?: string | null;
  isBoosted?: boolean | null;
  viewCount?: number | null;
  contactCount?: number | null;
  favoriteCount?: number | null;
};

export type AdvertiserInsight = {
  id: string;
  tone: "blue" | "amber" | "emerald";
  title: string;
  description: string;
  actionLabel: string;
  listingId?: number;
  durationDays?: number;
};

function ageInDays(createdAt: string | Date) {
  const date = createdAt instanceof Date ? createdAt : new Date(createdAt);
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / 86400000));
}

export function getAdvertiserInsights(listings: DashboardListing[]): AdvertiserInsight[] {
  const activeListings = listings.filter(listing => listing.status === "active");
  const insights: AdvertiserInsight[] = [];

  const staleListing = activeListings.find(listing => {
    const days = ageInDays(listing.createdAt);
    return days >= 10 && (listing.contactCount ?? 0) === 0;
  });

  if (staleListing) {
    insights.push({
      id: `stale-${staleListing.id}`,
      tone: "amber",
      title: "Esse anuncio pode precisar de revisao",
      description: `${staleListing.title} ja esta no ar ha ${ageInDays(staleListing.createdAt)} dias sem novos contatos. Atualizar titulo, preco ou fotos pode ajudar.`,
      actionLabel: "Revisar anuncio",
      listingId: staleListing.id,
    });
  }

  const highViewsLowContacts = activeListings.find(listing => {
    const views = listing.viewCount ?? 0;
    const contacts = listing.contactCount ?? 0;
    return views >= 25 && contacts <= 1;
  });

  if (highViewsLowContacts) {
    insights.push({
      id: `conversion-${highViewsLowContacts.id}`,
      tone: "blue",
      title: "Muita visualizacao e pouca conversa",
      description: `${highViewsLowContacts.title} chamou atencao, mas quase nao gerou contato. Pode ser um bom momento para revisar preco e descricao.`,
      actionLabel: "Ajustar detalhes",
      listingId: highViewsLowContacts.id,
    });
  }

  const shortDescriptionListing = activeListings.find(listing => {
    const descriptionLength = listing.description?.trim().length ?? 0;
    return descriptionLength > 0 && descriptionLength < 60;
  });

  if (shortDescriptionListing) {
    insights.push({
      id: `description-${shortDescriptionListing.id}`,
      tone: "emerald",
      title: "Descricao curta demais",
      description: `${shortDescriptionListing.title} pode vender melhor com mais detalhes sobre estado, diferenciais ou condicoes.`,
      actionLabel: "Melhorar descricao",
      listingId: shortDescriptionListing.id,
    });
  }

  const candidateForBoost = activeListings.find(listing => {
    const views = listing.viewCount ?? 0;
    return !listing.isBoosted && views >= 8;
  });

  if (candidateForBoost) {
    insights.push({
      id: `boost-${candidateForBoost.id}`,
      tone: "blue",
      title: "Esse item tem potencial para um booster",
      description: `${candidateForBoost.title} ja esta chamando atencao. Um impulsionamento de 24h pode aumentar o alcance agora.`,
      actionLabel: "Impulsionar 24h",
      listingId: candidateForBoost.id,
      durationDays: 1,
    });
  }

  if (insights.length === 0 && activeListings.length > 0) {
    insights.push({
      id: "healthy-account",
      tone: "emerald",
      title: "Seus anuncios estao com boa base",
      description: "Continue renovando fotos, atualizando preco e ativando booster so nos itens com mais potencial.",
      actionLabel: "Ver anuncios",
    });
  }

  return insights.slice(0, 3);
}

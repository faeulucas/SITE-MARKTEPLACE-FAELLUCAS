import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { LOGIN_ROUTE } from "@/const";
import { trpc } from "@/lib/trpc";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Upload, X, Zap, CheckCircle, Image } from "lucide-react";

export default function NewListing() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [priceType, setPriceType] = useState("fixed");
  const [type, setType] = useState("product");
  const [categoryId, setCategoryId] = useState("");
  const [cityId, setCityId] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [images, setImages] = useState<{ url: string; file: File }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState(1);

  const { data: categories } = trpc.public.categories.useQuery();
  const { data: cities } = trpc.public.cities.useQuery();

  const createMutation = trpc.advertiser.createListing.useMutation({
    onSuccess: async (data) => {
      toast.success("🎉 Anúncio criado com sucesso!");
      navigate("/anunciante");
    },
    onError: (err) => toast.error("Erro ao criar anúncio: " + err.message),
  });

  const uploadMutation = trpc.advertiser.uploadImage.useMutation();

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImages(prev => [...prev, { url: ev.target?.result as string, file }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error("Título é obrigatório"); return; }
    if (!categoryId) { toast.error("Selecione uma categoria"); return; }

    const result = await createMutation.mutateAsync({
      title: title.trim(),
      description: description.trim() || undefined,
      price: price ? Number(price) : undefined,
      priceType: priceType as any,
      type: type as any,
      categoryId: Number(categoryId),
      cityId: cityId ? Number(cityId) : undefined,
      neighborhood: neighborhood || undefined,
      whatsapp: whatsapp || undefined,
    });

    if (result.id && images.length > 0) {
      setUploading(true);
      for (const img of images) {
        try {
          await uploadMutation.mutateAsync({
            listingId: result.id,
            base64: img.url,
            mimeType: img.file.type,
          });
        } catch (e) { /* continue */ }
      }
      setUploading(false);
    }
  };

  if (!isAuthenticated) return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container py-20 text-center">
        <h2 className="font-display text-2xl font-bold text-gray-700 mb-4">Faça login para anunciar</h2>
        <Link href={LOGIN_ROUTE}><Button className="bg-brand-gradient text-white rounded-xl px-8">Entrar</Button></Link>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container py-6 max-w-2xl">
        {/* Back */}
        <Link href="/anunciante" className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar ao painel
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-hero-gradient p-6 text-white">
            <h1 className="font-display text-2xl font-bold mb-1">Criar Novo Anúncio</h1>
            <p className="text-blue-100 text-sm">Preencha as informações do seu produto ou serviço</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic info */}
            <div className="space-y-4">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-black">1</span>
                Informações Básicas
              </h2>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Título do anúncio *</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ex: Honda CG 160 2020, Apartamento 2 quartos, Serviço de pintura..."
                  maxLength={200}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all"
                />
                <p className="text-xs text-gray-400 mt-1">{title.length}/200 caracteres</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Descrição</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Descreva seu produto ou serviço com detalhes..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Tipo de anúncio *</label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="rounded-xl bg-gray-50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product">Produto</SelectItem>
                      <SelectItem value="service">Serviço</SelectItem>
                      <SelectItem value="vehicle">Veículo</SelectItem>
                      <SelectItem value="property">Imóvel</SelectItem>
                      <SelectItem value="food">Comida/Delivery</SelectItem>
                      <SelectItem value="job">Emprego</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Categoria *</label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger className="rounded-xl bg-gray-50">
                      <SelectValue placeholder="Selecionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-black">2</span>
                Preço
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Tipo de preço</label>
                  <Select value={priceType} onValueChange={setPriceType}>
                    <SelectTrigger className="rounded-xl bg-gray-50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Preço fixo</SelectItem>
                      <SelectItem value="negotiable">Negociável</SelectItem>
                      <SelectItem value="free">Grátis</SelectItem>
                      <SelectItem value="on_request">Sob consulta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {priceType !== "free" && priceType !== "on_request" && (
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Valor (R$)</label>
                    <input
                      type="number"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      placeholder="0,00"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-black">3</span>
                Localização
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Cidade</label>
                  <Select value={cityId} onValueChange={setCityId}>
                    <SelectTrigger className="rounded-xl bg-gray-50">
                      <SelectValue placeholder="Selecionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {cities?.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Bairro</label>
                  <input
                    type="text"
                    value={neighborhood}
                    onChange={e => setNeighborhood(e.target.value)}
                    placeholder="Centro, Vila Nova..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">WhatsApp para contato</label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={e => setWhatsapp(e.target.value)}
                  placeholder="(43) 99999-9999"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Images */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-black">4</span>
                Fotos (opcional)
              </h2>

              <div className="grid grid-cols-4 gap-3">
                {images.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {i === 0 && <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-md font-medium">Principal</span>}
                  </div>
                ))}
                {images.length < 10 && (
                  <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                    <Image className="w-6 h-6 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-400">Adicionar</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageAdd} />
                  </label>
                )}
              </div>
              <p className="text-xs text-gray-400">Máximo 10 fotos. A primeira foto será a capa do anúncio.</p>
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-gray-100">
              <Button
                type="submit"
                disabled={createMutation.isPending || uploading}
                className="w-full bg-brand-gradient text-white font-bold rounded-xl py-4 text-base hover:opacity-90 disabled:opacity-50"
              >
                {createMutation.isPending || uploading ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" /> Publicando...</>
                ) : (
                  <><CheckCircle className="w-5 h-5 mr-2" /> Publicar Anúncio Grátis</>
                )}
              </Button>
              <p className="text-xs text-center text-gray-400 mt-3">
                Ao publicar, você concorda com os <Link href="/termos" className="text-blue-600 hover:underline">Termos de Uso</Link> do Norte Vivo.
              </p>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}

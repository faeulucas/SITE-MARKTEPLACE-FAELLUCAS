import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function isStandaloneMode() {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function getInstallEnvironment() {
  if (typeof window === "undefined") {
    return {
      isMobile: false,
      isIosSafari: false,
      isAndroid: false,
    };
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  const isIos = /iphone|ipad|ipod/.test(userAgent);
  const isSafari = /safari/.test(userAgent) && !/crios|fxios|edgios|opr\//.test(userAgent);
  const isAndroid = /android/.test(userAgent);
  const isMobile = isIos || isAndroid || window.innerWidth < 768;

  return {
    isMobile,
    isIosSafari: isIos && isSafari,
    isAndroid,
  };
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [showManualMobileHint, setShowManualMobileHint] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || isStandaloneMode()) return;

    const environment = getInstallEnvironment();

    if (environment.isIosSafari) {
      setShowManualMobileHint(true);
    }

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setShowManualMobileHint(false);
    };

    const onInstalled = () => {
      setDeferredPrompt(null);
      setDismissed(true);
    };

    let mobileHintTimer: number | null = null;

    if (environment.isMobile && !environment.isIosSafari) {
      mobileHintTimer = window.setTimeout(() => {
        setShowManualMobileHint(current => current || !isStandaloneMode());
      }, 2500);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      if (mobileHintTimer) {
        window.clearTimeout(mobileHintTimer);
      }
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const environment = getInstallEnvironment();
  const shouldShowNativePrompt = Boolean(deferredPrompt);
  const shouldShowManualHint = showManualMobileHint && environment.isMobile;

  if ((!shouldShowNativePrompt && !shouldShowManualHint) || dismissed || isStandaloneMode()) {
    return null;
  }

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome !== "accepted") {
        setInstalling(false);
        return;
      }
      setDeferredPrompt(null);
    } finally {
      setInstalling(false);
    }
  };

  const title = shouldShowNativePrompt
    ? "Instalar Norte Vivo"
    : environment.isIosSafari
      ? "Instalar no iPhone"
      : "Instalar no celular";

  const description = shouldShowNativePrompt
    ? "Adicione o app na tela inicial para abrir mais rapido, em tela cheia."
    : environment.isIosSafari
      ? "No Safari, toque em Compartilhar e depois em Adicionar a Tela de Inicio."
      : "Se o botao do navegador nao aparecer, abra o menu e toque em Instalar app ou Adicionar a tela inicial.";

  return (
    <div className="fixed inset-x-4 bottom-20 z-50 md:bottom-6 md:left-auto md:right-6 md:max-w-sm">
      <div className="rounded-[24px] border border-blue-100 bg-white/95 p-4 shadow-2xl backdrop-blur">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <Download className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900">{title}</p>
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          </div>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4 flex gap-2">
          {shouldShowNativePrompt ? (
            <Button
              type="button"
              onClick={handleInstall}
              disabled={installing}
              className="flex-1 rounded-2xl bg-brand-gradient text-white hover:opacity-90"
            >
              {installing ? "Preparando..." : "Instalar app"}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => setDismissed(true)}
              className="flex-1 rounded-2xl bg-brand-gradient text-white hover:opacity-90"
            >
              Entendi
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => setDismissed(true)}
            className="rounded-2xl"
          >
            Depois
          </Button>
        </div>
      </div>
    </div>
  );
}

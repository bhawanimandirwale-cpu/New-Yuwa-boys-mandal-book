'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles, CheckCircle2, Share2, PlusSquare, ArrowRight } from 'lucide-react';

export function InstallPromptModal() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Check if already installed / running in standalone PWA mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // 2. Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isAppleDevice);

    // 3. Listen for Android / Chrome / Edge 'beforeinstallprompt'
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Automatically show prompt on new device
      const dismissed = localStorage.getItem('mandalbook_pwa_dismissed');
      const now = Date.now();
      if (!dismissed || now - parseInt(dismissed, 10) > 24 * 60 * 60 * 1000) {
        setTimeout(() => setIsOpen(true), 1200);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 4. Also listen for successful install
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsOpen(false);
      setDeferredPrompt(null);
    });

    // 5. If no beforeinstallprompt after 2 seconds and not dismissed, show popup (handles iOS & general devices)
    const timer = setTimeout(() => {
      const dismissed = localStorage.getItem('mandalbook_pwa_dismissed');
      const now = Date.now();
      if (!isStandalone && (!dismissed || now - parseInt(dismissed, 10) > 24 * 60 * 60 * 1000)) {
        setIsOpen(true);
      }
    }, 1800);

    const handleManualOpen = () => {
      setIsOpen(true);
      setShowIosGuide(false);
    };
    window.addEventListener('open-pwa-install', handleManualOpen);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('open-pwa-install', handleManualOpen);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Trigger native browser install dialog
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsOpen(false);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      // Show iOS step-by-step instructions
      setShowIosGuide(true);
    } else {
      // Generic browser guidance
      setShowIosGuide(true);
    }
  };

  const handleDismiss = () => {
    setIsOpen(false);
    // Don't disturb for 24 hours on this device
    localStorage.setItem('mandalbook_pwa_dismissed', Date.now().toString());
  };

  if (isInstalled || !isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 notranslate">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-saffron-200 overflow-hidden animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-300">
        {/* Top saffron accent bar */}
        <div className="h-2.5 bg-gradient-to-r from-saffron-500 via-amber-400 to-saffron-600" />

        <div className="p-5 sm:p-6 relative">
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title="बंद करा"
          >
            <X className="w-5 h-5" />
          </button>

          {!showIosGuide ? (
            <>
              {/* Icon & Heading */}
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-saffron-500 to-amber-400 p-2 text-white shadow-lg shadow-saffron-500/30 flex items-center justify-center shrink-0">
                  <img
                    src="/icon.svg"
                    alt="New Yuwa Boys Mandal Book"
                    className="w-10 h-10 object-contain drop-shadow"
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-extrabold tracking-widest text-saffron-700 font-heading uppercase">
                    ॥ श्री गणेश प्रसन्न ॥
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-gray-900 font-heading truncate">
                    न्यू युवा बॉईज ॲप इन्स्टॉल करा
                  </h2>
                  <p className="text-xs text-gray-500 font-medium">
                    होम स्क्रीनवर जोडा (Add to Home Screen)
                  </p>
                </div>
              </div>

              {/* Benefits list */}
              <div className="bg-saffron-50/60 border border-saffron-100 rounded-2xl p-3.5 space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                  <CheckCircle2 className="w-4 h-4 text-saffron-600 shrink-0" />
                  <span>१-क्लिक जलद ॲक्सेस (ब्राउझर उघडण्याची गरज नाही)</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                  <CheckCircle2 className="w-4 h-4 text-saffron-600 shrink-0" />
                  <span>खऱ्या मोबाईल ॲपसारखा फुल-स्क्रीन अनुभव</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                  <CheckCircle2 className="w-4 h-4 text-saffron-600 shrink-0" />
                  <span>WhatsApp डिजिटल पावती व ताळेबंद अतिजलद उपलब्ध</span>
                </div>
              </div>

              {/* Primary Action Button */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-saffron-600 via-amber-500 to-saffron-700 hover:from-saffron-700 hover:to-saffron-800 text-white font-black text-sm shadow-lg shadow-saffron-500/30 hover:shadow-saffron-500/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-5 h-5 animate-bounce" />
                  <span>📲 आताच ॲप इन्स्टॉल करा</span>
                </button>

                <button
                  type="button"
                  onClick={handleDismiss}
                  className="w-full py-2 text-center text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
                >
                  नंतर करा (Not Now)
                </button>
              </div>
            </>
          ) : (
            /* Guided instructions for iOS Safari or manual install */
            <div className="space-y-3.5 text-left">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-saffron-100 text-saffron-700 flex items-center justify-center shrink-0 font-bold">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900 font-heading">
                    {isIos ? 'iPhone / Safari वर ॲप जोडा' : 'मोबाईलवर ॲप इन्स्टॉल करा'}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    खालील ३ सोप्या स्टेप्स फॉलो करा:
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 bg-gray-50 p-3.5 rounded-2xl border border-gray-200 text-xs">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-saffron-600 text-white text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                    १
                  </span>
                  <div className="text-gray-800">
                    {isIos ? (
                      <span>
                        Safari ब्राऊझरच्या खालील <strong>Share (शेअर) <Share2 className="w-3.5 h-3.5 inline text-blue-600" /></strong> बटनावर टॅप करा.
                      </span>
                    ) : (
                      <span>
                        ब्राउझरच्या वरच्या उजव्या कोपऱ्यातील <strong>तीन ठिपके (⋮)</strong> वर टॅप करा.
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-saffron-600 text-white text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                    २
                  </span>
                  <div className="text-gray-800">
                    मेनूमधील <strong>'Add to Home screen' (होम स्क्रीनवर जोडा) <PlusSquare className="w-3.5 h-3.5 inline text-emerald-600" /></strong> पर्यायावर क्लिक करा.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-saffron-600 text-white text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                    ३
                  </span>
                  <div className="text-gray-800">
                    वर उजवीकडे <strong>'Add' / 'Install'</strong> बटनावर दाबा. ॲप तुमच्या स्क्रीनवर तयार होईल!
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDismiss}
                className="w-full py-3 rounded-xl bg-saffron-600 hover:bg-saffron-700 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all text-center"
              >
                समजले, धन्यवाद!
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

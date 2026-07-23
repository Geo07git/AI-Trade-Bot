import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export function UserGuide() {
  return (
    <div className="flex flex-col h-full bg-black">
      <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-zinc-900/10 backdrop-blur-md shrink-0">
        <div>
          <h1 className="font-serif text-xl text-white">Ghid de Utilizare</h1>
          <p className="text-[10px] uppercase text-zinc-500 tracking-wider mt-0.5">Platformă de Tranzacționare AI (Server 24/7 & Paper Trading)</p>
        </div>
      </header>

      <div className="p-8 overflow-y-auto flex-1 pb-32">
        <div className="max-w-4xl mx-auto space-y-8">
          
          <section className="bg-zinc-900/50 border border-white/5 rounded-2xl p-8 hover:border-white/10 transition-colors">
            <h2 className="font-serif text-2xl text-white mb-4">Arhitectură Server-Side 24/7</h2>
            <p className="text-zinc-400 font-sans leading-relaxed text-sm mb-6">
              AI.TRADE funcționează ca un sistem hibrid. Interfața web pe care o vezi comunică cu un motor de tranzacționare backend care <strong>rulează 24/7 în mod autonom</strong>. Chiar dacă închizi browserul, botul continuă să scaneze piața și să execute ordine conform strategiilor ML.
            </p>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20 text-emerald-400 font-serif">1</div>
                <div>
                  <h3 className="font-serif text-lg text-zinc-200 mb-1">Butonul Server 24/7 (Pornire/Oprire)</h3>
                  <p className="text-sm text-zinc-400 font-sans leading-relaxed">
                    În bara de sus a Dashboard-ului sau în meniul lateral pe mobil, ai un buton de control "Server 24/7". Când este ACTIVAT, algoritmul rulează independent pe server, preluând date la intervale regulate și luând decizii de intrare (BUY) și ieșire (Take Profit / Stop Loss). Poți opri activitatea oricând.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20 text-blue-400 font-serif">2</div>
                <div>
                  <h3 className="font-serif text-lg text-zinc-200 mb-1">Notificări Live (Telegram, Discord, Web Push)</h3>
                  <p className="text-sm text-zinc-400 font-sans leading-relaxed">
                    Nu trebuie să stai cu ochii pe ecran. Din <strong>Settings</strong>, poți configura un bot de Telegram sau un Webhook Discord. Algoritmul îți va trimite notificări direct pe telefon de fiecare dată când:
                    <br />• Se execută o tranzacție (Cumpărare / Vânzare)
                    <br />• Se declanșează un Stop-Loss (-5%) sau Take-Profit (+10%)
                    <br />• Ai activat Raportul de Profit Paper Trading la ora stabilită.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20 text-amber-400 font-serif">3</div>
                <div>
                  <h3 className="font-serif text-lg text-zinc-200 mb-1">Alerte Push pe Android (PWA)</h3>
                  <p className="text-sm text-zinc-400 font-sans leading-relaxed">
                    Aplicația suportă instalare nativă (PWA). Pentru notificări Push direct pe Android (chiar și fără Telegram): deschide platforma în Google Chrome, apasă meniul browserului și selectează <strong>"Add to Home screen" / "Install app"</strong>. După instalare, deschide aplicația din meniul telefonului și apasă "Testează Alertele" în tabul Alerts.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-zinc-900/50 border border-white/5 rounded-2xl p-8 hover:border-white/10 transition-colors mt-8">
            <h2 className="font-serif text-2xl text-white mb-6">Instalare & Export</h2>
            
            <div className="space-y-8">
              <div>
                <p className="text-sm text-zinc-400 font-sans leading-relaxed mb-3">
                  Aplicația dispune de un server backend robust (Express) care gestionează baza de date în memorie, motorul de predicții simulat și integrările webhook. Iată cum o rulezi pe mașina ta locală (VPS, Raspberry Pi, Desktop):
                </p>
                <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-5 font-mono text-sm text-zinc-300 shadow-inner">
                  <ol className="list-decimal list-inside space-y-4">
                    <li>Exportă acest proiect: <strong>Settings Menu &gt; Export to ZIP</strong>.</li>
                    <li>Dezarhivează folderul rezultat pe mașina ta.</li>
                    <li>Instalează dependențele (Node.js 18+ este necesar):
                      <div className="bg-zinc-800/80 text-emerald-400 px-3 py-2 rounded-lg border border-white/5 mt-2 mb-1 w-max">npm install</div>
                    </li>
                    <li>Pornește serverul 24/7 și interfața web:
                      <div className="bg-zinc-800/80 text-emerald-400 px-3 py-2 rounded-lg border border-white/5 mt-2 mb-1 w-max">npm start</div>
                      <span className="text-xs text-zinc-500 ml-2">(Folosește "npm run dev" pentru modul de dezvoltare)</span>
                    </li>
                    <li>Accesează platforma din browserul oricărui dispozitiv conectat la rețeaua ta.</li>
                  </ol>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

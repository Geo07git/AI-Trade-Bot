import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export function UserGuide() {
  return (
    <div className="flex flex-col h-full bg-[#050505]">
      <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-zinc-900/10 backdrop-blur-md shrink-0">
        <div>
          <h1 className="font-serif text-xl text-white">Ghid de Utilizare</h1>
          <p className="text-[10px] uppercase text-zinc-500 tracking-wider mt-0.5">Platformă de Tranzacționare AI (Local & Paper Trading)</p>
        </div>
      </header>

      <div className="p-8 overflow-y-auto flex-1">
        <div className="max-w-4xl mx-auto space-y-8">
          
          <section className="bg-zinc-900/50 border border-white/5 rounded-2xl p-8">
            <h2 className="font-serif text-2xl text-white mb-4">Abordare Simplificată, Fără Backend</h2>
            <p className="text-zinc-400 font-sans leading-relaxed text-sm mb-6">
              AI.TRADE folosește acum o arhitectură <strong>complet locală</strong> și se bazează pe modele clasice de Machine Learning (XGBoost, LightGBM, Random Forest). Astfel, nu ai nevoie de servere dedicate, baze de date (salvăm în CSV/SQLite) și nici măcar de API-uri reale de la brokeri pentru a genera și testa strategii.
            </p>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10 text-white font-serif">1</div>
                <div>
                  <h3 className="font-serif text-lg text-zinc-200 mb-1">Paper Trading (Capital Virtual) & Selecție Active</h3>
                  <p className="text-sm text-zinc-400 font-sans leading-relaxed">
                    Începi cu un capital virtual de test (ex: $10.000). În secțiunea <strong>Dashboard</strong>, vei găsi un modul de <strong>Selecție Active (Watchlist AI)</strong>. Acolo poți adăuga manual simbolurile pe care vrei ca modelul AI să le analizeze (ex: NVDA, TSLA, BTC). Botul citește date financiare publice pentru aceste active și execută tranzacții <em>doar pe hârtie</em> în portofoliul de "Poziții Curente". Nu investești bani reali, dar poți testa strategiile.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10 text-white font-serif">2</div>
                <div>
                  <h3 className="font-serif text-lg text-zinc-200 mb-1">Modele ML în Browser / Electron</h3>
                  <p className="text-sm text-zinc-400 font-sans leading-relaxed">
                    În loc de servere greoaie de Python, folosim modele portate în JavaScript (ex: <strong>TensorFlow.js</strong> sau XGBoost.js). În secțiunea <strong>ML Strategies</strong>, poți antrena modele direct în memoria calculatorului tău, folosind resursele locale (CPU/WebGL). Această interfață poate fi chiar împachetată într-o aplicație desktop (folosind Electron).
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10 text-white font-serif">3</div>
                <div>
                  <h3 className="font-serif text-lg text-zinc-200 mb-1">Notificări prin Web Push & Gmail</h3>
                  <p className="text-sm text-zinc-400 font-sans leading-relaxed">
                    Dacă aplicația rulează local pe mașina ta și găsește un semnal bun de cumpărare, cum afli? Prin secțiunile <strong>Settings</strong> și <strong>Alerts</strong> poți configura primirea alertelor direct pe telefon sau desktop via <em>Web Push Notifications</em> sau conectând <em>Gmail API</em>. Când AI-ul ia o decizie, ești notificat instant, fără aplicații externe complexe.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10 text-white font-serif">4</div>
                <div>
                  <h3 className="font-serif text-lg text-zinc-200 mb-1">Surse de Date Deschise</h3>
                  <p className="text-sm text-zinc-400 font-sans leading-relaxed">
                    Modulele din <strong>Data Sources</strong> au fost simplificate. În loc de streaming-uri scumpe de date, poți descărca pachete de date de piață, articole și indicatori, și le poți încărca local ca fișiere (sau pot fi extrase de pe web-ul deschis) pentru ca modelele tale să le analizeze. Toate rezultatele (Log-urile) pot fi salvate într-un fișier local <code>.csv</code> sau <code>sqlite</code>.
                  </p>
                </div>
              </div>

            </div>
          </section>

          <section className="bg-zinc-900/50 border border-white/5 rounded-2xl p-8 mt-8">
            <h2 className="font-serif text-2xl text-white mb-6">De la Prototip Vizual la Aplicație Locală</h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="font-serif text-lg text-emerald-400 mb-3">Rularea ca Aplicație Desktop (Electron)</h3>
                <p className="text-sm text-zinc-400 font-sans leading-relaxed mb-3">
                  Această aplicație a fost configurată automat să poată fi rulată ca o aplicație nativă de Desktop. Urmează acești pași pentru a o lansa local pe sistemul tău (Windows / macOS / Linux):
                </p>
                <div className="bg-zinc-950 border border-white/10 rounded-lg p-5 font-mono text-sm text-zinc-300">
                  <ol className="list-decimal list-inside space-y-3">
                    <li>Exportă acest proiect (folosind butonul de Export/Share din meniul AI Studio, opțiunea <strong>Export to ZIP</strong> sau <strong>GitHub</strong>).</li>
                    <li>Deschide folderul în terminalul tău.</li>
                    <li>Rulează comanda pentru a instala dependențele:
                      <div className="bg-zinc-800 text-emerald-400 px-3 py-1.5 rounded mt-2 mb-1 w-max">npm install</div>
                    </li>
                    <li>Pornește aplicația în mod Desktop:
                      <div className="bg-zinc-800 text-emerald-400 px-3 py-1.5 rounded mt-2 mb-1 w-max">npm run electron:dev</div>
                    </li>
                    <li className="text-zinc-500 pt-2 border-t border-white/5 mt-4">Opțional - pentru a genera un executabil (.exe / .dmg):
                      <div className="bg-zinc-800 text-zinc-400 px-3 py-1.5 rounded mt-2 w-max">npm run electron:build</div>
                    </li>
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

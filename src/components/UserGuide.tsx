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
          
          {/* AI Strategy Lab Section */}
          <section className="bg-zinc-900/50 border border-emerald-500/20 rounded-2xl p-8 hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
                <span className="font-mono text-sm font-bold">LAB</span>
              </div>
              <div>
                <h2 className="font-serif text-2xl text-white">AI Strategy Lab & Pipeline-ul de Validare</h2>
                <p className="text-xs text-emerald-400 font-mono mt-0.5">Arhitectură Hibridă: LLM Generativ + ML Predictiv (Random Forest / XGB / LGBM)</p>
              </div>
            </div>

            <p className="text-zinc-400 font-sans leading-relaxed text-sm mb-6">
              Platforma separă rolul de <strong>Cercetător (AI Strategy Lab)</strong> de cel de <strong>Evaluator/Executant (ML Ensemble & Bot 24/7)</strong>. În loc ca AI-ul să încerce să ghicească direct piața, el generează ipoteze de tranzacționare care sunt apoi filtrate matematic și statistic în 7 stadii riguroase.
            </p>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20 text-amber-400 font-serif">1</div>
                <div>
                  <h3 className="font-serif text-lg text-zinc-200 mb-1">Generare Ipoteze (100–1000 Strategii)</h3>
                  <p className="text-sm text-zinc-400 font-sans leading-relaxed">
                    AI Strategy Lab folosește modele LLM pentru a combina indicatori tehnici (EMA, RSI, ADX, VWAP, Bollinger, Volume Spikes, Supertrend) în reguli explicite de intrare/ieșire adaptate pe regimuri specifice de piață.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20 text-blue-400 font-serif">2</div>
                <div>
                  <h3 className="font-serif text-lg text-zinc-200 mb-1">Backtest Rapid & Evaluare ML Ensemble</h3>
                  <p className="text-sm text-zinc-400 font-sans leading-relaxed">
                    Fiecare ipoteză este supusă unui backtest pentru a verifica Profit Factor (&gt; 1.35) și Win Rate (&gt; 50%). Semnalele generate sunt evaluate de un ansamblu de 3 modele ML:
                    <br />• <strong>Random Forest (RF)</strong> - Excelent pentru detecția piețelor laterale și inversări de trend.
                    <br />• <strong>XGBoost</strong> - Optimizat pentru tranzacții de momentum și breakout-uri de volum.
                    <br />• <strong>LightGBM</strong> - Filtrul rapid de clasificare a riscului și volatilității.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0 border border-purple-500/20 text-purple-400 font-serif">3</div>
                <div>
                  <h3 className="font-serif text-lg text-zinc-200 mb-1">Walk-Forward (5 Ferestre Out-Of-Sample) & Monte Carlo</h3>
                  <p className="text-sm text-zinc-400 font-sans leading-relaxed">
                    Strategiile care trec de ML sunt testate pe 5 perioade de timp neobservate (out-of-sample). Ulterior, o simulare Monte Carlo cu 1.000 de permutări aleatorii măsoară riscul maxim de scădere (Value-at-Risk 95% &lt; 6.0%).
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0 border border-orange-500/20 text-orange-400 font-serif">4</div>
                <div>
                  <h3 className="font-serif text-lg text-zinc-200 mb-1">Paper Trading & Promovare Automată în Botul Live</h3>
                  <p className="text-sm text-zinc-400 font-sans leading-relaxed">
                    Strategiile valide ajung în stadiul de <strong>Paper Trading</strong> (100–200 tranzacții virtuale fără risc). Doar strategiile cu <strong>Total Score &ge; 85/100</strong> primesc eticheta <strong>LIVE READY</strong> și sunt executate automat de motorul Server 24/7.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20 text-indigo-400 font-serif">5</div>
                <div>
                  <h3 className="font-serif text-lg text-zinc-200 mb-1">Detectarea Regimului Pieței (Market Regime Detector)</h3>
                  <p className="text-sm text-zinc-400 font-sans leading-relaxed">
                    Sistemul clasifică în mod dinamic piața (<em>SIDEWAYS_RANGE, TRENDING_BULL, TRENDING_BEAR, HIGH_VOLATILITY, LOW_VOLATILITY</em>) și activează prioritar strategiile optimizate pentru contextul curent.
                  </p>
                </div>
              </div>
            </div>
          </section>

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

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0 border border-rose-500/20 text-rose-400 font-serif">4</div>
                <div>
                  <h3 className="font-serif text-lg text-rose-300 mb-1">Circuit Breaker de Siguranță (Stop Auto-Trade la +10% Profit / -5% Pierdere)</h3>
                  <p className="text-sm text-zinc-400 font-sans leading-relaxed">
                    Dacă într-un moment de tranzacționare portofoliul atinge o creștere de <strong>10% (Take Profit)</strong> sau o scădere de <strong>5% (Stop Loss)</strong>, sistemul declanșează automat protocolul de urgență:
                    <br />• <strong>Stop Auto-Trade:</strong> Oprirea imediată a executării automate de noi ordine.
                    <br />• <strong>Pauză Server 24/7:</strong> Serverul suspendă semnalele ML și păstrează starea intactă.
                    <br />• <strong>Notificări Telegram & Web:</strong> Trimiterea unui mesaj urgență cu detaliile PnL și starea capitalului.
                    <br />• <strong>Reluare Manual Trade:</strong> Tranzacționarea automată rămâne oprită până când utilizatorul apasă butonul <em>"Reluare Manual Trade"</em> în interfața web sau trimite comanda <code>/resume</code> pe Telegram.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20 text-indigo-400 font-serif">5</div>
                <div>
                  <h3 className="font-serif text-lg text-indigo-300 mb-1">Sentimentul Pieței (Ex: -27 Frică) – Ce Înseamnă și La Ce Folosește?</h3>
                  <p className="text-sm text-zinc-400 font-sans leading-relaxed">
                    În secțiunea <strong>AI Analyst</strong>, indicele de sentiment variază de la <strong>-100 (Frică Extremă)</strong> la <strong>+100 (Lăcomie Extremă)</strong>:
                    <br />• <strong>Ce înseamnă un scor negativ (Ex: -27 Frică):</strong> Arată că piața este într-o stare de anxietate, cu presiune moderată de vânzare și prudență generală din partea investitorilor.
                    <br />• <strong>La ce ne folosește în algoritm:</strong> Algoritmul ML ajustează strategia în funcție de sentiment. În perioade de <em>Frică (-27)</em>, piața tinde să oscileze în canal (Range/Sideways). Algoritmul prioritizează strategiile de <strong>Mean Reversion (Cumpărare la Suport / RSI Supravândut)</strong> și activează ordine Stop Loss mai strânse. În schimb, un scor puternic pozitiv (+50..+80 Lăcomie) activează strategiile de <strong>Breakout & Trend Following</strong>.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20 text-emerald-400 font-serif">6</div>
                <div>
                  <h3 className="font-serif text-lg text-emerald-300 mb-1">Arhitectura AI Strategy Lab (De la Ipoteză la Live Ready)</h3>
                  <p className="text-sm text-zinc-400 font-sans leading-relaxed">
                    AI Strategy Lab nu utilizează cifre fictive, ci un pipeline riguros de cercetare și filtrare matematică în 7 etape:
                    <br />1. <strong>Generare Ipoteze LLM:</strong> Generarea combinatorie de reguli de intrare/ieșire și indicatori (EMA, RSI, VWAP, ATR).
                    <br />2. <strong>Backtest Matematic Determinist:</strong> Calcularea exactă din matricea de tranzacții a meșei <em>Profit Factor = Gross Profit / Gross Loss</em>, Win Rate, Sharpe Ratio și Max Drawdown.
                    <br />3. <strong>Clasificator ML Random Forest Ensemble:</strong> Evaluarea vectorilor de caracteristici prin 10 arbori decizionali independenți pentru verificarea probabilității de succes.
                    <br />4. <strong>Validare Walk-Forward (5 Ferestre Out-Of-Sample):</strong> Testarea consistenței strategiei pe 5 perioade temporale distincte.
                    <br />5. <strong>Simulări Bootstrap Monte Carlo (1000 Căi):</strong> Resamblarea aleatorie a istoricului de tranzacții pentru calcularea pragului de risc <em>95% Value-at-Risk (VaR)</em>.
                    <br />6. <strong>Incubare Paper Trading:</strong> Rularea a 100-200 tranzacții simulative în timp real pentru confirmarea indicatorilor.
                    <br />7. <strong>Aprobare Live Trading:</strong> Strategiile cu scor total peste 82/100 sunt promovate pentru executare automată de către Botul Server 24/7.
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

export async function simulateModelTraining(onProgress: (progress: number) => void): Promise<void> {
  return new Promise((resolve) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 20) + 5;
      if (progress > 100) progress = 100;
      onProgress(progress);
      if (progress === 100) {
        clearInterval(interval);
        resolve();
      }
    }, 300);
  });
}

export function generateSignal(symbol: string, currentPrice: number): { action: 'BUY' | 'SELL' | 'HOLD', prob: number } {
  // Pseudorandom deterministic logic for demonstration
  const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const rawProb = 40 + (hash % 30) + (Math.random() * 20 - 10);
  
  let action: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
  let prob = rawProb;

  if (rawProb > 65) {
    action = 'BUY';
    prob = rawProb;
  } else if (rawProb < 45) {
    action = 'SELL';
    prob = 100 - rawProb;
  } else {
    action = 'HOLD';
    prob = 50 + Math.random() * 10;
  }

  return { action, prob: Math.round(prob) };
}

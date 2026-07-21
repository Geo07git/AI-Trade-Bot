export async function fetchLivePrice(symbol: string): Promise<number | null> {
  try {
    // Using Binance public API for free, real-time cryptocurrency data without API keys
    const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol.toUpperCase()}`);
    if (!res.ok) return null;
    const data = await res.json();
    return parseFloat(data.price);
  } catch (error) {
    console.error("Failed to fetch price:", error);
    return null;
  }
}

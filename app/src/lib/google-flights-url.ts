export function buildGoogleFlightsUrl(
  origin: string,
  destination: string,
  departureDate: string,
  returnDate?: string | null
): string {
  const base = "https://www.google.com/travel/flights";
  if (returnDate) {
    return `${base}?q=Flights+from+${origin}+to+${destination}+on+${departureDate}+through+${returnDate}`;
  }
  return `${base}?q=Flights+from+${origin}+to+${destination}+on+${departureDate}`;
}

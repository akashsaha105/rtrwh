// src/services/weatherService.ts
const API_KEY = "b96e59b75f024dba93365954250310";

export async function getRainAlert(lat: number, lon: number) {
  const res = await fetch(
    `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${lat},${lon}&alerts=yes`
  );
  const data = await res.json();

  const forecast = data.forecast.forecastday[0].day;
  if (forecast.daily_chance_of_rain > 50) {
    return `🌧️ ${forecast.daily_chance_of_rain}% chance of rain today at your location.`;
  }
  return null;
}

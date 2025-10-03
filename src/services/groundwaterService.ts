// src/services/groundwaterService.ts
export async function getGroundwaterLevel(lat: number, lon: number) {
    try {
      // Example: USGS groundwater monitoring well (replace with nearest well ID logic)
      const siteCode = "404159100403201"; // Mock well near Dallas, TX
      const res = await fetch(
        `https://waterservices.usgs.gov/nwis/gwlevels/?format=json&sites=${siteCode}`
      );
      const data = await res.json();
  
      const level =
        data.value?.timeSeries?.[0]?.values?.[0]?.value?.[0]?.value ?? null;
  
      if (level) {
        return `💧 Groundwater level: ${level} ft below surface.`;
      } else {
        throw new Error("No groundwater data found");
      }
    } catch (err) {
      console.error("Groundwater API failed, using mock:", err);
      return "💧 Mock Data: Groundwater level ~15 ft below surface.";
    }
  }
  
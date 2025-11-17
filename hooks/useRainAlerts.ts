
import { useEffect, useState } from "react";
import { getRainAlert } from "@/src/services/weatherService";
import { getGroundwaterLevel } from "@/src/services/groundwaterService";
import { getAquiferInfo } from "@/src/services/aquiferService";

export function useLocationAlerts() {
  const [rain, setRain] = useState<string | null>(null);
  const [groundwater, setGroundwater] = useState<string | null>(null);
  const [aquifer, setAquifer] = useState<string | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;

      const rainAlert = await getRainAlert(latitude, longitude);
      const gwAlert = await getGroundwaterLevel(latitude, longitude);
      const aqAlert = await getAquiferInfo(latitude, longitude);

      setRain(rainAlert);
      setGroundwater(gwAlert);
      setAquifer(aqAlert);
    });
  }, []);

  return { rain, groundwater, aquifer };
}






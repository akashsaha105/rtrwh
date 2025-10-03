// src/services/aquiferService.ts
export async function getAquiferInfo(lat: number, lon: number) {
    try {
      // Example ArcGIS query (replace with real aquifer service in your region)
      const url = `https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/Aquifers/FeatureServer/0/query?geometry=${lon},${lat}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=*&returnGeometry=false&f=json`;
  
      const res = await fetch(url);
      const data = await res.json();
  
      if (data.features?.length > 0) {
        const name = data.features[0].attributes["AQUIFER_NAME"];
        return `🌍 Aquifer: ${name}`;
      } else {
        throw new Error("No aquifer found");
      }
    } catch (err) {
      console.error("Aquifer API failed, using mock:", err);
      return "🌍 Mock Data: Alluvial Aquifer (sample info).";
    }
  }
  
const express = require("express");
const router = express.Router();
const axios = require("axios");
const { calculateEffectiveFuelVolume } = require("../utils/calculate");

router.post("/", async (req, res) => {
  try {
    const { origin, budget, efficiency, radius = 5000 } = req.body;

    if (
      !origin || !origin.lat || !origin.lng ||
      typeof budget !== "number" ||
      typeof efficiency !== "number"
    ) {
      return res.status(400).json({ error: "Invalid origin, budget, or efficiency" });
    }

    const originString = `${origin.lat},${origin.lng}`;
    const nearbyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${originString}&radius=${radius}&type=gas_station&key=${process.env.GOOGLE_API_KEY}`;
    const nearbyResponse = await axios.get(nearbyUrl);
    const nearbyStations = nearbyResponse.data.results;

    const placeDetailsPromises = nearbyStations.map(async (station) => {
      try {
        const detailsUrl = `https://places.googleapis.com/v1/places/${station.place_id}?fields=displayName,formattedAddress,fuelOptions&key=${process.env.GOOGLE_API_KEY}`;
        const detailsRes = await axios.get(detailsUrl);
        const details = detailsRes.data;

        const prices = details?.fuelOptions?.fuelPrices;
        const fuelEntry = prices?.find(fp => fp.type === "REGULAR_UNLEADED");

        if (!fuelEntry || fuelEntry.price?.units == null || fuelEntry.price?.nanos == null) {
          return null;
        }

        const priceFloat = parseFloat(
          `${fuelEntry.price.units}.${Math.round(fuelEntry.price.nanos / 1e6).toString().padStart(3, '0')}`
        );

        return {
          place_id: station.place_id,
          station_name: details.displayName?.text || station.name,
          address: details.formattedAddress || station.vicinity,
          location: station.geometry.location,
          lat: station.geometry.location.lat,
          lng: station.geometry.location.lng, 
          price: priceFloat,
        };
      } catch (error) {
        return null;
      }
    });

    const stationResults = (await Promise.all(placeDetailsPromises)).filter(Boolean);

    const destinations = stationResults.map(s => `${s.location.lat},${s.location.lng}`).join("|");
    const distanceUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originString}&destinations=${destinations}&key=${process.env.GOOGLE_API_KEY}`;
    const distanceRes = await axios.get(distanceUrl);
    const distanceRows = distanceRes.data.rows[0].elements;

    const finalStations = stationResults.map((station, i) => {
      const distance_km = distanceRows[i].distance?.value / 1000;
      const duration_text = distanceRows[i].duration?.text || "";
      const distance_text = distanceRows[i].distance?.text || "";

      const result = calculateEffectiveFuelVolume({
        price_per_litre: station.price,
        distance_km,
        budget,
        efficiency_l_per_100km: efficiency
      });

      return {
        ...station,
        distance: distanceRows[i].distance?.value || null,
        distance_text,
        duration_text,
        fuel_volume: parseFloat(result.fuel_volume),
      };
    });

    res.json(finalStations);
  } catch (err) {
    console.error("Error in /api/volume-based:", err.message);
    res.status(500).json({ error: "Failed to calculate volume-based data" });
  }
});

module.exports = router;

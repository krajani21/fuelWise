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

    // Calculate area price statistics for comparisons
    const avgPrice = stationResults.reduce((sum, s) => sum + s.price, 0) / stationResults.length;
    const maxPrice = Math.max(...stationResults.map(s => s.price));
    const minPrice = Math.min(...stationResults.map(s => s.price));

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

      const fuelVolume = parseFloat(result.fuel_volume);
      const travelCost = parseFloat(result.travel_cost);
      const fuelCost = fuelVolume * station.price;
      const totalCost = travelCost + fuelCost;
      const costPerLiterIncludingTravel = fuelVolume > 0 ? totalCost / fuelVolume : 0;

      // Calculate savings compared to different baselines
      const savingsVsAverage = (avgPrice - station.price) * fuelVolume;
      const savingsVsMostExpensive = (maxPrice - station.price) * fuelVolume;
      const savingsVsNearest = 0; // Will be calculated in frontend if needed

      // Calculate value score (higher is better)
      const valueScore = calculateValueScore({
        fuelVolume,
        totalCost,
        distance_km,
        price: station.price,
        avgPrice,
        maxPrice
      });

      return {
        ...station,
        distance: distanceRows[i].distance?.value || null,
        distance_text,
        duration_text,
        fuel_volume: fuelVolume,
        travel_cost: travelCost,
        fuel_cost: fuelCost,
        total_cost: totalCost,
        cost_per_liter_including_travel: costPerLiterIncludingTravel,
        savings_vs_average: savingsVsAverage > 0 ? savingsVsAverage : 0,
        savings_vs_most_expensive: savingsVsMostExpensive > 0 ? savingsVsMostExpensive : 0,
        value_score: valueScore,
        area_stats: {
          avg_price: avgPrice,
          max_price: maxPrice,
          min_price: minPrice
        }
      };
    });

    res.json(finalStations);
  } catch (err) {
    console.error("Error in /api/volume-based:", err.message);
    res.status(500).json({ error: "Failed to calculate volume-based data" });
  }
});

// Helper function to calculate value score
const calculateValueScore = ({ fuelVolume, totalCost, distance_km, price, avgPrice, maxPrice }) => {
  if (fuelVolume <= 0 || totalCost <= 0) return 0;
  
  // Base score from fuel volume (more fuel = higher score)
  const volumeScore = Math.min(fuelVolume / 50, 1) * 40; // Max 40 points for volume
  
  // Cost efficiency score (lower cost per liter = higher score)
  const costPerLiter = totalCost / fuelVolume;
  const costScore = Math.max(0, (3 - costPerLiter) / 3) * 30; // Max 30 points for cost efficiency
  
  // Price competitiveness score (cheaper than average = higher score)
  const priceScore = Math.max(0, (avgPrice - price) / avgPrice) * 20; // Max 20 points for price
  
  // Distance penalty (closer = higher score)
  const distanceScore = Math.max(0, (10 - distance_km) / 10) * 10; // Max 10 points for proximity
  
  return Math.round(volumeScore + costScore + priceScore + distanceScore);
};

module.exports = router;

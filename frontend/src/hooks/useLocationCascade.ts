import { useState } from "react";
import { SECTORS, getRegions, getZones } from "@/data/locationData";

export function useLocationCascade(initial?: { sector?: string; region?: string; zone?: string }) {
  const [sector, setSectorState] = useState<string>(initial?.sector ?? "");
  const [region, setRegionState] = useState<string>(initial?.region ?? "");
  const [zone, setZoneState] = useState<string>(initial?.zone ?? "");

  const setSector = (val: string) => {
    setSectorState(val);
    setRegionState("");
    setZoneState("");
  };

  const setRegion = (val: string) => {
    setRegionState(val);
    setZoneState("");
  };

  const setZone = (val: string) => {
    setZoneState(val);
  };

  const sectors = SECTORS;
  const regions = sector ? getRegions(sector) : [];
  const zones = sector && region ? getZones(sector, region) : [];

  return {
    sector,
    setSector,
    region,
    setRegion,
    zone,
    setZone,
    sectors,
    regions,
    zones,
    isLoading: false,
  };
}

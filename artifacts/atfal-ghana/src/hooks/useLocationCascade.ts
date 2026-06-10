import { useState, useEffect } from "react";
import { useListSectors, useListRegions, useListZones } from "@workspace/api-client-react";

export function useLocationCascade() {
  const [sector, setSector] = useState<string | undefined>();
  const [region, setRegion] = useState<string | undefined>();
  const [zone, setZone] = useState<string | undefined>();

  const { data: sectorsData, isLoading: isLoadingSectors } = useListSectors();
  const { data: regionsData, isLoading: isLoadingRegions } = useListRegions(
    { sector },
    { query: { enabled: !!sector } as any }
  );
  const { data: zonesData, isLoading: isLoadingZones } = useListZones(
    { region },
    { query: { enabled: !!region } as any }
  );

  useEffect(() => {
    setRegion(undefined);
    setZone(undefined);
  }, [sector]);

  useEffect(() => {
    setZone(undefined);
  }, [region]);

  return {
    sector,
    setSector,
    region,
    setRegion,
    zone,
    setZone,
    sectors: sectorsData || [],
    regions: regionsData || [],
    zones: zonesData || [],
    isLoading: isLoadingSectors || isLoadingRegions || isLoadingZones
  };
}

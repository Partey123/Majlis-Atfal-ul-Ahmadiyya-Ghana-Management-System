import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { SECTORS, getRegions, getZones } from "@/data/locationData";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface MemberFiltersProps {
  filters: {
    wing?: string;
    sector?: string;
    region?: string;
    zone?: string;
    ageMin?: number;
    ageMax?: number;
  };
  setFilters: (filters: any) => void;
  onReset: () => void;
}

export function MemberFilters({ filters, setFilters, onReset }: MemberFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const regions = filters.sector ? getRegions(filters.sector) : [];
  const zones = filters.sector && filters.region ? getZones(filters.sector, filters.region) : [];

  const handleWingChange = (value: string) => {
    setFilters({ ...filters, wing: value === "all" ? undefined : value });
  };

  const handleSectorChange = (value: string) => {
    const newSector = value === "all" ? undefined : value;
    setFilters({ ...filters, sector: newSector, region: undefined, zone: undefined });
  };

  const handleRegionChange = (value: string) => {
    const newRegion = value === "all" ? undefined : value;
    setFilters({ ...filters, region: newRegion, zone: undefined });
  };

  const handleZoneChange = (value: string) => {
    setFilters({ ...filters, zone: value === "all" ? undefined : value });
  };

  const handleAgeChange = (field: "ageMin" | "ageMax", value: string) => {
    const num = value ? parseInt(value, 10) : undefined;
    setFilters({ ...filters, [field]: num });
  };

  const hasFilters = Object.values(filters).some(v => v !== undefined && v !== "");

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <div className="flex items-center justify-between mb-2">
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 md:hidden">
            <Filter className="h-4 w-4" />
            Filters {hasFilters && <span className="w-2 h-2 rounded-full bg-primary" />}
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className="md:!block space-y-4">
        <div className="bg-card border rounded-lg p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="space-y-1.5 w-full md:w-auto">
              <Label>Wing</Label>
              <ToggleGroup
                type="single"
                value={filters.wing || "all"}
                onValueChange={(val) => val && handleWingChange(val)}
                className="justify-start"
              >
                <ToggleGroupItem value="all" className="px-3">All</ToggleGroupItem>
                <ToggleGroupItem value="atfal_sughir" className="px-3">Sughir</ToggleGroupItem>
                <ToggleGroupItem value="atfal_kabir" className="px-3">Kabir</ToggleGroupItem>
                <ToggleGroupItem value="khuddam" className="px-3">Khuddam</ToggleGroupItem>
              </ToggleGroup>
            </div>

            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={onReset} className="h-9 px-3 gap-2 self-end md:self-auto">
                <X className="h-4 w-4" /> Reset Filters
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Sector */}
            <div className="space-y-1.5">
              <Label>Sector</Label>
              <Select value={filters.sector || "all"} onValueChange={handleSectorChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Sectors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  {SECTORS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Region */}
            <div className="space-y-1.5">
              <Label>Region</Label>
              <Select
                value={filters.region || "all"}
                onValueChange={handleRegionChange}
                disabled={!filters.sector}
              >
                <SelectTrigger>
                  <SelectValue placeholder={filters.sector ? "All Regions" : "Select Sector first"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {regions.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Zone */}
            <div className="space-y-1.5">
              <Label>Zone</Label>
              <Select
                value={filters.zone || "all"}
                onValueChange={handleZoneChange}
                disabled={!filters.region}
              >
                <SelectTrigger>
                  <SelectValue placeholder={filters.region ? "All Zones" : "Select Region first"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Zones</SelectItem>
                  {zones.map((z) => (
                    <SelectItem key={z} value={z}>{z}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Age Range */}
            <div className="space-y-1.5">
              <Label>Age Range</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  className="w-full"
                  value={filters.ageMin || ""}
                  onChange={(e) => handleAgeChange("ageMin", e.target.value)}
                  min={7}
                  max={100}
                />
                <span className="text-muted-foreground shrink-0">–</span>
                <Input
                  type="number"
                  placeholder="Max"
                  className="w-full"
                  value={filters.ageMax || ""}
                  onChange={(e) => handleAgeChange("ageMax", e.target.value)}
                  min={7}
                  max={100}
                />
              </div>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

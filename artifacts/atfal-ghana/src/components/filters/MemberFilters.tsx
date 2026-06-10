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
import { useLocationCascade } from "@/hooks/useLocationCascade";
import { useEffect, useState } from "react";
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
  const {
    sector,
    setSector,
    region,
    setRegion,
    zone,
    setZone,
    sectors,
    regions,
    zones,
    isLoading
  } = useLocationCascade();

  const handleWingChange = (value: string) => {
    setFilters({ ...filters, wing: value === "all" ? undefined : value });
  };

  const handleSectorChange = (value: string) => {
    setSector(value);
    setFilters({ ...filters, sector: value, region: undefined, zone: undefined });
  };

  const handleRegionChange = (value: string) => {
    setRegion(value);
    setFilters({ ...filters, region: value, zone: undefined });
  };

  const handleZoneChange = (value: string) => {
    setZone(value);
    setFilters({ ...filters, zone: value });
  };

  const handleAgeChange = (field: "ageMin" | "ageMax", value: string) => {
    const num = value ? parseInt(value, 10) : undefined;
    setFilters({ ...filters, [field]: num });
  };

  const handleReset = () => {
    setSector(undefined);
    setRegion(undefined);
    setZone(undefined);
    onReset();
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

            <div className="flex items-center gap-2 self-end md:self-auto mt-4 md:mt-0">
              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={handleReset} className="h-9 px-3 gap-2">
                  <X className="h-4 w-4" /> Reset
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label>Sector</Label>
              <Select value={filters.sector || ""} onValueChange={handleSectorChange} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="All Sectors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  {sectors.map((s) => (
                    <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Region</Label>
              <Select value={filters.region || ""} onValueChange={handleRegionChange} disabled={!filters.sector || isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="All Regions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {regions.map((r) => (
                    <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Zone</Label>
              <Select value={filters.zone || ""} onValueChange={handleZoneChange} disabled={!filters.region || isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="All Zones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Zones</SelectItem>
                  {zones.map((z) => (
                    <SelectItem key={z.id} value={z.name}>{z.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
                <span className="text-muted-foreground">-</span>
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

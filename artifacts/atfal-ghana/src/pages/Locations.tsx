import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { useLocationCascade } from "@/hooks/useLocationCascade";
import { useListCircuits, useListJamaats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search, ChevronRight, MapPin } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { motion, AnimatePresence } from "framer-motion";

export default function Locations() {
  const {
    sector, setSector,
    region, setRegion,
    zone, setZone,
    sectors, regions, zones
  } = useLocationCascade();

  const [circuitSearch, setCircuitSearch] = useState("");
  const debouncedCircuitSearch = useDebounce(circuitSearch, 300);
  const { data: circuits } = useListCircuits({ q: debouncedCircuitSearch }, { query: { enabled: true } as any });

  const [jamaatSearch, setJamaatSearch] = useState("");
  const debouncedJamaatSearch = useDebounce(jamaatSearch, 300);
  const { data: jamaats } = useListJamaats({ q: debouncedJamaatSearch }, { query: { enabled: true } as any });

  return (
    <div className="space-y-8 pb-10">
      <PageHeader 
        title="Location Hierarchy" 
        subtitle="Browse and manage the organizational structure"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[400px]">
        {/* Sectors */}
        <Card className="flex flex-col h-full overflow-hidden">
          <CardHeader className="py-3 px-4 bg-muted/30 border-b">
            <CardTitle className="text-sm font-medium">Sectors</CardTitle>
          </CardHeader>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {sectors.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSector(s.name)}
                  className={`w-full flex items-center justify-between p-2 rounded-md text-sm transition-colors ${sector === s.name ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted'}`}
                >
                  <span>{s.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={sector === s.name ? "secondary" : "outline"} className="text-[10px] px-1.5 py-0">
                      {s.memberCount}
                    </Badge>
                    <ChevronRight className={`h-4 w-4 ${sector === s.name ? 'opacity-100' : 'opacity-30'}`} />
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Regions */}
        <Card className="flex flex-col h-full overflow-hidden relative">
          <CardHeader className="py-3 px-4 bg-muted/30 border-b">
            <CardTitle className="text-sm font-medium">Regions</CardTitle>
          </CardHeader>
          <div className="flex-1 overflow-hidden relative">
            <AnimatePresence mode="wait">
              {sector ? (
                <motion.div
                  key={sector}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="absolute inset-0"
                >
                  <ScrollArea className="h-full">
                    <div className="p-2 space-y-1">
                      {regions.map(r => (
                        <button
                          key={r.id}
                          onClick={() => setRegion(r.name)}
                          className={`w-full flex items-center justify-between p-2 rounded-md text-sm transition-colors ${region === r.name ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted'}`}
                        >
                          <span>{r.name}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant={region === r.name ? "secondary" : "outline"} className="text-[10px] px-1.5 py-0">
                              {r.memberCount}
                            </Badge>
                            <ChevronRight className={`h-4 w-4 ${region === r.name ? 'opacity-100' : 'opacity-30'}`} />
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </motion.div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground p-6 text-center">
                  Select a sector to view its regions
                </div>
              )}
            </AnimatePresence>
          </div>
        </Card>

        {/* Zones */}
        <Card className="flex flex-col h-full overflow-hidden relative">
          <CardHeader className="py-3 px-4 bg-muted/30 border-b">
            <CardTitle className="text-sm font-medium">Zones</CardTitle>
          </CardHeader>
          <div className="flex-1 overflow-hidden relative">
            <AnimatePresence mode="wait">
              {region ? (
                <motion.div
                  key={region}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="absolute inset-0"
                >
                  <ScrollArea className="h-full">
                    <div className="p-2 space-y-1">
                      {zones.map(z => (
                        <button
                          key={z.id}
                          onClick={() => setZone(z.name)}
                          className={`w-full flex items-center justify-between p-2 rounded-md text-sm transition-colors ${zone === z.name ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted'}`}
                        >
                          <span>{z.name}</span>
                          <Badge variant={zone === z.name ? "secondary" : "outline"} className="text-[10px] px-1.5 py-0">
                            {z.memberCount}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </motion.div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground p-6 text-center">
                  Select a region to view its zones
                </div>
              )}
            </AnimatePresence>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mt-8">
        {/* Circuits Search */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Circuits Directory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search circuits..."
                className="pl-9"
                value={circuitSearch}
                onChange={(e) => setCircuitSearch(e.target.value)}
              />
            </div>
            <ScrollArea className="h-[250px] border rounded-md p-1 bg-muted/10">
              {circuits && circuits.length > 0 ? (
                <div className="space-y-1">
                  {circuits.map(c => (
                    <div key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-md hover:bg-muted/50 border border-transparent hover:border-border text-sm gap-2">
                      <div className="font-medium text-foreground">{c.name}</div>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <div className="flex items-center gap-1 text-xs">
                          <MapPin className="h-3 w-3" /> {c.zone}
                        </div>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {c.usageCount} members
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                  {debouncedCircuitSearch ? "No circuits found matching search" : "Type to search circuits"}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Jama'ats Search */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Jama'ats Directory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jama'ats..."
                className="pl-9"
                value={jamaatSearch}
                onChange={(e) => setJamaatSearch(e.target.value)}
              />
            </div>
            <ScrollArea className="h-[250px] border rounded-md p-1 bg-muted/10">
              {jamaats && jamaats.length > 0 ? (
                <div className="space-y-1">
                  {jamaats.map(j => (
                    <div key={j.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-md hover:bg-muted/50 border border-transparent hover:border-border text-sm gap-2">
                      <div className="font-medium text-foreground">{j.name}</div>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <div className="flex items-center gap-1 text-xs">
                          <MapPin className="h-3 w-3" /> {j.circuit}
                        </div>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {j.usageCount} members
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                  {debouncedJamaatSearch ? "No jama'ats found matching search" : "Type to search jama'ats"}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

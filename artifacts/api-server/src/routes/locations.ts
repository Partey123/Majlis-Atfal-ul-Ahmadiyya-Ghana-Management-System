import { Router } from "express";
import { db } from "@workspace/db";
import { circuitsTable, jamaatsTable } from "@workspace/db";
import { ilike, eq, sql, desc } from "drizzle-orm";
import { CreateCircuitBody, CreateJamaatBody } from "@workspace/api-zod";

const router = Router();

// Static location hierarchy
const LOCATION_DATA = {
  sectors: [
    { id: "northern", name: "Northern Sector" },
    { id: "middle", name: "Middle Sector" },
    { id: "southern", name: "Southern Sector" },
  ],
  regions: {
    northern: [
      { id: "northern_region", name: "Northern Region", sector: "northern" },
      { id: "upper_east", name: "Upper East Region", sector: "northern" },
      { id: "upper_west", name: "Upper West Region", sector: "northern" },
    ],
    middle: [
      { id: "ashanti", name: "Ashanti Region", sector: "middle" },
      { id: "brong_ahafo", name: "Brong Ahafo Region", sector: "middle" },
      { id: "eastern", name: "Eastern Region", sector: "middle" },
    ],
    southern: [
      { id: "greater_accra", name: "Greater Accra Region", sector: "southern" },
      { id: "central_east", name: "Central East Region", sector: "southern" },
      { id: "central_west", name: "Central West Region", sector: "southern" },
      { id: "volta", name: "Volta Region", sector: "southern" },
      { id: "western", name: "Western Region", sector: "southern" },
    ],
  } as Record<string, { id: string; name: string; sector: string }[]>,
  zones: {
    northern_region: ["Damongo", "Tamale", "Yendi"],
    upper_east: ["Bolga", "Nalerigu", "Walewale"],
    upper_west: ["Goripie", "Gurungu/Kalba", "Hamile", "Tumu", "Wa East", "Wa West"],
    ashanti: ["Amansie", "Denkyira", "Kumasi North", "Kumasi South", "Obuasi", "Oforikrom", "Sefwi", "Sekyere East", "Sekyere West"],
    brong_ahafo: ["Sunyani", "Techiman"],
    eastern: ["Akim Oda", "Koforidua", "Nkawkaw"],
    greater_accra: ["Accra", "Kasoa", "Tema"],
    central_east: ["Agona Zone", "Assikuma Bedum", "Essiam Zone", "Gomoa East", "Gomoa West"],
    central_west: ["Abura", "Assin", "Cape Coast", "Ekumfi", "Mankessim", "Saltpond", "Twifo"],
    volta: ["Volta"],
    western: ["Sekondi", "Takoradi", "Tarkwa"],
  } as Record<string, string[]>,
};

// GET /locations/sectors
router.get("/locations/sectors", async (_req, res) => {
  res.json(LOCATION_DATA.sectors.map((s) => ({ ...s, memberCount: 0 })));
});

// GET /locations/regions
router.get("/locations/regions", async (req, res) => {
  const sector = req.query.sector as string | undefined;
  let regions: { id: string; name: string; sector: string }[] = [];

  if (sector) {
    const sectorKey = Object.keys(LOCATION_DATA.regions).find(
      (k) => k === sector || LOCATION_DATA.sectors.find((s) => s.id === sector)
    );
    if (sectorKey) {
      regions = LOCATION_DATA.regions[sectorKey] ?? [];
    } else {
      // Try matching by sector name/id
      for (const [key, regs] of Object.entries(LOCATION_DATA.regions)) {
        if (regs.some((r) => r.sector === sector) || key === sector) {
          regions = regs;
          break;
        }
      }
    }
  } else {
    regions = Object.values(LOCATION_DATA.regions).flat();
  }

  res.json(regions.map((r) => ({ ...r, memberCount: 0 })));
});

// GET /locations/zones
router.get("/locations/zones", async (req, res) => {
  const region = req.query.region as string | undefined;
  let zones: { id: string; name: string; region: string }[] = [];

  if (region) {
    // Find the zone list for this region
    const zoneNames =
      LOCATION_DATA.zones[region] ??
      Object.entries(LOCATION_DATA.zones).find(([k]) => k === region)?.[1] ??
      [];
    zones = zoneNames.map((name) => ({
      id: name.toLowerCase().replace(/[^a-z0-9]/g, "_"),
      name,
      region,
    }));
  } else {
    for (const [regionKey, zoneNames] of Object.entries(LOCATION_DATA.zones)) {
      zoneNames.forEach((name) => {
        zones.push({
          id: name.toLowerCase().replace(/[^a-z0-9]/g, "_"),
          name,
          region: regionKey,
        });
      });
    }
  }

  res.json(zones.map((z) => ({ ...z, memberCount: 0 })));
});

// GET /locations/circuits
router.get("/locations/circuits", async (req, res) => {
  const q = req.query.q as string | undefined;
  const zone = req.query.zone as string | undefined;

  let query = db.select().from(circuitsTable).$dynamic();

  if (q) {
    query = query.where(ilike(circuitsTable.name, `%${q}%`));
  } else if (zone) {
    query = query.where(eq(circuitsTable.zone, zone));
  }

  const circuits = await query.orderBy(desc(circuitsTable.usageCount)).limit(20);
  res.json(circuits.map((c) => ({ id: c.id, name: c.name, zone: c.zone, usageCount: c.usageCount })));
});

// POST /locations/circuits
router.post("/locations/circuits", async (req, res) => {
  const parsed = CreateCircuitBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  // Upsert
  const existing = await db.select().from(circuitsTable).where(eq(circuitsTable.name, parsed.data.name)).limit(1);
  if (existing[0]) {
    res.status(201).json({ id: existing[0].id, name: existing[0].name, zone: existing[0].zone, usageCount: existing[0].usageCount });
    return;
  }
  const [circuit] = await db.insert(circuitsTable).values({ name: parsed.data.name, zone: parsed.data.zone ?? null }).returning();
  res.status(201).json({ id: circuit.id, name: circuit.name, zone: circuit.zone, usageCount: circuit.usageCount });
});

// GET /locations/jamaats
router.get("/locations/jamaats", async (req, res) => {
  const q = req.query.q as string | undefined;
  const circuit = req.query.circuit as string | undefined;

  let query = db.select().from(jamaatsTable).$dynamic();

  if (q) {
    query = query.where(ilike(jamaatsTable.name, `%${q}%`));
  } else if (circuit) {
    query = query.where(eq(jamaatsTable.circuit, circuit));
  }

  const jamaats = await query.orderBy(desc(jamaatsTable.usageCount)).limit(20);
  res.json(jamaats.map((j) => ({ id: j.id, name: j.name, circuit: j.circuit, usageCount: j.usageCount })));
});

// POST /locations/jamaats
router.post("/locations/jamaats", async (req, res) => {
  const parsed = CreateJamaatBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const existing = await db.select().from(jamaatsTable).where(eq(jamaatsTable.name, parsed.data.name)).limit(1);
  if (existing[0]) {
    res.status(201).json({ id: existing[0].id, name: existing[0].name, circuit: existing[0].circuit, usageCount: existing[0].usageCount });
    return;
  }
  const [jamaat] = await db.insert(jamaatsTable).values({ name: parsed.data.name, circuit: parsed.data.circuit ?? null }).returning();
  res.status(201).json({ id: jamaat.id, name: jamaat.name, circuit: jamaat.circuit, usageCount: jamaat.usageCount });
});

export default router;

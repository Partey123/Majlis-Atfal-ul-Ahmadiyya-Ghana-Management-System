import { db, pool, membersTable, circuitsTable, jamaatsTable, graduationsTable } from "@workspace/db";
import { sql } from "drizzle-orm";


// ── Location hierarchy ────────────────────────────────────────────────────────

const LOCATIONS = [
  // Northern Sector
  { sector: "Northern Sector", region: "Northern Region",   zone: "Damongo"          },
  { sector: "Northern Sector", region: "Northern Region",   zone: "Tamale"           },
  { sector: "Northern Sector", region: "Northern Region",   zone: "Yendi"            },
  { sector: "Northern Sector", region: "Upper East Region", zone: "Bolga"            },
  { sector: "Northern Sector", region: "Upper East Region", zone: "Nalerigu"         },
  { sector: "Northern Sector", region: "Upper East Region", zone: "Walewale"         },
  { sector: "Northern Sector", region: "Upper West Region", zone: "Goripie"          },
  { sector: "Northern Sector", region: "Upper West Region", zone: "Gurungu/Kalba"    },
  { sector: "Northern Sector", region: "Upper West Region", zone: "Hamile"           },
  { sector: "Northern Sector", region: "Upper West Region", zone: "Tumu"             },
  { sector: "Northern Sector", region: "Upper West Region", zone: "Wa East"          },
  { sector: "Northern Sector", region: "Upper West Region", zone: "Wa West"          },
  // Middle Sector
  { sector: "Middle Sector",   region: "Ashanti Region",    zone: "Amansie"          },
  { sector: "Middle Sector",   region: "Ashanti Region",    zone: "Denkyira"         },
  { sector: "Middle Sector",   region: "Ashanti Region",    zone: "Kumasi North"     },
  { sector: "Middle Sector",   region: "Ashanti Region",    zone: "Kumasi South"     },
  { sector: "Middle Sector",   region: "Ashanti Region",    zone: "Obuasi"           },
  { sector: "Middle Sector",   region: "Ashanti Region",    zone: "Oforikrom"        },
  { sector: "Middle Sector",   region: "Ashanti Region",    zone: "Sefwi"            },
  { sector: "Middle Sector",   region: "Ashanti Region",    zone: "Sekyere East"     },
  { sector: "Middle Sector",   region: "Ashanti Region",    zone: "Sekyere West"     },
  { sector: "Middle Sector",   region: "Brong Ahafo Region",zone: "Sunyani"          },
  { sector: "Middle Sector",   region: "Brong Ahafo Region",zone: "Techiman"         },
  { sector: "Middle Sector",   region: "Eastern Region",    zone: "Akim Oda"         },
  { sector: "Middle Sector",   region: "Eastern Region",    zone: "Koforidua"        },
  { sector: "Middle Sector",   region: "Eastern Region",    zone: "Nkawkaw"          },
  // Southern Sector
  { sector: "Southern Sector", region: "Greater Accra Region", zone: "Accra"         },
  { sector: "Southern Sector", region: "Greater Accra Region", zone: "Kasoa"         },
  { sector: "Southern Sector", region: "Greater Accra Region", zone: "Tema"          },
  { sector: "Southern Sector", region: "Central East Region",  zone: "Agona Zone"    },
  { sector: "Southern Sector", region: "Central East Region",  zone: "Assikuma Bedum"},
  { sector: "Southern Sector", region: "Central East Region",  zone: "Essiam Zone"   },
  { sector: "Southern Sector", region: "Central East Region",  zone: "Gomoa East"    },
  { sector: "Southern Sector", region: "Central East Region",  zone: "Gomoa West"    },
  { sector: "Southern Sector", region: "Central West Region",  zone: "Abura"         },
  { sector: "Southern Sector", region: "Central West Region",  zone: "Assin"         },
  { sector: "Southern Sector", region: "Central West Region",  zone: "Cape Coast"    },
  { sector: "Southern Sector", region: "Central West Region",  zone: "Ekumfi"        },
  { sector: "Southern Sector", region: "Central West Region",  zone: "Mankessim"     },
  { sector: "Southern Sector", region: "Central West Region",  zone: "Saltpond"      },
  { sector: "Southern Sector", region: "Central West Region",  zone: "Twifo"         },
  { sector: "Southern Sector", region: "Volta Region",         zone: "Volta"         },
  { sector: "Southern Sector", region: "Western Region",       zone: "Sekondi"       },
  { sector: "Southern Sector", region: "Western Region",       zone: "Takoradi"      },
  { sector: "Southern Sector", region: "Western Region",       zone: "Tarkwa"        },
] as const;

// ── Names ─────────────────────────────────────────────────────────────────────

const FIRST_NAMES = [
  "Abdul", "Ibrahim", "Mohammed", "Yusuf", "Hassan", "Usman", "Ismail",
  "Musa", "Idris", "Hamza", "Khalid", "Bilal", "Tariq", "Salim", "Zubair",
  "Abubakar", "Sulaiman", "Yahya", "Dawud", "Nuhu", "Mustapha", "Aminu",
  "Salifu", "Zakaria", "Rahmanu", "Shafiu", "Alhassan", "Alidu", "Karim",
  "Nasiru", "Razak", "Lukman", "Taufiq", "Farouk", "Sadiq", "Bashir",
  "Muntari", "Inusah", "Fuseini", "Mahama", "Seidu", "Haruna", "Shaibu",
  "Abubakari", "Tahiru", "Yakubu", "Dramani", "Mumuni", "Bawah", "Ayuba",
];

const MIDDLE_NAMES = [
  "Abdul", "Mohammed", "Ibrahim", "Yusuf", "Hassan", "Ismail", "Usman",
  "Musa", "Idris", "Khalid", "Salim", "Hamza", "Bilal", "Nuhu", "Awal",
  "Rahim", "Latif", "Wahab", "Razak", "Karim", "Shakur", "Ghani",
];

const LAST_NAMES = [
  "Alhassan", "Mohammed", "Ibrahim", "Sulemana", "Mahama", "Seidu",
  "Haruna", "Fuseini", "Zakaria", "Salifu", "Nuhu", "Yakubu", "Dramani",
  "Bawah", "Mumuni", "Muntari", "Inusah", "Ayuba", "Shaibu", "Tahiru",
  "Abubakari", "Aminu", "Umar", "Tanko", "Issah", "Abubakar", "Alidu",
  "Razak", "Latif", "Wahab", "Osman", "Hamidu", "Adamu", "Damba", "Ziblim",
  "Sandow", "Pelpuo", "Tampuri", "Wuni", "Bukari", "Kombat", "Banasco",
];

const POSITIONS = [
  "Secretary", "Treasurer", "Nazim", "Assistant Secretary",
  "Education Secretary", "Health Secretary", null, null, null, null,
];

const GUARDIAN_TYPES = ["Father", "Mother", "Uncle", "Guardian"];

// ── Circuits & Jamaats per zone ───────────────────────────────────────────────

const CIRCUITS_BY_ZONE: Record<string, string[]> = {
  // Northern
  "Damongo":            ["Damongo Central Circuit", "West Gonja Circuit"],
  "Tamale":             ["Tamale North Circuit", "Tamale South Circuit", "Tamale East Circuit"],
  "Yendi":              ["Yendi Circuit", "East Dagbon Circuit"],
  "Bolga":              ["Bolgatanga Circuit", "Upper East Circuit"],
  "Nalerigu":           ["Nalerigu Circuit"],
  "Walewale":           ["Walewale Circuit", "North Mamprusi Circuit"],
  "Goripie":            ["Goripie Circuit"],
  "Gurungu/Kalba":      ["Gurungu Circuit", "Kalba Circuit"],
  "Hamile":             ["Hamile Circuit"],
  "Tumu":               ["Tumu Circuit", "Sissala Circuit"],
  "Wa East":            ["Wa East Circuit"],
  "Wa West":            ["Wa West Circuit", "Wa Central Circuit"],
  // Middle
  "Amansie":            ["Amansie West Circuit", "Amansie East Circuit"],
  "Denkyira":           ["Denkyira Circuit"],
  "Kumasi North":       ["Kumasi North A Circuit", "Kumasi North B Circuit", "Suame Circuit"],
  "Kumasi South":       ["Kumasi South A Circuit", "Kumasi South B Circuit", "Bantama Circuit"],
  "Obuasi":             ["Obuasi Circuit", "Adansi Circuit"],
  "Oforikrom":          ["Oforikrom Circuit", "Asokwa Circuit"],
  "Sefwi":              ["Sefwi Wiawso Circuit", "Sefwi Bekwai Circuit"],
  "Sekyere East":       ["Sekyere East Circuit"],
  "Sekyere West":       ["Sekyere West Circuit"],
  "Sunyani":            ["Sunyani Circuit", "Dormaa Circuit"],
  "Techiman":           ["Techiman Circuit", "Nkoranza Circuit"],
  "Akim Oda":           ["Akim Oda Circuit", "Birim Central Circuit"],
  "Koforidua":          ["Koforidua Circuit", "New Juaben Circuit"],
  "Nkawkaw":            ["Nkawkaw Circuit", "Kwahu Circuit"],
  // Southern
  "Accra":              ["Accra Central Circuit", "Accra North Circuit", "Accra East Circuit", "Adabraka Circuit", "Madina Circuit"],
  "Kasoa":              ["Kasoa Circuit", "Awutu Circuit"],
  "Tema":               ["Tema Community 1 Circuit", "Tema Community 5 Circuit", "Tema West Circuit"],
  "Agona Zone":         ["Agona Swedru Circuit", "Agona East Circuit"],
  "Assikuma Bedum":     ["Assikuma Circuit"],
  "Essiam Zone":        ["Essiam Circuit"],
  "Gomoa East":         ["Gomoa East Circuit"],
  "Gomoa West":         ["Gomoa West Circuit"],
  "Abura":              ["Abura Circuit"],
  "Assin":              ["Assin South Circuit", "Assin North Circuit"],
  "Cape Coast":         ["Cape Coast Circuit", "Cape Coast North Circuit"],
  "Ekumfi":             ["Ekumfi Circuit"],
  "Mankessim":          ["Mankessim Circuit"],
  "Saltpond":           ["Saltpond Circuit"],
  "Twifo":              ["Twifo Praso Circuit"],
  "Volta":              ["Ho Circuit", "Volta Central Circuit"],
  "Sekondi":            ["Sekondi Circuit"],
  "Takoradi":           ["Takoradi Circuit", "Takoradi North Circuit"],
  "Tarkwa":             ["Tarkwa Circuit", "Prestea Circuit"],
};

const JAMAATS_BY_CIRCUIT: Record<string, string[]> = {
  // sample jamaats
  "Tamale North Circuit":         ["Tamale North Jamaat", "Savelugu Jamaat"],
  "Tamale South Circuit":         ["Tamale South Jamaat", "Sagnerigu Jamaat"],
  "Tamale East Circuit":          ["Tamale East Jamaat"],
  "Accra Central Circuit":        ["Accra Central Jamaat", "Nima Jamaat"],
  "Accra North Circuit":          ["Accra North Jamaat", "Kwabenya Jamaat"],
  "Accra East Circuit":           ["Accra East Jamaat", "Ashiyie Jamaat"],
  "Adabraka Circuit":             ["Adabraka Jamaat"],
  "Madina Circuit":               ["Madina Jamaat", "Adentan Jamaat"],
  "Kumasi North A Circuit":       ["Kumasi North Jamaat", "Ahenema Kokoben Jamaat"],
  "Kumasi North B Circuit":       ["Asawasi Jamaat", "Anloga Jamaat"],
  "Kumasi South A Circuit":       ["Kumasi South Jamaat", "Atonsu Jamaat"],
  "Kumasi South B Circuit":       ["Suame Jamaat"],
  "Tema Community 1 Circuit":     ["Tema Community 1 Jamaat"],
  "Tema Community 5 Circuit":     ["Tema Community 5 Jamaat", "Tema Community 9 Jamaat"],
  "Tema West Circuit":            ["Tema West Jamaat", "Ashaiman Jamaat"],
  "Cape Coast Circuit":           ["Cape Coast Jamaat"],
  "Cape Coast North Circuit":     ["Cape Coast North Jamaat", "Abura Dunkwa Jamaat"],
};

// Fallback: derive jamaat name from circuit
function getJamaats(circuit: string): string[] {
  if (JAMAATS_BY_CIRCUIT[circuit]) return JAMAATS_BY_CIRCUIT[circuit];
  return [`${circuit.replace(" Circuit", "")} Jamaat`];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length];
}

function dateOfBirth(wing: "atfal_sughir" | "atfal_kabir" | "khuddam", offset: number): string {
  // Reference date: 2026-06-10
  const ref = new Date("2026-06-10");
  let ageYears: number;
  if (wing === "atfal_sughir") {
    ageYears = 7 + (offset % 5);   // ages 7–11
  } else if (wing === "atfal_kabir") {
    ageYears = 12 + (offset % 3);  // ages 12–14
  } else {
    ageYears = 15 + (offset % 8);  // ages 15–22
  }
  const dob = new Date(ref);
  dob.setFullYear(ref.getFullYear() - ageYears);
  dob.setMonth((offset * 3) % 12);
  dob.setDate(1 + (offset % 28));
  return dob.toISOString().split("T")[0];
}

function computeWing(dobStr: string): "atfal_sughir" | "atfal_kabir" | "khuddam" {
  const dob = new Date(dobStr);
  const ref = new Date("2026-06-10");
  let age = ref.getFullYear() - dob.getFullYear();
  const m = ref.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && ref.getDate() < dob.getDate())) age--;
  if (age >= 15) return "khuddam";
  if (age >= 12) return "atfal_kabir";
  return "atfal_sughir";
}

// ── Main seed ─────────────────────────────────────────────────────────────────

async function seed() {
  console.log("🌱 Seeding database...");

  // Clear in dependency order
  await db.execute(sql`TRUNCATE TABLE graduations, member_history, members, circuits, jamaats RESTART IDENTITY CASCADE`);
  console.log("  ✓ Cleared all tables");

  // ── Circuits ──
  const circuitRows: { id: number; name: string; zone: string }[] = [];
  let ci = 0;
  for (const [zone, circuits] of Object.entries(CIRCUITS_BY_ZONE)) {
    for (const name of circuits) {
      const [row] = await db.insert(circuitsTable).values({ name, zone }).returning();
      circuitRows.push({ id: row.id, name: row.name, zone: row.zone! });
      ci++;
    }
  }
  console.log(`  ✓ Seeded ${ci} circuits`);

  // ── Jamaats ──
  let ji = 0;
  const seenJamaats = new Set<string>();
  for (const circuitRow of circuitRows) {
    const jamaats = getJamaats(circuitRow.name);
    for (const name of jamaats) {
      if (seenJamaats.has(name)) continue;
      seenJamaats.add(name);
      await db.insert(jamaatsTable)
        .values({ name, circuit: circuitRow.name })
        .onConflictDoNothing();
      ji++;
    }
  }
  console.log(`  ✓ Seeded ${ji} jamaats`);

  // ── Members ──
  // Generate ~4–6 members per zone (weighted to give more to larger zones)
  const members: (typeof membersTable.$inferInsert)[] = [];
  let mi = 0;

  for (const loc of LOCATIONS) {
    const circuits = CIRCUITS_BY_ZONE[loc.zone] ?? [`${loc.zone} Circuit`];
    // larger zones get more members
    const count = circuits.length >= 3 ? 7 : circuits.length === 2 ? 5 : 3;

    for (let k = 0; k < count; k++) {
      const circuit = pick(circuits, k);
      const jamaats = getJamaats(circuit);
      const jamaat = pick(jamaats, k);

      // Distribute wings: roughly 35% sughir, 30% kabir, 35% khuddam
      const wingIdx = (mi + k) % 20;
      const wing: "atfal_sughir" | "atfal_kabir" | "khuddam" =
        wingIdx < 7  ? "atfal_sughir" :
        wingIdx < 13 ? "atfal_kabir"  :
                       "khuddam";

      const dob = dateOfBirth(wing, mi + k);
      const actualWing = computeWing(dob);

      const firstName = pick(FIRST_NAMES, mi + k * 7 + 3);
      const middleName = (mi + k) % 3 === 0 ? pick(MIDDLE_NAMES, mi + k + 5) : undefined;
      const lastName   = pick(LAST_NAMES,  mi + k * 11 + 1);
      const position   = pick(POSITIONS,   mi + k * 13);

      const hasGuardian = (mi + k) % 2 === 0;

      members.push({
        firstName,
        middleName: middleName ?? null,
        lastName,
        dateOfBirth: dob,
        wing: actualWing,
        sector: loc.sector,
        region: loc.region,
        zone:   loc.zone,
        circuit,
        jamaat,
        position: position ?? null,
        guardianName:    hasGuardian ? `${pick(FIRST_NAMES, mi + k + 9)} ${pick(LAST_NAMES, mi + k + 2)}` : null,
        guardianType:    hasGuardian ? pick(GUARDIAN_TYPES, mi + k) : null,
        guardianPhone:   hasGuardian ? `0${pick(["24","20","54","55","59","50","26","27"], mi+k)}${String(10000000 + ((mi + k) * 7919) % 90000000).slice(0,7)}` : null,
        guardianEmail:   null,
        guardianAddress: hasGuardian ? `${loc.zone}, ${loc.region}` : null,
      });
    }
    mi += count;
  }

  // Insert in batches of 50
  for (let i = 0; i < members.length; i += 50) {
    await db.insert(membersTable).values(members.slice(i, i + 50));
  }
  console.log(`  ✓ Seeded ${members.length} members`);

  // ── Graduations (historical records for khuddam members) ──
  const khuddam = await db.select({ id: membersTable.id }).from(membersTable)
    .where(sql`wing = 'khuddam'`).limit(30);

  const graduationRows = khuddam.slice(0, 20).map((m, idx) => ({
    memberId: m.id,
    previousWing: idx % 2 === 0 ? "atfal_kabir" : "atfal_sughir",
    newWing:      idx % 2 === 0 ? "khuddam"     : "atfal_kabir",
    graduatedAt:  new Date(2024, idx % 12, (idx % 28) + 1),
  }));

  if (graduationRows.length > 0) {
    await db.insert(graduationsTable).values(graduationRows);
  }
  console.log(`  ✓ Seeded ${graduationRows.length} graduation records`);

  // ── Update usage counts for circuits & jamaats ──
  await db.execute(sql`
    UPDATE circuits c
    SET usage_count = (
      SELECT COUNT(*) FROM members m WHERE m.circuit = c.name
    )
  `);
  await db.execute(sql`
    UPDATE jamaats j
    SET usage_count = (
      SELECT COUNT(*) FROM members m WHERE m.jamaat = j.name
    )
  `);
  console.log("  ✓ Updated usage counts");

  // ── Summary ──
  const countResult = await db.execute(sql`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE wing = 'atfal_sughir')::int AS sughir,
      COUNT(*) FILTER (WHERE wing = 'atfal_kabir')::int  AS kabir,
      COUNT(*) FILTER (WHERE wing = 'khuddam')::int      AS khdam
    FROM members
  `);
  const row = (countResult as any).rows?.[0] ?? countResult[0] ?? {};

  console.log(`\n  📊 Summary:`);
  console.log(`     Total members : ${row.total}`);
  console.log(`     Atfal Sughir  : ${row.sughir}`);
  console.log(`     Atfal Kabir   : ${row.kabir}`);
  console.log(`     Khuddam       : ${row.khdam}`);
  console.log("\n✅  Seed complete!");
}

seed().catch((e) => { console.error(e); process.exit(1); }).finally(() => pool.end());

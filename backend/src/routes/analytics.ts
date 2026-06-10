import { Router } from "express";
import { db } from "@workspace/db";
import { membersTable } from "@workspace/db";
import { eq, sql, gte } from "drizzle-orm";

const router = Router();

function computeWing(dob: string): "atfal_sughir" | "atfal_kabir" | "khuddam" {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  if (age >= 15) return "khuddam";
  if (age >= 12) return "atfal_kabir";
  return "atfal_sughir";
}

// GET /analytics/summary
router.get("/analytics/summary", async (_req, res) => {
  const [counts] = await db.select({
    total: sql<number>`count(*)`,
    sughir: sql<number>`count(*) filter (where wing = 'atfal_sughir')`,
    kabir: sql<number>`count(*) filter (where wing = 'atfal_kabir')`,
    khuddam: sql<number>`count(*) filter (where wing = 'khuddam')`,
  }).from(membersTable);

  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const [newThisMonth] = await db.select({ count: sql<number>`count(*)` })
    .from(membersTable)
    .where(gte(membersTable.createdAt, firstOfMonth));

  // Graduations this month: members turning 15 this month
  const [graduationsThisMonth] = await db.select({ count: sql<number>`count(*)` })
    .from(membersTable)
    .where(
      sql`extract(month from date_of_birth) = ${now.getMonth() + 1}
        AND extract(year from now()) - extract(year from date_of_birth) = 15`
    );

  res.json({
    totalMembers: Number(counts.total),
    atfalSughirCount: Number(counts.sughir),
    atfalKabirCount: Number(counts.kabir),
    khuddamCount: Number(counts.khuddam),
    newThisMonth: Number(newThisMonth.count),
    graduationsThisMonth: Number(graduationsThisMonth.count),
  });
});

// GET /analytics/by-sector
router.get("/analytics/by-sector", async (_req, res) => {
  const rows = await db
    .select({
      sector: membersTable.sector,
      total: sql<number>`count(*)`,
      sughir: sql<number>`count(*) filter (where wing = 'atfal_sughir')`,
      kabir: sql<number>`count(*) filter (where wing = 'atfal_kabir')`,
      khuddam: sql<number>`count(*) filter (where wing = 'khuddam')`,
    })
    .from(membersTable)
    .groupBy(membersTable.sector);

  res.json(
    rows.map((r) => ({
      sector: r.sector,
      totalMembers: Number(r.total),
      atfalSughir: Number(r.sughir),
      atfalKabir: Number(r.kabir),
      khuddam: Number(r.khuddam),
    }))
  );
});

// GET /analytics/by-region
router.get("/analytics/by-region", async (req, res) => {
  const sector = req.query.sector as string | undefined;

  const whereClause = sector ? eq(membersTable.sector, sector) : undefined;

  const rows = await db.select({
    region: membersTable.region,
    sector: membersTable.sector,
    total: sql<number>`count(*)`,
    sughir: sql<number>`count(*) filter (where wing = 'atfal_sughir')`,
    kabir: sql<number>`count(*) filter (where wing = 'atfal_kabir')`,
    khuddam: sql<number>`count(*) filter (where wing = 'khuddam')`,
  })
    .from(membersTable)
    .where(whereClause)
    .groupBy(membersTable.region, membersTable.sector);

  res.json(rows.map((r) => ({
    region: r.region,
    sector: r.sector,
    totalMembers: Number(r.total),
    atfalSughir: Number(r.sughir),
    atfalKabir: Number(r.kabir),
    khuddam: Number(r.khuddam),
  })));
});

// GET /analytics/birthdays
router.get("/analytics/birthdays", async (_req, res) => {
  const today = new Date();
  const dayOfMonth = today.getDate();
  const month = today.getMonth() + 1;

  // Today's birthdays
  const todayMembers = await db.select().from(membersTable).where(
    sql`extract(month from date_of_birth) = ${month} AND extract(day from date_of_birth) = ${dayOfMonth}`
  );

  // This week's birthdays
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const weekMembers = await db.select().from(membersTable).where(
    sql`(extract(month from date_of_birth), extract(day from date_of_birth)) IN (
      SELECT extract(month from d), extract(day from d)
      FROM generate_series(${weekStart.toISOString()}::date, ${weekEnd.toISOString()}::date, '1 day'::interval) d
    )`
  );

  // This month's birthdays
  const monthMembers = await db.select().from(membersTable).where(
    sql`extract(month from date_of_birth) = ${month}`
  );

  function fmt(m: typeof membersTable.$inferSelect) {
    const birth = new Date(m.dateOfBirth);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const mo = now.getMonth() - birth.getMonth();
    if (mo < 0 || (mo === 0 && now.getDate() < birth.getDate())) age--;
    return { ...m, age, wing: computeWing(m.dateOfBirth) };
  }

  res.json({
    today: todayMembers.map(fmt),
    thisWeek: weekMembers.map(fmt),
    thisMonth: monthMembers.map(fmt),
  });
});

export default router;

import { Router } from "express";
import { db } from "@workspace/db";
import { membersTable, graduationsTable } from "@workspace/db";
import { eq, sql, desc, gte } from "drizzle-orm";

const router = Router();

function computeAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function computeWing(age: number): "atfal_sughir" | "atfal_kabir" | "khuddam" {
  if (age >= 15) return "khuddam";
  if (age >= 12) return "atfal_kabir";
  return "atfal_sughir";
}

function formatMember(m: typeof membersTable.$inferSelect) {
  const age = computeAge(m.dateOfBirth);
  return { ...m, age, wing: computeWing(age) };
}

// GET /graduations
router.get("/graduations", async (req, res) => {
  const period = req.query.period as string | undefined;

  const now = new Date();
  let since: Date | undefined;

  if (period === "today") {
    since = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (period === "this_month") {
    since = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (period === "this_quarter") {
    const quarter = Math.floor(now.getMonth() / 3);
    since = new Date(now.getFullYear(), quarter * 3, 1);
  } else if (period === "this_year") {
    since = new Date(now.getFullYear(), 0, 1);
  }

  const rows = await db
    .select({
      id: graduationsTable.id,
      memberId: graduationsTable.memberId,
      previousWing: graduationsTable.previousWing,
      newWing: graduationsTable.newWing,
      graduatedAt: graduationsTable.graduatedAt,
      firstName: membersTable.firstName,
      lastName: membersTable.lastName,
      region: membersTable.region,
      zone: membersTable.zone,
      sector: membersTable.sector,
    })
    .from(graduationsTable)
    .innerJoin(membersTable, eq(graduationsTable.memberId, membersTable.id))
    .where(since ? gte(graduationsTable.graduatedAt, since) : undefined)
    .orderBy(desc(graduationsTable.graduatedAt))
    .limit(100);

  res.json(
    rows.map((r) => ({
      id: r.id,
      memberId: r.memberId,
      memberName: `${r.firstName} ${r.lastName}`,
      zone: r.zone,
      region: r.region,
      sector: r.sector ?? "",
      graduatedAt: r.graduatedAt,
      previousWing: r.previousWing,
      newWing: r.newWing,
    }))
  );
});

// GET /graduations/upcoming
router.get("/graduations/upcoming", async (_req, res) => {
  const now = new Date();

  // Members turning 15 this month
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Members turning 15 this quarter
  const quarter = Math.floor(now.getMonth() / 3);
  const thisQuarterStart = new Date(now.getFullYear(), quarter * 3, 1);
  const thisQuarterEnd = new Date(now.getFullYear(), quarter * 3 + 3, 0);

  // Members turning 15 this year
  const thisYearStart = new Date(now.getFullYear(), 0, 1);
  const thisYearEnd = new Date(now.getFullYear(), 11, 31);

  // A member turns 15 when DOB + 15 years falls within the range
  const currentYear = now.getFullYear();

  function buildQuery(startDate: Date, endDate: Date) {
    const startMonth = startDate.getMonth() + 1;
    const startDay = startDate.getDate();
    const endMonth = endDate.getMonth() + 1;
    const endDay = endDate.getDate();

    // Find members whose 15th birthday falls in the given date range of the current year
    return db.select().from(membersTable).where(
      sql`
        (${currentYear} - extract(year from date_of_birth)::int = 15)
        AND (
          make_date(${currentYear}, extract(month from date_of_birth)::int, extract(day from date_of_birth)::int)
          BETWEEN ${startDate.toISOString().split('T')[0]}::date AND ${endDate.toISOString().split('T')[0]}::date
        )
      `
    );
  }

  const [thisMonth, thisQuarter, thisYear] = await Promise.all([
    buildQuery(thisMonthStart, thisMonthEnd),
    buildQuery(thisQuarterStart, thisQuarterEnd),
    buildQuery(thisYearStart, thisYearEnd),
  ]);

  res.json({
    thisMonth: thisMonth.map(formatMember),
    thisQuarter: thisQuarter.map(formatMember),
    thisYear: thisYear.map(formatMember),
  });
});

export default router;

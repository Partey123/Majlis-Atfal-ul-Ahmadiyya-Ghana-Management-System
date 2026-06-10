import { Router } from "express";
import { db } from "@workspace/db";
import { membersTable, memberHistoryTable } from "@workspace/db";
import { eq, ilike, and, gte, lte, or, sql, asc, desc } from "drizzle-orm";
import {
  ListMembersQueryParams,
  CreateMemberBody,
  GetMemberParams,
  UpdateMemberParams,
  UpdateMemberBody,
  DeleteMemberParams,
  GetMemberHistoryParams,
} from "@workspace/api-zod";

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
  return {
    id: m.id,
    firstName: m.firstName,
    middleName: m.middleName,
    lastName: m.lastName,
    dateOfBirth: m.dateOfBirth,
    age,
    wing: m.wing,
    sector: m.sector,
    region: m.region,
    zone: m.zone,
    circuit: m.circuit,
    jamaat: m.jamaat,
    photoUrl: m.photoUrl,
    guardianName: m.guardianName,
    guardianType: m.guardianType,
    guardianPhone: m.guardianPhone,
    guardianEmail: m.guardianEmail,
    guardianAddress: m.guardianAddress,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  };
}

// GET /members
router.get("/members", async (req, res) => {
  const parsed = ListMembersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query params" });
    return;
  }
  const { wing, sector, region, zone, circuit, jamaat, search, ageMin, ageMax, page = 1, pageSize = 50 } = parsed.data;

  const conditions = [];
  if (wing) conditions.push(eq(membersTable.wing, wing));
  if (sector) conditions.push(eq(membersTable.sector, sector));
  if (region) conditions.push(eq(membersTable.region, region));
  if (zone) conditions.push(eq(membersTable.zone, zone));
  if (circuit) conditions.push(ilike(membersTable.circuit, `%${circuit}%`));
  if (jamaat) conditions.push(ilike(membersTable.jamaat, `%${jamaat}%`));
  if (search) {
    conditions.push(
      or(
        ilike(membersTable.firstName, `%${search}%`),
        ilike(membersTable.lastName, `%${search}%`),
        ilike(membersTable.middleName, `%${search}%`),
        ilike(membersTable.guardianName, `%${search}%`),
        ilike(membersTable.circuit, `%${search}%`),
        ilike(membersTable.jamaat, `%${search}%`),
        ilike(membersTable.region, `%${search}%`),
        ilike(membersTable.zone, `%${search}%`)
      )
    );
  }

  // Age filtering via date-of-birth range
  if (ageMin !== undefined) {
    const maxDob = new Date();
    maxDob.setFullYear(maxDob.getFullYear() - ageMin);
    conditions.push(lte(membersTable.dateOfBirth, maxDob.toISOString().split("T")[0]));
  }
  if (ageMax !== undefined) {
    const minDob = new Date();
    minDob.setFullYear(minDob.getFullYear() - ageMax - 1);
    conditions.push(gte(membersTable.dateOfBirth, minDob.toISOString().split("T")[0]));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const offset = (page - 1) * pageSize;

  const [members, countResult] = await Promise.all([
    db.select().from(membersTable).where(where).orderBy(asc(membersTable.lastName), asc(membersTable.firstName)).limit(pageSize).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(membersTable).where(where),
  ]);

  const total = Number(countResult[0]?.count ?? 0);
  res.json({ members: members.map(formatMember), total, page, pageSize });
});

// POST /members
router.post("/members", async (req, res) => {
  const parsed = CreateMemberBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const data = parsed.data;
  const dobStr = data.dateOfBirth instanceof Date ? data.dateOfBirth.toISOString().split("T")[0] : String(data.dateOfBirth);
  const age = computeAge(dobStr);
  const wing = computeWing(age);

  const member = await db.transaction(async (tx) => {
    const [newMember] = await tx
      .insert(membersTable)
      .values({
        firstName: data.firstName,
        middleName: data.middleName ?? null,
        lastName: data.lastName,
        dateOfBirth: dobStr,
        wing,
        sector: data.sector,
        region: data.region,
        zone: data.zone,
        circuit: data.circuit,
        jamaat: data.jamaat,
        photoUrl: data.photoUrl ?? null,
        guardianName: data.guardianName ?? null,
        guardianType: data.guardianType ?? null,
        guardianPhone: data.guardianPhone ?? null,
        guardianEmail: data.guardianEmail ?? null,
        guardianAddress: data.guardianAddress ?? null,
      })
      .returning();

    await tx.insert(memberHistoryTable).values({
      memberId: newMember.id,
      eventType: "created",
      description: "Member record created",
    });

    await tx.execute(sql`UPDATE circuits SET usage_count = usage_count + 1 WHERE name = ${data.circuit}`);
    await tx.execute(sql`UPDATE jamaats SET usage_count = usage_count + 1 WHERE name = ${data.jamaat}`);

    return newMember;
  });

  res.status(201).json(formatMember(member));
});

// GET /members/:id
router.get("/members/:id", async (req, res) => {
  const parsed = GetMemberParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [member] = await db.select().from(membersTable).where(eq(membersTable.id, parsed.data.id));
  if (!member) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(formatMember(member));
});

// PATCH /members/:id
router.patch("/members/:id", async (req, res) => {
  const params = UpdateMemberParams.safeParse({ id: Number(req.params.id) });
  const body = UpdateMemberBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const [existing] = await db.select().from(membersTable).where(eq(membersTable.id, params.data.id));
  if (!existing) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const { dateOfBirth: rawDob, ...restBody } = body.data;
  const dobStr = rawDob instanceof Date ? rawDob.toISOString().split("T")[0] : rawDob ? String(rawDob) : undefined;
  const updates: Partial<typeof membersTable.$inferInsert> = { ...restBody, updatedAt: new Date() };
  if (dobStr) {
    updates.dateOfBirth = dobStr;
    const age = computeAge(dobStr);
    updates.wing = computeWing(age);
  }

  const [updated] = await db.update(membersTable).set(updates).where(eq(membersTable.id, params.data.id)).returning();

  // Log wing change
  if (updates.wing && updates.wing !== existing.wing) {
    await db.insert(memberHistoryTable).values({
      memberId: existing.id,
      eventType: "wing_change",
      description: `Wing changed from ${existing.wing} to ${updates.wing}`,
      previousValue: existing.wing,
      newValue: updates.wing,
    });
  } else {
    await db.insert(memberHistoryTable).values({
      memberId: existing.id,
      eventType: "updated",
      description: "Member record updated",
    });
  }

  res.json(formatMember(updated));
});

// DELETE /members/:id
router.delete("/members/:id", async (req, res) => {
  const parsed = DeleteMemberParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [existing] = await db.select().from(membersTable).where(eq(membersTable.id, parsed.data.id));
  if (!existing) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  await db.delete(membersTable).where(eq(membersTable.id, parsed.data.id));
  res.status(204).send();
});

// GET /members/:id/history
router.get("/members/:id/history", async (req, res) => {
  const parsed = GetMemberHistoryParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const history = await db
    .select()
    .from(memberHistoryTable)
    .where(eq(memberHistoryTable.memberId, parsed.data.id))
    .orderBy(desc(memberHistoryTable.createdAt));
  res.json(history);
});

export default router;

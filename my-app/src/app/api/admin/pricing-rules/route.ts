// my-app/src/app/api/admin/pricing-rules/route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/rbac";
import { PricingRule } from "@/models/PricingRule";
import { z } from "zod";

const pricingRuleSchema = z.object({
  name: z.string().min(1),
  origin: z.string().min(1),
  destination: z.string().min(1),
  weightMin: z.number().min(0),
  weightMax: z.number().min(0),
  baseRate: z.number().min(0),
  perKgRate: z.number().min(0),
  currency: z.string().default("USD"),
  active: z.boolean().default(true),
});

export async function GET(req: Request) {
  const payload = await getAuthFromRequest(req);
  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  try {
    const rules = await PricingRule.find({}).sort({ createdAt: -1 }).lean();
    
    return NextResponse.json({
      rules: rules.map(r => ({
        id: String(r._id),
        name: r.name,
        origin: r.origin,
        destination: r.destination,
        weightMin: r.weightMin,
        weightMax: r.weightMax,
        baseRate: r.baseRate,
        perKgRate: r.perKgRate,
        currency: r.currency,
        active: r.active,
      }))
    });
  } catch (error) {
    console.error("Error fetching pricing rules:", error);
    return NextResponse.json({ error: "Failed to fetch pricing rules" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const payload = await getAuthFromRequest(req);
  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  try {
    const body = await req.json();
    const validated = pricingRuleSchema.parse(body);

    // Validate weight range
    if (validated.weightMax <= validated.weightMin) {
      return NextResponse.json(
        { error: "weightMax must be greater than weightMin" },
        { status: 400 }
      );
    }

    const rule = await PricingRule.create(validated);

    return NextResponse.json({
      id: String(rule._id),
      ...validated
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating pricing rule:", error);
    return NextResponse.json({ error: "Failed to create pricing rule" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const payload = await getAuthFromRequest(req);
  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  try {
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const validated = pricingRuleSchema.partial().parse(data);

    const updated = await PricingRule.findByIdAndUpdate(
      id,
      { $set: validated },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, id: String(updated._id) });
  } catch (error) {
    console.error("Error updating pricing rule:", error);
    return NextResponse.json({ error: "Failed to update pricing rule" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const payload = await getAuthFromRequest(req);
  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const deleted = await PricingRule.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting pricing rule:", error);
    return NextResponse.json({ error: "Failed to delete pricing rule" }, { status: 500 });
  }
}
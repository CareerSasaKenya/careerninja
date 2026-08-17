/**
 * Verify the marker pill-placement algorithm (same logic as KenyaJobsMap)
 * against real DB counts — confirms no marker/pill collisions remain.
 */
import { createClient } from "@supabase/supabase-js";
import { resolveCountyName } from "../src/lib/counties";
import { KENYA_COUNTY_SHAPES } from "../src/data/kenyaCountyShapes";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://qxuvqrfqkdpfjfwkqatf.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4dXZxcmZxa2RwZmpmd2txYXRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjcxNTIsImV4cCI6MjA3NTAwMzE1Mn0.mAiL1p6YqlSaSFOIDW_G-3e_Mqck0cFqLl74_jyNpk8"
);

const MARKER_NUDGE: Record<string, [number, number]> = { Kiambu: [-9, -20] };

function markerRadius(count: number) {
  if (count <= 0) return 0;
  return 6 + Math.min(12, Math.log2(count + 1) * 1.5);
}
function pillWidth(count: number) {
  return count.toLocaleString().length * 8.2 + 18;
}

async function main() {
  const counts = new Map<string, number>();
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from("jobs")
      .select("job_location_county")
      .eq("status", "active")
      .range(from, from + 999);
    if (error) throw error;
    if (!data || data.length === 0) break;
    for (const row of data) {
      const name = resolveCountyName(row.job_location_county as string | null);
      if (!name) continue;
      counts.set(name, (counts.get(name) || 0) + 1);
    }
    if (data.length < 1000) break;
  }

  type M = { name: string; x: number; y: number; r: number; count: number };
  const markers: M[] = KENYA_COUNTY_SHAPES.filter((c) => (counts.get(c.name) ?? 0) > 0)
    .map((c) => {
      const n = MARKER_NUDGE[c.name];
      return {
        name: c.name,
        x: c.x + (n?.[0] ?? 0),
        y: c.y + (n?.[1] ?? 0),
        r: markerRadius(counts.get(c.name)!),
        count: counts.get(c.name)!,
      };
    })
    .sort((a, b) => b.count - a.count);

  // Circles as rects
  const rects = markers.map((m) => ({ x0: m.x - m.r, y0: m.y - m.r, x1: m.x + m.r, y1: m.y + m.r }));

  const report: string[] = [];
  for (let i = 0; i < markers.length; i++) {
    const m = markers[i];
    const pW = pillWidth(m.count);
    const right = { x0: m.x + m.r, y0: m.y - 11, x1: m.x + m.r + 8 + pW, y1: m.y + 11 };
    const left = { x0: m.x - m.r - 8 - pW, y0: m.y - 11, x1: m.x - m.r, y1: m.y + 11 };
    const collides = (r: typeof right) => rects.some((o, j) => j !== i && r.x0 < o.x1 && r.x1 > o.x0 && r.y0 < o.y1 && r.y1 > o.y0);
    const rC = collides(right);
    const lC = collides(left);
    const placement = rC && !lC ? "flip-left" : rC && lC ? "count-inside" : "right";
    report.push(`${m.name.padEnd(16)} n=${String(m.count).padStart(4)} r=${m.r.toFixed(1).padStart(5)}  pill=${placement}`);
  }
  console.log(report.join("\n"));

  // Any remaining circle-circle overlaps after nudge?
  console.log("\nCircle-circle pairs within 4 units of touching (r_a+r_b+4):");
  for (let i = 0; i < markers.length; i++) {
    for (let j = i + 1; j < markers.length; j++) {
      const a = markers[i];
      const b = markers[j];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < a.r + b.r + 4) {
        console.log(`  ${a.name}(${a.r.toFixed(1)}) <-> ${b.name}(${b.r.toFixed(1)}) dist=${d.toFixed(1)}`);
      }
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

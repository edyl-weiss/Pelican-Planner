import {
  type ActivityDay,
  type RunState,
  type GameDate,
  activityDaySchema,
} from "./state";
import { bundles, SEASONS } from "./data";
import { absoluteDay, bundleDone, needed, plotCrop } from "./planner";

const completed = (run: RunState) =>
  bundles.filter((b) => bundleDone(run, b)).map((b) => b.id);
export function dayEntry(run: RunState): ActivityDay {
  return (
    run.activity.days.find(
      (d) => absoluteDay(d.date) === absoluteDay(run.date),
    ) ?? {
      date: { ...run.date },
      closed: false,
      financialsRecorded: false,
      sales: [],
      otherIncome: 0,
      otherCosts: 0,
      seedCosts: 0,
      harvests: [],
      fish: null,
      friendship: null,
      buildings: [],
      startMine: run.mineFloor,
      endMine: run.mineFloor,
      startBundles: completed(run),
      endBundles: completed(run),
      startUnlocks: [...run.unlocks],
      endUnlocks: [...run.unlocks],
      tasks: 0,
      bundleFinds: [],
      note: "",
    }
  );
}
export function putDay(run: RunState, entry: ActivityDay): RunState {
  const value = activityDaySchema.parse(entry),
    day = absoluteDay(value.date);
  const others = run.activity.days.filter((d) => absoluteDay(d.date) !== day);
  if (others.length >= 1120)
    throw new Error(
      "Your scrapbook has 1,120 days. Download a backup before starting a fresh journal.",
    );
  return {
    ...run,
    activity: {
      ...run.activity,
      days: [...others, value].sort(
        (a, b) => absoluteDay(a.date) - absoluteDay(b.date),
      ),
    },
  };
}
// Only confirmed actions create activity. Wallet edits and imported snapshots are
// not sales. A harvested crop must change both its plot and its inventory.
export function captureActivity(before: RunState, after: RunState): RunState {
  if (
    before.activity !== after.activity ||
    absoluteDay(before.date) !== absoluteDay(after.date) ||
    before.name !== after.name
  )
    return after;
  let entry = dayEntry(before),
    changed = false;
  const harvests = entry.harvests.map((h) => ({ ...h }));
  for (const plot of before.plots) {
    const next = after.plots.find((p) => p.id === plot.id),
      crop = plotCrop(plot);
    const quantity = (r: RunState) =>
      r.inventory
        .filter((i) => i.name === plot.crop && i.quality === 0)
        .reduce((n, i) => n + i.quantity, 0);
    if (
      crop &&
      plot.nextHarvest <= absoluteDay(before.date) &&
      (!next || next.harvests > plot.harvests) &&
      quantity(after) > quantity(before)
    ) {
      const count = Math.min(
        plot.quantity * crop.yield,
        quantity(after) - quantity(before),
      );
      const row = harvests.find((h) => h.item === plot.crop);
      if (row) row.quantity += count;
      else harvests.push({ item: plot.crop, quantity: count });
      changed = true;
    }
  }
  const planted = after.plots.filter(
    (p) => !before.plots.some((old) => old.id === p.id),
  );
  const seedCosts =
    planted.length && after.gold < before.gold ? before.gold - after.gold : 0;
  const finds = after.inventory
    .filter(
      (i) =>
        i.quantity >
          before.inventory
            .filter((old) => old.name === i.name && old.quality === i.quality)
            .reduce((n, x) => n + x.quantity, 0) && needed(before, i.name),
    )
    .map((i) => i.name);
  if (
    seedCosts ||
    finds.length ||
    before.mineFloor !== after.mineFloor ||
    before.donated !== after.donated ||
    before.unlocks !== after.unlocks
  )
    changed = true;
  if (!changed) return after;
  entry = {
    ...entry,
    harvests,
    seedCosts: entry.seedCosts + seedCosts,
    endMine: after.mineFloor,
    endBundles: completed(after),
    endUnlocks: [...after.unlocks],
    bundleFinds: [...new Set([...entry.bundleFinds, ...finds])],
  };
  return putDay(after, entry);
}
export function closeActivityDay(
  run: RunState,
  details: ActivityDay,
): RunState {
  const current = dayEntry(run);
  // Auto-tracked values have one owner; forms only supply manual observations.
  return putDay(run, {
    ...current,
    financialsRecorded: details.financialsRecorded,
    sales: details.sales,
    otherIncome: details.otherIncome,
    otherCosts: details.otherCosts,
    fish: details.fish,
    friendship: details.friendship,
    buildings: details.buildings,
    note: details.note,
    closed: true,
    endMine: run.mineFloor,
    endBundles: completed(run),
    endUnlocks: [...run.unlocks],
    tasks: run.done.filter((id) => id.startsWith(absoluteDay(run.date) + ":"))
      .length,
  });
}
export const income = (day: ActivityDay) =>
  day.otherIncome + day.sales.reduce((n, s) => n + s.gold, 0);
export const costs = (day: ActivityDay) =>
  day.seedCosts + (day.financialsRecorded ? day.otherCosts : 0);
export const harvestCount = (day: ActivityDay) =>
  day.harvests.reduce((n, h) => n + h.quantity, 0);
export type RecordKind = "income" | "harvest" | "fish" | "mine";
export const recordValue = (day: ActivityDay, kind: RecordKind) =>
  kind === "income"
    ? day.financialsRecorded
      ? income(day)
      : 0
    : kind === "harvest"
      ? harvestCount(day)
      : kind === "fish"
        ? (day.fish ?? 0)
        : Math.max(0, day.endMine - day.startMine);
export function personalRecords(days: ActivityDay[]) {
  return (["income", "harvest", "fish", "mine"] as const).map((kind) => ({
    kind,
    day: days.reduce<ActivityDay | null>(
      (best, d) =>
        recordValue(d, kind) > (best ? recordValue(best, kind) : 0) ? d : best,
      null,
    ),
  }));
}
export function brokenRecords(before: RunState, after: RunState) {
  const prior = personalRecords(before.activity.days);
  return personalRecords(after.activity.days).filter(
    (record, i) =>
      record.day &&
      recordValue(record.day, record.kind) >
        (prior[i].day ? recordValue(prior[i].day!, record.kind) : 0),
  );
}
export function periodDays(run: RunState, date: GameDate, year = false) {
  return run.activity.days.filter(
    (d) =>
      d.closed &&
      d.date.year === date.year &&
      (year || d.date.season === date.season),
  );
}
export function recap(days: ActivityDay[]) {
  const financial = days.filter((d) => d.financialsRecorded),
    sales = new Map<string, number>();
  for (const day of financial)
    for (const sale of day.sales)
      sales.set(sale.item, (sales.get(sale.item) ?? 0) + sale.gold);
  const ranked = [...sales].sort((a, b) => b[1] - a[1]);
  const earned = financial.reduce((n, d) => n + income(d), 0);
  const spent = days.reduce((n, d) => n + costs(d), 0);
  const bestDay = financial.reduce<ActivityDay | null>(
    (best, d) => (!best || income(d) > income(best) ? d : best),
    null,
  );
  const biggestSale = financial
    .flatMap((d) => d.sales.map((s) => ({ ...s, date: d.date })))
    .sort((a, b) => b.gold - a.gold)[0];
  const seasons = SEASONS.map((season) => ({
    season,
    days: days.filter((d) => d.date.season === season),
  }))
    .filter((s) => s.days.length)
    .map((s) => ({
      ...s,
      profit: s.days.reduce(
        (n, d) => n + (d.financialsRecorded ? income(d) : 0) - costs(d),
        0,
      ),
      complete:
        s.days.length === 28 && s.days.every((d) => d.financialsRecorded),
    }));
  return {
    earned,
    spent,
    profit: earned - spent,
    financialDays: financial.length,
    days: days.length,
    topItem: ranked[0],
    biggestSale,
    bestDay,
    harvested: days.reduce((n, d) => n + harvestCount(d), 0),
    fish: days.some((d) => d.fish !== null)
      ? days.reduce((n, d) => n + (d.fish ?? 0), 0)
      : null,
    friendship: days.some((d) => d.friendship !== null)
      ? days.reduce((n, d) => n + (d.friendship ?? 0), 0)
      : null,
    buildings: days.flatMap((d) => d.buildings),
    mine: days.length ? Math.max(...days.map((d) => d.endMine)) : null,
    bundles: [
      ...new Set(
        days.flatMap((d) =>
          d.endBundles.filter((b) => !d.startBundles.includes(b)),
        ),
      ),
    ],
    milestones: [
      ...new Set(
        days.flatMap((d) =>
          d.endUnlocks.filter((u) => !d.startUnlocks.includes(u)),
        ),
      ),
    ],
    seasons,
  };
}

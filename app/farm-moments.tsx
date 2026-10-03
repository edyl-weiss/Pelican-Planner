"use client";
import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { ActivityDay, GameDate, RunState } from "@/lib/game/state";
import { bundles, SEASONS, festivalSprite } from "@/lib/game/data";
import {
  absoluteDay,
  seasonOpeningCrops,
  dateLabel,
  eventsOn,
  fromDay,
  gold,
  makePlan,
  nextDate,
  plotAlive,
  plotCrop,
} from "@/lib/game/planner";
import {
  costs,
  income,
  periodDays,
  personalRecords,
  recap,
  recordValue,
  type RecordKind,
} from "@/lib/game/activity";
import { useLocale } from "./locale-provider";
import { Sprite } from "./farm-ui";
import { CropTip } from "./item-tooltip";

function useWords() {
  const { locale, t } = useLocale();
  return { t, say: (en: string, zh: string) => (locale === "zh-CN" ? zh : en) };
}
export const recordNames: Record<RecordKind, [string, string]> = {
  income: ["Highest daily earnings", "单日最高收入"],
  harvest: ["Largest daily harvest", "单日最多收获"],
  fish: ["Most fish in a day", "单日最多钓鱼"],
  mine: ["Fastest daily mine progress", "单日矿井进度纪录"],
};

export function SeasonalDetails({ season }: { season: GameDate["season"] }) {
  return (
    <div
      className={"season-details season-" + season.toLowerCase()}
      aria-hidden="true"
    >
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <i
          key={i}
          style={{ left: 8 + i * 17 + "%", animationDelay: i * 0.4 + "s" }}
        />
      ))}
    </div>
  );
}
export function MorningReminder({ run }: { run: RunState }) {
  const { say, t } = useWords();
  const [dismissed, setDismissed] = useState(false);
  const events = eventsOn(run, run.date).filter(
    (e) =>
      e.type === "birthday" ||
      (e.type === "festival" &&
        run.festivals &&
        (!e.requires || run.unlocks.includes(e.requires))),
  );
  if (dismissed || !events.length) return null;
  return (
    <section
      className="morning-reminder"
      translate="no"
      aria-label={say("On the calendar today", "今天的日历")}
    >
      <div className="morning-events">
        {events.map((e) => (
          <div key={e.name}>
            <Sprite
              name={e.type === "birthday" ? e.name : festivalSprite(e.name)}
              size={36}
            />
            <p>
              <strong>{t(e.name)}</strong>
              <span className="small">
                {e.type === "birthday"
                  ? say(
                      "Birthday today. A little gift goes a long way.",
                      "今天过生日，一份小礼物很暖心。",
                    )
                  : say(
                      "On today. Check the festival’s entry time.",
                      "今天举办，请留意入场时间。",
                    )}
              </span>
            </p>
          </div>
        ))}
      </div>
      <button className="btn quiet compact" onClick={() => setDismissed(true)}>
        {say("Got it", "知道啦")}
      </button>
    </section>
  );
}
export function HarvestPreview({ run }: { run: RunState }) {
  const { say, t } = useWords();
  const day = absoluteDay(run.date);
  const plots = run.plots
    .filter((p) => p.nextHarvest > day && plotAlive(p, fromDay(p.nextHarvest)))
    .sort((a, b) => a.nextHarvest - b.nextHarvest)
    .slice(0, 5);
  if (!plots.length) return null;
  return (
    <section
      className="harvest-preview"
      translate="no"
      aria-label={say("Upcoming harvests", "即将收获")}
    >
      <h3>{say("Growing toward something good", "好收成正在路上")}</h3>
      <div className="harvest-preview-strip">
        {plots.map((p) => {
          const wait = Math.max(0, p.nextHarvest - day);
          return (
            <div className="harvest-preview-item" key={p.id}>
              <CropTip
                crop={plotCrop(p)}
                plot={p}
                date={run.date}
                trigger={<Sprite name={p.crop} size={36} />}
              />
              <div>
                <strong>
                  {p.quantity} × {p.customCrop ? p.crop : t(p.crop)}
                </strong>
                <span className="small muted">
                  {wait === 0
                    ? say("Ready now", "现在可收获")
                    : wait === 1
                      ? say("Tomorrow", "明天")
                      : say(`In ${wait} days`, `${wait}天后`)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <p className="small muted">
        {say(
          "Estimated from your recorded crops and watering.",
          "根据已记录的作物与浇水情况估算。",
        )}
      </p>
    </section>
  );
}
export function SeasonTransition({ run }: { run: RunState }) {
  const { say, t } = useWords();
  if (
    run.date.day !== 28 ||
    (run.date.year === 999 && run.date.season === "Winter")
  )
    return null;
  const next = nextDate(run.date),
    dying = run.plots.filter(
      (p) => plotAlive(p, run.date) && !plotAlive(p, next),
    );
  const firstCrops = seasonOpeningCrops(run);
  const festivals = Array.from({ length: 28 }, (_, i) =>
    eventsOn({ ...run, date: next }, { ...next, day: i + 1 }),
  )
    .flat()
    .filter(
      (e, i, all) =>
        e.type === "festival" &&
        run.festivals &&
        (!e.requires || run.unlocks.includes(e.requires)) &&
        all.findIndex((x) => x.name === e.name) === i,
    )
    .slice(0, 3);
  return (
    <section className="season-transition" translate="no">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{say("Before you sleep", "睡前看看")}</p>
          <h2>
            {say(
              `${t(next.season)} starts tomorrow`,
              `${t(next.season)}明天开始`,
            )}
          </h2>
        </div>
        <Sprite name="Calendar" size={44} />
      </div>
      <div className="transition-columns">
        <div>
          <h3>{say("One last look at your fields", "最后检查一下田地")}</h3>
          <p>
            {dying.length
              ? dying
                  .map(
                    (p) =>
                      `${p.quantity} × ${p.customCrop ? p.crop : t(p.crop)}`,
                  )
                  .join(" · ")
              : say(
                  "No tracked crops are due to die overnight.",
                  "已记录的作物中，没有会在今晚枯萎的。",
                )}
          </p>
          {dying.length > 0 && (
            <p className="small muted">
              {say(
                "These outdoor crops will die overnight. Gather any ready harvests tonight.",
                "这些室外作物将在夜间枯萎。今晚记得收获已成熟的作物。",
              )}
            </p>
          )}
        </div>
        <div>
          <h3>{say("A few seeds to consider", "可以考虑的种子")}</h3>
          <p>
            {firstCrops.length
              ? firstCrops
                  .map((c) => `${t(c.name)} (${gold(c.seed)})`)
                  .join(" · ")
              : say(
                  "Keep gold for upgrades, or check protected growing spaces.",
                  "可以为升级存些金币，或查看温室等种植空间。",
                )}
          </p>
          <p className="small muted">
            {say(
              "Based on base seasonal profit per tile and your available gold. Check shop access before buying.",
              "按每格季节基础利润与可用金币筛选，购买前请确认商店是否开放。",
            )}
          </p>
        </div>
        <div>
          <h3>{say("Upcoming dates", "值得期待的日子")}</h3>
          <p>
            {festivals.length
              ? festivals.map((e) => `${t(e.name)} · ${e.day}`).join(" / ")
              : say(
                  "No upcoming events.",
                  "日历上有些自由安排的时间。",
                )}
          </p>
        </div>
      </div>
    </section>
  );
}

export function DailySummary({
  entry,
  run,
  onClose,
}: {
  entry: ActivityDay;
  run: RunState;
  onClose: () => void;
}) {
  const { say } = useWords();
  const ready = run.plots
    .filter(
      (p) => p.nextHarvest <= absoluteDay(run.date) && plotAlive(p, run.date),
    )
    .reduce((n, p) => n + p.quantity, 0);
  return (
    <div className="daily-summary" role="status" translate="no">
      <Sprite name="Parsnip" size={30} />
      <p>
        <strong>{say("Yesterday, in a nutshell", "昨天的小结")}</strong>
        <span>
          {entry.financialsRecorded
            ? `${gold(income(entry) - costs(entry))} ${say("recorded profit", "已记录利润")}`
            : say("Income not recorded", "收入未记录")}{" "}
          · {entry.tasks} {say("tasks completed", "项任务完成")} ·{" "}
          {entry.bundleFinds.length}{" "}
          {say("bundle item types found", "种收集包物品入库")} · {ready}{" "}
          {say("crop tiles ready today", "块作物今天可收获")}
        </span>
      </p>
      <button className="btn quiet compact" onClick={onClose}>
        {say("Dismiss", "关闭")}
      </button>
    </div>
  );
}

export function RecordToast({
  records,
  onClose,
}: {
  records: ReturnType<typeof personalRecords>;
  onClose: () => void;
}) {
  const { say, t } = useWords();
  return (
    <aside className="record-toast" role="status" translate="no">
      <Sprite name="Sunflower" size={40} />
      <div>
        <strong>
          {say("A new page in your record book!", "纪录簿又添新一页！")}
        </strong>
        {records.map(
          ({ kind, day }) =>
            day && (
              <p key={kind}>
                {say(...recordNames[kind])} ·{" "}
                {kind === "income"
                  ? gold(recordValue(day, kind))
                  : recordValue(day, kind)}{" "}
                <span className="small muted">{t(dateLabel(day.date))}</span>
              </p>
            ),
        )}
      </div>
      <button
        className="btn quiet compact"
        aria-label={say("Dismiss record", "关闭纪录提示")}
        onClick={onClose}
      >
        ×
      </button>
    </aside>
  );
}

export type RecapPeriod = { date: GameDate; year: boolean };
export function Scrapbook({
  run,
  period,
  onClose,
  onPeriod,
}: {
  run: RunState;
  period: RecapPeriod;
  onClose: () => void;
  onPeriod: (period: RecapPeriod) => void;
}) {
  const { say, t } = useWords();
  const days = periodDays(run, period.date, period.year),
    report = recap(days),
    expected = period.year ? 112 : 28;
  const choices = useMemo(
    () =>
      [
        ...new Set(
          run.activity.days
            .filter((d) => d.closed)
            .map((d) => `${d.date.year}:${d.date.season}`),
        ),
      ].reverse(),
    [run.activity.days],
  );
  const next = nextDate({ ...period.date, day: 28 }),
    preview = makePlan({
      ...run,
      date: next,
      weather: "Unknown",
      luck: "Unknown",
      tomorrow: "Unknown",
    })
      .filter((task) => task.category !== "Personal")
      .slice(0, 3);
  const complete =
    days.length === expected && report.financialDays === expected;
  const bestSeason = report.seasons
    .filter((s) => s.complete)
    .sort((a, b) => b.profit - a.profit)[0];
  const metric = (label: string, value: string | number | null) => (
    <div>
      <dt>{label}</dt>
      <dd>{value ?? say("Not recorded", "未记录")}</dd>
    </div>
  );
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="farm-dialog scrapbook-dialog" translate="no">
        <p className="eyebrow">
          {run.name} · {say("A page worth keeping", "值得珍藏的一页")}
        </p>
        <DialogTitle>
          {period.year
            ? say(
                `Year ${period.date.year} in Review`,
                `第${period.date.year}年回顾`,
              )
            : say(
                `${t(period.date.season)}, Year ${period.date.year}`,
                `第${period.date.year}年${t(period.date.season)}回顾`,
              )}
        </DialogTitle>
        <DialogDescription>
          {say(
            "A few memories from the days you recorded. In Krobus we trust.",
            "把记录过的日子，留成几段回忆。我们相信科罗布斯。",
          )}
        </DialogDescription>
        <div className="scrapbook-navigation">
          <label className="field">
            {say("Turn to a season", "翻到某个季节")}
            <select
              value={`${period.date.year}:${period.date.season}`}
              onChange={(e) => {
                const [year, season] = e.target.value.split(":");
                onPeriod({
                  date: {
                    year: Number(year),
                    season: season as GameDate["season"],
                    day: 28,
                  },
                  year: false,
                });
              }}
            >
              {!choices.includes(
                `${period.date.year}:${period.date.season}`,
              ) && (
                <option value={`${period.date.year}:${period.date.season}`}>
                  {t(period.date.season)} · {period.date.year}
                </option>
              )}
              {choices.map((c) => (
                <option key={c} value={c}>
                  {t(c.split(":")[1])} · {c.split(":")[0]}
                </option>
              ))}
            </select>
          </label>
          <div className="button-group">
            <button
              className={"btn compact " + (!period.year ? "selected" : "")}
              onClick={() => onPeriod({ ...period, year: false })}
            >
              {say("Season", "季节")}
            </button>
            <button
              className={"btn compact " + (period.year ? "selected" : "")}
              onClick={() => onPeriod({ ...period, year: true })}
            >
              {say("Year in Review", "年度回顾")}
            </button>
          </div>
        </div>
        <div className="scrapbook-profit">
          <Sprite name={period.year ? "Pumpkin" : "Sunflower"} size={56} />
          <div>
            <p>{say("Recorded profit", "已记录利润")}</p>
            <strong>
              {report.financialDays
                ? gold(report.profit)
                : say("Waiting for your first entry", "等你记下第一笔")}
            </strong>
          </div>
        </div>
        <p className="coverage-note">
          {say(
            `${report.financialDays} of ${expected} days have confirmed finances. ${report.days} days have activity notes.`,
            `${expected}天中，有${report.financialDays}天核对了收支，${report.days}天记录了活动。`,
          )}{" "}
          {!complete &&
            say(
              "This is a partial recap, not a full-period total.",
              "这是部分回顾，并非整个期间的总计。",
            )}{" "}
          {say(
            "Profit = recorded income minus recorded costs. Unsold harvests are not income.",
            "利润＝已记录收入－已记录支出。未出售的收获不算收入。",
          )}
        </p>
        <dl className="recap-metrics">
          {metric(
            say("Gold earned", "赚取金币"),
            report.financialDays ? gold(report.earned) : null,
          )}
          {metric(
            say("Gold spent", "花费金币"),
            report.financialDays || report.spent ? gold(report.spent) : null,
          )}
          {metric(
            say("Best-selling item (by revenue)", "收入最高的物品"),
            report.topItem
              ? `${t(report.topItem[0])} · ${gold(report.topItem[1])}`
              : null,
          )}
          {metric(
            say("Bundles completed", "完成的收集包"),
            report.bundles.length,
          )}
          {metric(say("Deepest mine floor", "最深矿井层数"), report.mine)}
          {metric(
            say("Friendship hearts gained", "增加的好感度心数"),
            report.friendship,
          )}
          {metric(say("Crops harvested", "收获作物数量"), report.harvested)}
          {metric(say("Fish caught", "钓鱼数量"), report.fish)}
          {period.year &&
            metric(
              say("Biggest recorded sale batch", "最大一笔交易"),
              report.biggestSale
                ? `${t(report.biggestSale.item)} · ${gold(report.biggestSale.gold)}`
                : null,
            )}
          {period.year &&
            metric(
              say(
                "Most profitable fully recorded season",
                "完整记录中利润最高的季节",
              ),
              bestSeason
                ? `${t(bestSeason.season)} · ${gold(bestSeason.profit)}`
                : null,
            )}
        </dl>
        {report.bestDay && (
          <section className="scrapbook-memory">
            <h3>{say("Your best income day", "收入最棒的一天")}</h3>
            <p>
              {t(dateLabel(report.bestDay.date))} ·{" "}
              {gold(income(report.bestDay))}
            </p>
            {report.bestDay.note && (
              <blockquote>{report.bestDay.note}</blockquote>
            )}
          </section>
        )}
        <section className="scrapbook-memory">
          <h3>{say("What grew from your choices?", "你的选择带来了什么？")}</h3>
          {report.topItem && report.earned > 0 ? (
            <p>
              {say(
                `${t(report.topItem[0])} brought in ${Math.round((report.topItem[1] / report.earned) * 100)}% of your recorded income.`,
                `${t(report.topItem[0])}贡献了已记录收入的${Math.round((report.topItem[1] / report.earned) * 100)}%。`,
              )}
            </p>
          ) : (
            <p>
              {say(
                "Itemized sales will show which crops and activities contributed to your income.",
                "逐项填写交易后，这里会展示哪些物品贡献了收入。",
              )}
            </p>
          )}
          {report.bundles.length > 0 && (
            <p>
              {say("You finished", "你完成了")}：
              {report.bundles
                .map((id) => t(bundles.find((b) => b.id === id)?.name ?? id))
                .join(" · ")}
            </p>
          )}
          {report.milestones.length > 0 && (
            <p>
              {say("New doors opened", "新解锁")}：
              {report.milestones.map(t).join(" · ")}
            </p>
          )}
          <p className="small muted">
            {say(
              "These are recorded contributions. The journal does not claim how much earlier an alternative plan would have unlocked something.",
              "这里展示已记录的贡献，不会推测其他计划能提前多少天解锁内容。",
            )}
          </p>
        </section>
        {period.year && (
          <section className="scrapbook-memory">
            <h3>{say("Built along the way", "一路建起的新家园")}</h3>
            <p>
              {report.buildings.length
                ? report.buildings.join(" · ")
                : say("No new buildings recorded yet.", "尚未记录新增建筑。")}
            </p>
            <h3 className="gap-top">
              {say("Seasons", "四个小篇章")}
            </h3>
            <div className="season-chapters">
              {SEASONS.map((season) => {
                const s = report.seasons.find((x) => x.season === season);
                return (
                  <button
                    className="btn"
                    key={season}
                    onClick={() =>
                      onPeriod({
                        date: { ...period.date, season },
                        year: false,
                      })
                    }
                  >
                    {t(season)}
                    <small>
                      {s
                        ? `${gold(s.profit)} · ${s.complete ? say("complete", "完整") : say("partial", "部分")}`
                        : say("No entries", "暂无记录")}
                    </small>
                  </button>
                );
              })}
            </div>
          </section>
        )}
        {(!period.year || period.date.season === "Winter") &&
          next.year <= 999 && (
            <section className="scrapbook-memory">
              <h3>{say("A peek at next season", "下个季节先看一眼")}</h3>
              <p className="small muted">
                {say(
                  "Suggestions use your current farm settings, even when viewing an older page.",
                  "建议采用你目前的农场设置，查看旧页面时也是如此。",
                )}
              </p>
              <ul>
                {preview.map((task) => (
                  <li key={task.id}>{t(task.name)}</li>
                ))}
              </ul>
            </section>
          )}
        <details className="scrapbook-memory">
          <summary>{say("Personal record book", "个人纪录簿")}</summary>
          {personalRecords(run.activity.days).map(({ kind, day }) => (
            <p key={kind}>
              {say(...recordNames[kind])}：
              {day
                ? `${kind === "income" ? gold(recordValue(day, kind)) : recordValue(day, kind)} · ${t(dateLabel(day.date))}`
                : say("Not recorded", "未记录")}
            </p>
          ))}
        </details>
        <details className="scrapbook-memory">
          <summary>{say("Notes", "那些小小的回忆")}</summary>
          {days.filter((d) => d.note).length ? (
            days
              .filter((d) => d.note)
              .map((d) => (
                <p key={absoluteDay(d.date)}>
                  <strong>{t(dateLabel(d.date))}</strong> · {d.note}
                </p>
              ))
          ) : (
            <p>
              {say(
                "Add a memory when you turn the page to a new day.",
                "翻到新一天时，记下一段小回忆吧。",
              )}
            </p>
          )}
        </details>
        <button className="btn primary" onClick={onClose}>
          {say("Back to the farm", "回到农场")}
        </button>
      </DialogContent>
    </Dialog>
  );
}

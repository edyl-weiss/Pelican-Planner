"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { ActivityDay, GameDate, RunState } from "@/lib/game/state";
import { festivalSprite } from "@/lib/game/data";
import {
  absoluteDay,
  seasonOpeningCrops,
  dateLabel,
  eventsOn,
  fromDay,
  gold,
  nextDate,
  plotAlive,
  plotCrop,
} from "@/lib/game/planner";
import {
  costs,
  income,
  personalRecords,
  recordValue,
} from "@/lib/game/activity";
import { useLocale } from "./locale-provider";
import { Sprite } from "./farm-ui";
import { CropTip } from "./item-tooltip";

function useWords() {
  const { locale, t } = useLocale();
  return { t, say: (en: string, zh: string) => (locale === "zh-CN" ? zh : en) };
}
import { recordNames } from "./farm-records";
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
      (e.type === "birthday" &&
        (!e.requires || run.unlocks.includes(e.requires))) ||
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
                      "It’s their birthday! A favorite gift goes a long way.",
                      "今天过生日，一份小礼物很暖心。",
                    )
                  : say(
                      "The festival’s today! Check the entry time before you head over.",
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
      <h3>{say("Next harvests", "好收成正在路上")}</h3>
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
          <h3>{say("Crops that won’t survive the season change", "最后检查一下田地")}</h3>
          <p>
            {dying.length
              ? dying
                  .map(
                    (p) =>
                      `${p.quantity} × ${p.customCrop ? p.crop : t(p.crop)}`,
                  )
                  .join(" · ")
              : say(
                  "Your tracked crops should make it into the new season!",
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
          <h3>{say("Seeds worth checking", "可以考虑的种子")}</h3>
          <p>
            {firstCrops.length
              ? firstCrops
                  .map((c) => `${t(c.name)} (${gold(c.seed)})`)
                  .join(" · ")
              : say(
                  "Saving for an upgrade? Keep your gold, or check whether you have space in the Greenhouse!",
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
        <strong>{say("Yesterday’s recap", "昨天的小结")}</strong>
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
          {say("New personal record!", "纪录簿又添新一页！")}
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

export { Scrapbook } from './farm-scrapbook';
export type { RecapPeriod } from './farm-scrapbook';

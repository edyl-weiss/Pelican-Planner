
"use client";
import {useMemo} from 'react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import type {GameDate,RunState} from '@/lib/game/state';
import {bundles,SEASONS} from '@/lib/game/data';
import {absoluteDay,dateLabel,gold,makePlan,nextDate} from '@/lib/game/planner';
import {costs,income,periodDays,personalRecords,recap,recordValue} from '@/lib/game/activity';
import {useLocale} from './locale-provider';
import {Sprite} from './farm-ui';
import {recordNames} from './farm-records';

function useWords(){const {locale,t}=useLocale();return {t,say:(en:string,zh:string)=>locale==='zh-CN'?zh:en};}

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
          {run.name} · {say("Farm scrapbook", "值得珍藏的一页")}
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
                : say("No recorded sales yet", "等你记下第一笔")}
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
            <h3>{say("Best recorded income day", "收入最棒的一天")}</h3>
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
          <h3>{say("Where the gold came from", "你的选择带来了什么？")}</h3>
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
              {say("Unlocked", "新解锁")}：
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
            <h3>{say("Buildings added", "一路建起的新家园")}</h3>
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
              <h3>{say("Next season", "下个季节先看一眼")}</h3>
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
          <summary>{say("Personal records", "个人纪录簿")}</summary>
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
          <summary>{say("Farm notes", "那些小小的回忆")}</summary>
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

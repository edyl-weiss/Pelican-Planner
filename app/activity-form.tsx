"use client";
import type { ActivityDay } from "@/lib/game/state";
import { costs, harvestCount } from "@/lib/game/activity";
import { gold } from "@/lib/game/planner";
import {GoldAmount} from './farm-ui';
import { useLocale } from "./locale-provider";

export default function ActivityForm({
  value,
  onChange,
}: {
  value: ActivityDay;
  onChange: (entry: ActivityDay) => void;
}) {
  const { locale, t } = useLocale();
  const say = (en: string, zh: string) => (locale === "zh-CN" ? zh : en);
  const number = (
    label: string,
    key: "otherIncome" | "otherCosts" | "fish" | "friendship",
    optional = false,
  ) => (
    <label className="field">
      {label}
      <input
        type="number"
        min="0"
        max="999999999"
        step="1"
        value={value[key] ?? ""}
        placeholder={optional ? say("Not recorded", "未记录") : undefined}
        onChange={(e) => {
          const n =
            e.target.value === "" && optional ? null : Number(e.target.value);
          if (
            n === null ||
            (Number.isSafeInteger(n) && n >= 0 && n <= 999999999)
          )
            onChange({ ...value, [key]: n });
        }}
      />
    </label>
  );
  return (
    <details className="activity-form" open={undefined}>
      <summary>
        {say("Before you turn the page… (optional)", "翻页前记一笔……（可选）")}
      </summary>
      <p className="small muted gap-top">
        {say(
          "Record the day you’re finishing. Harvests, seed purchases and progress recorded in the planner are included automatically. These notes never change your wallet or inventory.",
          "记录即将结束的一天。在规划器里记录的收获、种子支出与进度会自动计入。这些笔记不会改变金币或物品栏。",
        )}
      </p>
      <p className="small">
        {say("Already recorded", "已记录")}：{harvestCount(value)}{" "}
        {say("crops harvested", "个作物收获")} · <GoldAmount value={value.seedCosts}/>{" "}
        {say("seed costs", "种子支出")}
      </p>
      <label className="check-label gap-top">
        <input
          type="checkbox"
          checked={value.financialsRecorded}
          onChange={(e) =>
            onChange({ ...value, financialsRecorded: e.target.checked })
          }
        />
        {say(
          "I’ve checked all income and costs for this day",
          "我已核对当天的全部收入与支出",
        )}
      </label>
      <p className="small muted">
        {say(
          "Unchecked days remain unknown, not zero-income days. Add sales after checking the shipping screen or shop totals.",
          "未勾选的日期会显示为未记录，不会当作零收入。请核对出货画面或商店交易后填写。",
        )}
      </p>
      {value.financialsRecorded && (
        <div className="activity-finances">
          <h3>{say("Sales", "售出记录")}</h3>
          {value.sales.map((sale, i) => (
            <div className="sale-row" key={i}>
              <label className="field">
                {say("Item / sale batch", "物品／交易批次")}
                <input
                  maxLength={80}
                  value={sale.item}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      sales: value.sales.map((s, j) =>
                        j === i ? { ...s, item: e.target.value } : s,
                      ),
                    })
                  }
                />
              </label>
              <label className="field">
                {say("Total gold", "总金币")}
                <input
                  type="number"
                  min="0"
                  max="999999999"
                  step="1"
                  value={sale.gold}
                  onChange={(e) => {
                    const gold = Number(e.target.value);
                    if (
                      Number.isSafeInteger(gold) &&
                      gold >= 0 &&
                      gold <= 999999999
                    )
                      onChange({
                        ...value,
                        sales: value.sales.map((s, j) =>
                          j === i ? { ...s, gold } : s,
                        ),
                      });
                  }}
                />
              </label>
              <button
                type="button"
                className="btn quiet compact"
                aria-label={say("Remove sale", "删除交易")}
                onClick={() =>
                  onChange({
                    ...value,
                    sales: value.sales.filter((_, j) => j !== i),
                  })
                }
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn compact"
            disabled={value.sales.length >= 40}
            onClick={() =>
              onChange({
                ...value,
                sales: [...value.sales, { item: "", gold: 0 }],
              })
            }
          >
            {say("Add a sale", "添加交易")}
          </button>
          <div className="form-grid gap-top">
            {number(
              say("Other income (quests, etc.)", "其他收入（任务等）"),
              "otherIncome",
            )}
            {number(
              say(
                "Other costs (exclude seeds above)",
                "其他支出（不含上方种子）",
              ),
              "otherCosts",
            )}
          </div>
          <p className="small muted">
            {say("Total recorded costs", "已记录支出总额")}：
            <GoldAmount value={costs(value)}/>
          </p>
        </div>
      )}
      <div className="form-grid gap-top">
        {number(say("Fish caught", "钓到的鱼"), "fish", true)}
        {number(
          say("Friendship hearts gained", "增加的好感度心数"),
          "friendship",
          true,
        )}
      </div>
      <label className="field gap-top">
        {say(
          "Buildings added (one per line, up to 20)",
          "新增建筑（每行一个，最多20个）",
        )}
        <textarea
          rows={2}
          maxLength={1600}
          value={value.buildings.join("\n")}
          onChange={(e) =>
            onChange({
              ...value,
              buildings: e.target.value.split("\n").slice(0, 20),
            })
          }
        />
      </label>
      <label className="field gap-top">
        {say("Today's note", "今天的小记忆")}
        <input
          maxLength={160}
          value={value.note}
          placeholder={say("Strawberry harvest, at last!", "终于收获草莓啦！")}
          onChange={(e) => onChange({ ...value, note: e.target.value })}
        />
      </label>
      <p className="small muted">
        {t("Pelican Planner")} ·{" "}
        {say(
          "Your scrapbook will keep these notes for you!",
          "你可以在剪贴簿中重新查看这些记录。",
        )}
      </p>
    </details>
  );
}

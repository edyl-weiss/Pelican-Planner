'use client';
import {useState} from 'react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {useLocale} from './locale-provider';
import {InfoTip} from './item-tooltip';
import {WEATHER,type RunState,type ActivityDay} from '@/lib/game/state';
import {dateLabel,nextDate,rainy} from '@/lib/game/planner';
import ActivityForm from './activity-form';
import {dayEntry} from '@/lib/game/activity';
const fortunes=[
 ['Very good','★','Very happy','非常开心'],
 ['Good','◆','In good humor','心情很好'],
 ['Neutral','●','Neutral','心情一般'],
 ['Bad','☾','Somewhat annoyed / mildly perturbed','有些不悦'],
 ['Very bad','☠','Very displeased','非常不满'],
 ['Unknown','?','I haven’t checked','还没查看'],
] as const;
const icons:Record<string,string>={Sunny:'☀',Windy:'≋',Rain:'☂',Storm:'ϟ',Snow:'❄','Green Rain':'☘'};
export default function DayStartDialog({run,onCancel,onStart}:{run:RunState;onCancel:()=>void;onStart:(weather:RunState['weather'],luck:RunState['luck'],activity:ActivityDay)=>void}){
 const {locale,t}=useLocale();const zh=locale==='zh-CN';const say=(en:string,cn:string)=>zh?cn:en;
 const [activity,setActivity]=useState(()=>dayEntry(run));
 const [weather,setWeather]=useState<RunState['weather']>(run.tomorrow),[luck,setLuck]=useState<RunState['luck']>('Unknown');
 if(run.plannerMode==='simple')return <Dialog open onOpenChange={open=>{if(!open)onCancel()}}><DialogContent className="farm-dialog day-start-dialog simple-day-start" translate="no"><p className="eyebrow">{t(dateLabel(nextDate(run.date)))}</p><DialogTitle>{say('Ready for the next day?','准备好进入下一天了吗？')}</DialogTitle><DialogDescription>{say('Simple Mode will move the calendar forward and refresh seasonal suggestions. You do not need to enter weather, luck, sales or other daily stats.','简易模式会推进日历并刷新季节建议，无需填写天气、运势、收入或其他每日数据。')}</DialogDescription><div className="simple-next-day-note"><span aria-hidden="true">🌱</span><div><strong>{say('The planner will keep it light','计划会保持简洁')}</strong><p className="small muted">{say('You can add weather or detailed progress later by switching to Full Mode.','如需记录天气或更详细的进度，可随时切换到完整模式。')}</p></div></div><div className="setup-actions"><button type="button" className="btn" onClick={onCancel}>{say('Stay on this day','留在当前日期')}</button><span/><button type="button" className="btn primary" onClick={()=>onStart('Unknown','Unknown',activity)}>{say('Start next day','开始下一天')}</button></div></DialogContent></Dialog>;
 return <Dialog open onOpenChange={open=>{if(!open)onCancel()}}><DialogContent className="farm-dialog day-start-dialog" translate="no"><p className="eyebrow">{t(dateLabel(nextDate(run.date)))}</p><DialogTitle>{say('A new day on the farm','农场新的一天')}</DialogTitle><DialogDescription>{say('Check your game, then set today’s conditions. Your activities will adjust when you start the day.','查看游戏中的天气与运势，开始新一天后，活动建议会随之调整。')}</DialogDescription>
 <ActivityForm value={activity} onChange={setActivity}/><fieldset className="day-check-field"><legend>{say('What’s the weather today?','今天天气如何？')}</legend><div className="weather-choices">{WEATHER.filter(w=>w!=='Unknown').map(w=><button type="button" className={'day-choice '+(weather===w?'chosen':'')} aria-pressed={weather===w} key={w} onClick={()=>setWeather(w)}><span aria-hidden="true">{icons[w]}</span>{t(w)}</button>)}</div>{run.tomorrow!=='Unknown'&&<p className="small muted">{say('Prefilled from yesterday’s forecast. Confirm what you see outside.','已根据昨天的预报预选，请核对实际天气。')}</p>}</fieldset>
 <fieldset className="day-check-field"><legend>{say('What did the Fortune Teller say?','占卜频道怎么说？')} <InfoTip label="About daily luck" text="Check TV → Fortune Teller for today’s luck. Weather and daily luck are separate. Luck affects chances such as finding ladders from rocks; it does not guarantee a successful trip. Leave it unchecked if the TV is unavailable." chinese="在电视的占卜频道查看今日运势。天气与每日运气相互独立。运气影响砸石头发现梯子的概率等，但不保证探险成功。电视无法使用时，可选择还没查看。"/></legend><div className="fortune-choices">{fortunes.map(([value,icon,en,cn])=><button type="button" key={value} className={'day-choice fortune-choice '+(luck===value?'chosen':'')} aria-pressed={luck===value} onClick={()=>setLuck(value)}><span aria-hidden="true">{icon}</span><span>{zh?cn:en}<small>{value==='Unknown'?say('No luck assumption','不假设运气'):t(value)}</small></span></button>)}</div></fieldset>
 <div className="day-plan-hint" role="status">{weather==='Unknown'?say('Choose the weather to start the day.','请选择天气后开始新一天。'):weather==='Green Rain'?say('A special gathering day. The TV may be unavailable; leaving luck unchecked is fine.','适合收集资源的特殊天气。电视可能无法使用，可以不填写运势。'):say(rainy(weather)?'Rain waters outdoor farm crops and opens rainy-day fishing opportunities.':'Check crops that need watering. Fishing suggestions match today’s conditions.',rainy(weather)?'雨水会浇灌室外农作物，也会带来雨天鱼类的捕捉机会。':'检查需要浇水的作物。钓鱼建议会与今天天气匹配。')} {['Good','Very good'].includes(luck)?say('Good luck moves mine exploration up the plan.','好运会提高矿井探索的优先级。'):['Bad','Very bad'].includes(luck)?say('On unlucky days, routine chores and forage take priority over optional mining.','运气较差时，日常事务和采集优先于可延后的挖矿。'):''}</div>
 <div className="setup-actions"><button type="button" className="btn" onClick={onCancel}>{say('Stay on this day','留在当前日期')}</button><button type="button" className="btn primary" disabled={weather==='Unknown'||(activity.financialsRecorded&&activity.sales.some(s=>!s.item.trim()))||activity.buildings.some(b=>b.trim().length>80)} onClick={()=>onStart(weather,luck,{...activity,buildings:activity.buildings.map(b=>b.trim()).filter(Boolean),sales:activity.sales.filter(s=>s.item.trim())})}>{say('Start day & update plan','开始新一天并更新计划')}</button></div>
 </DialogContent></Dialog>;
}

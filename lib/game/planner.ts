import {bundles,crops,events,fish,SEASONS,type Crop,type Bundle,type CalendarEvent} from './data';
import {runSchema,type RunState,type GameDate,type Plot} from './state';
export const absoluteDay=(d:GameDate)=>(d.year-1)*112+SEASONS.indexOf(d.season)*28+d.day;
export function fromDay(n:number):GameDate{const t=Math.max(1,n)-1;return {year:Math.floor(t/112)+1,season:SEASONS[Math.floor(t%112/28)],day:t%28+1}}
export const nextDate=(date:GameDate,delta=1)=>fromDay(absoluteDay(date)+delta);
export const rainy=(weather:RunState['weather'])=>['Rain','Storm','Green Rain'].includes(weather);
export function startNextDay(run:RunState,weather:RunState['weather'],luck:RunState['luck']):RunState{
 if(weather==='Unknown')throw new Error('Choose today’s weather before starting the day.');
 return runSchema.parse({...run,date:nextDate(run.date),weather,luck,tomorrow:'Unknown'});
}
export function startNextDaySimple(run:RunState):RunState{
 return runSchema.parse({...run,date:nextDate(run.date),weather:'Unknown',luck:'Unknown',tomorrow:'Unknown'});
}
export const dateLabel=(d:GameDate)=>`${d.season} ${d.day}, Year ${d.year}`;
export const gold=(n:number)=>`${Math.round(n).toLocaleString('en-US')}g`;
export const slotKey=(b:Bundle,i:number)=>`${b.id}:${i}`;
export const bundleCount=(run:RunState,b:Bundle)=>b.items.filter((_,i)=>run.donated.includes(slotKey(b,i))).length;
export const bundleDone=(run:RunState,b:Bundle)=>bundleCount(run,b)>=b.required;
export const needed=(run:RunState,name:string)=>bundles.some(b=>!bundleDone(run,b)&&b.items.some((x,i)=>x.name===name&&!run.donated.includes(slotKey(b,i))));
export const owned=(run:RunState,name:string,quality=0)=>run.inventory.filter(i=>i.name===name&&i.quality>=quality).reduce((a,b)=>a+b.quantity,0);
export const available=(run:RunState,resource:string)=>Math.max(0,(resource==='Gold'?run.gold:owned(run,resource))-run.reservations.filter(r=>r.resource===resource).reduce((a,b)=>a+b.quantity,0)-(resource==='Gold'?run.reserve:0));
export function cropEconomics(c:Crop,date:GameDate,quantity=1,tiller=false){
 const daysRemaining=28-date.day;
 const harvests=!c.seasons.includes(date.season)||daysRemaining<c.days?0:c.regrow?1+Math.floor((daysRemaining-c.days)/c.regrow):Math.floor(daysRemaining/c.days);
 const seedCount=c.regrow?Number(harvests>0):harvests;
 const revenue=harvests*c.yield*Math.floor(c.sell*(tiller?1.1:1))*quantity;
 const cost=seedCount*c.seed*quantity;
 return {harvests,firstHarvest:date.day+c.days,cost,revenue,profit:revenue-cost,profitPerDay:daysRemaining?(revenue-cost)/daysRemaining:0,roi:cost?(revenue-cost)/cost:0};
}
// Compare new outdoor plantings only in currently free tiles. Future crop sales
// remain a forecast and never increase the spendable seed budget.
export function plantingCapacity(run:RunState,totalTiles:number){
 const occupied=run.plots.filter(p=>(!p.location||p.location==='Farm')&&plotAlive(p,run.date)).reduce((n,p)=>n+p.quantity,0);
 return {occupied,free:Math.max(0,totalTiles-occupied)};
}
export function cropAvailableToBuy(run:RunState,c:Crop,date=run.date){
 if(c.buyable===false||!c.seasons.includes(date.season))return false;
 if(c.name==='Strawberry')return date.season==='Spring'&&date.day===13;
 if(['Rhubarb','Starfruit','Beet'].includes(c.name)&&!run.unlocks.includes('Bus'))return false;
 if(['Garlic','Red Cabbage','Artichoke'].includes(c.name)&&date.year<2)return false;
 return true;
}
export function plantingOptions(run:RunState,totalTiles:number){
 const {free}=plantingCapacity(run,totalTiles);
 return crops.filter(c=>cropAvailableToBuy(run,c)).map(c=>{
  const quantity=Math.min(free,Math.floor(available(run,'Gold')/c.seed));
  return {crop:c,quantity,result:cropEconomics(c,run.date,quantity,run.tiller)};
 }).sort((a,b)=>b.result.profit-a.result.profit);
}
// A small first-day shopping shortlist, respecting ordinary seed-shop access.
export function seasonOpeningCrops(run:RunState){
 const date=nextDate({...run.date,day:28});
 return crops.filter(c=>cropAvailableToBuy(run,c,date)&&c.seed<=available(run,'Gold')&&c.name!=='Strawberry')
 .sort((a,b)=>cropEconomics(b,date,1,run.tiller).profit-cropEconomics(a,date,1,run.tiller).profit).slice(0,2);
}
export const eventsOn=(run:RunState,date:GameDate):CalendarEvent[]=>events.filter(e=>e.season===date.season&&e.day<=date.day&&(e.end??e.day)>=date.day&&(e.minYear??1)<=date.year&&(!e.requires||run.unlocks.includes(e.requires)||run.spoilers==='Full'));
export function eligibleFish(run:RunState){return fish.filter(f=>f.seasons.includes(run.date.season)&&(f.weather==='Any'||(f.weather==='Rain'&&rainy(run.weather))||(f.weather==='Sun'&&['Sunny','Windy','Snow'].includes(run.weather))))}
export const clock=(hour:number)=>hour===24?'12am':hour===26?'2am':hour===12?'12pm':hour>12?`${hour-12}pm`:`${hour}am`;
export function lastPlantDay(c:Crop,season:GameDate['season']){return c.seasons.includes(season)?28-c.days:0}
export function plotCrop(p:Plot):Crop|undefined{return p.customCrop?{name:p.crop,days:0,seed:0,...p.customCrop}:crops.find(c=>c.name===p.crop)}
export function plotAlive(p:Plot,date:GameDate):boolean{const c=plotCrop(p);if(!c||absoluteDay(date)<absoluteDay(p.planted))return false;if(p.location&&p.location!=='Farm')return true;for(let day=absoluteDay(p.planted);day<=absoluteDay(date);){const d=fromDay(day);if(!c.seasons.includes(d.season))return false;day+=29-d.day;}return c.seasons.includes(date.season)}
export interface Task{id:string;name:string;entity:string;detail:string;why:string;skip:string;group:0|1|2;category:string;confidence:string}
export const suggestionKey=(task:Pick<Task,'category'|'entity'>)=>task.category+'::'+task.entity;
export function makePlan(run:RunState):Task[]{
 const lucky=['Good','Very good'].includes(run.luck);const unlucky=['Bad','Very bad'].includes(run.luck);
 const list:Task[]=[];let plantingBudget=available(run,'Gold');const day=absoluteDay(run.date);const d=run.date;
 const add=(id:string,name:string,entity:string,detail:string,why:string,skip:string,group:0|1|2,category:string,confidence='Conditional')=>{let priority:0|1|2=group;if(run.goal==='Community Center'&&category==='Bundle')priority=Math.max(0,group-1) as 0|1|2;if(run.goal==='Maximum Profit'&&category==='Farming')priority=Math.max(0,group-1) as 0|1|2;if(run.goal==='Mining'&&category==='Mining')priority=Math.max(0,group-1) as 0|1|2;if(run.goal==='Friendship'&&category==='Friendship')priority=Math.max(0,group-1) as 0|1|2;const task={id:day+':'+id,name,entity,detail,why,skip,group:priority,category,confidence};list.push(task)};
 for(const e of eventsOn(run,d)){
  if(e.type==='festival'&&run.festivals&&(!e.requires||run.unlocks.includes(e.requires)))add('event-'+e.name,e.name,'Calendar','Today · check entry times','This event has a fixed date. Plan farm chores around it.','It returns next year (multi-day events may continue tomorrow).',0,'Event','Scheduled');
  if(e.type==='birthday'&&run.goal==='Friendship'&&!(run.weather==='Green Rain'&&d.year===1))add('birthday-'+e.name,`Give ${e.name} a birthday gift`,e.name,'Birthday today','Birthday gifts give a larger friendship boost. Check the villager’s preferred gifts.','You can build friendship on other days.',1,'Friendship','Scheduled');
 }
 for(const p of run.plots){const c=plotCrop(p);if(!c)continue;const alive=plotAlive(p,d);if(alive&&day>=p.nextHarvest)add('harvest-'+p.id,`Harvest ${p.quantity} ${p.crop}`,p.crop,'Your recorded crop is ready',`The harvest date assumes daily watering. Record the harvest in Plan to update the next date.`,'Mature crops can wait, but crops that cannot survive next season will die.',0,'Farming');}
 if(!run.noFishing){const catches=eligibleFish(run).filter(f=>needed(run,f.name)).sort((a,b)=>Number(b.weather==='Rain')-Number(a.weather==='Rain'));for(const f of catches.slice(0,run.level>=4?3:1))add('fish-'+f.name,`Catch ${f.name}`,f.name,`${f.weather==='Rain'?'Rain · ':''}${f.location} · ${clock(f.start)}–${clock(f.end)}`,'Still needed for a standard Community Center bundle. Catch success depends on skill and chance.','Wait for another eligible day. Seasonal and rain requirements can delay completion.',f.weather==='Rain'?0:1,'Fishing','RNG');}
 const cropBundle=bundles.find(b=>b.name===`${d.season} Crops`);
 if(cropBundle&&run.goal!=='Maximum Profit'&&run.goal!=='Mining'){
  for(const item of cropBundle.items){const c=crops.find(c=>c.name===item.name);if(!c||!needed(run,c.name))continue;
   if(owned(run,c.name)>0){add('donate-'+c.name,`Donate ${c.name}`,c.name,'Available in your tracked inventory','Completes a missing seasonal crop slot. Record donation in Collection.','Keep one safely in a chest for later.',1,'Bundle');continue;}
   if(run.plots.some(p=>p.crop===c.name&&plotAlive(p,d)))continue;
   const remaining=lastPlantDay(c,d.season)-d.day;
   if(remaining>=0&&plantingBudget>=c.seed){plantingBudget-=c.seed;const closed=(d.day-1)%7===2&&!bundles.every(b=>bundleDone(run,b));add('plant-'+c.name,`Plant ${c.name}`,c.name,`${c.days} days · ${gold(c.seed)} per seed${closed?' · Pierre closed today':''}`,`Keep one for ${cropBundle.name}. ${closed?'Use owned seeds or another open seller. ':''}Water it every day.`,'Other sources may be available, but a missed seasonal harvest can delay this bundle.',remaining<=2?0:1,'Bundle');}
  }
 }
 if(run.goal==='Maximum Profit'){
 const best=crops.filter(c=>cropAvailableToBuy(run,c,d)).map(c=>({c,e:cropEconomics(c,d,1,run.tiller)})).filter(x=>x.e.harvests&&available(run,'Gold')>=x.c.seed).sort((a,b)=>b.e.profit-a.e.profit)[0];
 if(best)add('profit',`Plant ${best.c.name}`,best.c.name,`Up to ${gold(best.e.profit)} net / tile this season`,'Highest conservative seasonal profit per tile among tracked crops. Assumes daily watering and timely replanting; buying seeds depends on shop access.','Gold stays available for upgrades and other priorities.',0,'Farming');
 }
 const qualityBundle=bundles.find(b=>b.name==='Quality Crops');
 if(qualityBundle&&!bundleDone(run,qualityBundle)&&['Spring','Summer','Fall'].includes(d.season)){
  const seasonPreference:Record<string,string[]>={Spring:['Parsnip'],Summer:['Melon','Corn'],Fall:['Pumpkin','Corn']};
  const qualityCrop=(seasonPreference[d.season]??[]).find(name=>{const c=crops.find(c=>c.name===name);const slot=qualityBundle.items.findIndex(item=>item.name===name);return !!c&&cropAvailableToBuy(run,c,d)&&slot>=0&&!run.donated.includes(slotKey(qualityBundle,slot));});
  const slot=qualityCrop?qualityBundle.items.findIndex(item=>item.name===qualityCrop):-1;
  const crop=qualityCrop?crops.find(c=>c.name===qualityCrop):undefined;
  if(qualityCrop&&slot>=0&&crop){
   const have=owned(run,qualityCrop,2);
   if(have>=5)add('quality-donate-'+qualityCrop,`Donate 5 gold-quality ${qualityCrop}`,qualityCrop,`${have} tracked at gold quality or better`,'The Quality Crops Bundle needs 5 gold-quality crops from 3 of its 4 choices.','You can use another qualifying seasonal crop instead.',run.goal==='Fast Greenhouse'?0:1,'Bundle','Tracked');
   else if(lastPlantDay(crop,d.season)>=d.day)add('quality-grow-'+qualityCrop,`Grow extra ${qualityCrop} for the Quality Crops Bundle`,qualityCrop,`Need 5 gold-quality · last standard planting day ${d.season} ${lastPlantDay(crop,d.season)}`,'Crop quality is decided at harvest and improves with Farming level and fertilizer. Growing extras gives you more chances to reach 5 gold-quality crops.','You only need 3 of the 4 Quality Crops options, so another season can cover this slot.',run.goal==='Fast Greenhouse'?0:2,'Bundle');
  }
 }
 if(d.year===1&&d.season==='Spring'&&d.day>=2&&d.day<=12&&!run.noFishing&&(run.level>=4||run.goal==='Maximum Profit')&&run.gold<10000)add('startup-fishing','Fish for early-game gold','Sunfish','Spring Year 1 · flexible money route','Fishing is a strong early source of spendable gold before larger crop harvests arrive. Use the proceeds for seeds, backpack space, or tool progression.','Skip it if fishing is not fun or another goal matters more today.',1,'Fishing','Strategy');
 if(d.year===1&&d.season==='Spring'&&d.day<=28&&run.farming<6&&(run.level>=3||run.goal==='Fast Greenhouse'||run.goal==='Maximum Profit'))add('farming-six','Work toward Farming level 6','Quality Sprinkler',`Current Farming level ${run.farming}`,'Farming level 6 unlocks Quality Sprinklers, which water 8 adjacent tiles and can make Summer much easier to scale.','You can reach level 6 later; this is a progression target, not a hard deadline.',2,'Farming','Strategy');
 if(rainy(run.tomorrow)&&run.plots.some(p=>(!p.location||p.location==='Farm')&&plotAlive(p,d)))add('watering-upgrade-window','Consider a Watering Can upgrade','Watering Can','Rain forecast tomorrow','A rain forecast can create a useful tool-upgrade window: water crops today, hand the can to Clint, let rain cover tomorrow, then collect it when the upgrade is ready. Confirm Clint is open before committing.','Keep the can if you need it for indoor crops or cannot reach Clint in time.',1,'Farming','Conditional');
 const living=run.plots.filter(p=>plotAlive(p,d));
 const dryPlots=living.some(p=>p.location==='Greenhouse'||p.location==='IslandWest'||!rainy(run.weather));
 if(dryPlots)add('water','Water your crops','Watering Can','Check unwatered tiles',rainy(run.weather)?'Rain waters the outdoor farm. Check greenhouse pots and island crops separately; island weather can differ.':'Outdoor crops need water to grow. Sprinklers can cover this work.','Unwatered crops pause growth for a day.',0,'Farming');
 if(run.weather==='Storm')add('storm','Check lightning rods','Battery Pack','Storm today','Available lightning rods can intercept strikes. Check your farm for damage before leaving.','Lightning can damage crops and trees.',1,'Farming');
 if(run.weather==='Green Rain')add('green-rain','Gather green-rain moss and fiber','Fiber','Green rain today','Extra weeds and temporary trees make this a useful gathering day. Bring a scythe and axe.','Temporary weeds disappear after today.',0,'Foraging');
 if((d.day-1)%7===4||(d.day-1)%7===6)add('cart','Check the Traveling Cart','Traveling Cart','Cindersap Forest · 6am–8pm','The stock may include a missing bundle item. Buy only if it fits your budget.','Stock changes next visit. No item is guaranteed.',1,'Shopping','RNG');
 if(day>=5&&run.mineFloor<120)add('mine',`Reach mine floor ${Math.min(120,(Math.floor(run.mineFloor/5)+1)*5)}`,'Pickaxe',`Currently floor ${run.mineFloor} · save an elevator checkpoint`,lucky?'Good daily luck improves ladder chances from rocks. Bring food and aim for the next elevator checkpoint.':unlucky?'Poor daily luck makes ladder hunting less favorable. Consider farm chores or forage unless mining is your priority.':rainy(run.weather)?'Rain waters outdoor crops, freeing time for a mine trip. Bring food and aim for an elevator checkpoint.':'Every five floors is a useful stopping point. Bring food and leave enough time to return.','Mine progression can move to another day.',lucky?0:unlucky?(run.goal==='Mining'?1:2):run.goal==='Mining'?0:rainy(run.weather)?1:2,'Mining');
 if(day>=5&&run.mineFloor>=120&&(lucky||run.goal==='Mining'||(rainy(run.weather)&&!unlucky)))add('mine-resources','Gather ore in the mines','Pickaxe','Choose an unlocked floor for the ore you need','Good luck can improve rock drops and ladder chances. Bring food; rewards are still random.','Mine progression can move to another day.',lucky?0:1,'Mining');
 const forageBundle=bundles.find(b=>b.name===`${d.season} Foraging`);
 if(forageBundle&&!bundleDone(run,forageBundle))add('forage','Gather seasonal forage',forageBundle.items.find((_,i)=>!run.donated.includes(slotKey(forageBundle,i)))?.name??'Daffodil',`${d.season} Foraging · ${bundleCount(run,forageBundle)}/${forageBundle.required} donated`,'Keep one of each missing item for the Crafts Room. Forage spawns are random.','Another walk this season may find the missing items.',unlucky?1:2,'Foraging','RNG');
 for(const n of run.notes.filter(n=>absoluteDay(n.date)===day&&!n.done))add('note-'+n.id,n.label,'Calendar','Your pinned task','Added by you.','Reschedule it in Plan when needed.',1,'Personal');
 list.sort((a,b)=>a.group-b.group);if(list.length&&!list.some(t=>t.group===0))list[0].group=0;return run.goal==='Low Effort'?list.slice(0,3):list;
}

export function makeSimplePlan(run:RunState):Task[]{
 const source=makePlan({...run,luck:'Unknown',level:Math.min(run.level,3)}).filter(task=>!run.done.includes(task.id));
 const chosen:Task[]=[];
 const seen=new Set<string>();
 const push=(task:Task|undefined,group:0|1|2)=>{if(!task||seen.has(task.id)||chosen.length>=4)return;seen.add(task.id);chosen.push({...task,group});};
 const isPlant=(task:Task)=>/^Plant |^Grow extra /.test(task.name);
 const isField=(task:Task)=>task.category==='Farming'&&(/^Harvest |^Water /.test(task.name));
 const plants=source.filter(task=>isPlant(task));
 const sizeTiles:Record<RunState['simpleFarmSize'],number>={Small:12,Medium:24,Large:48};
 const targetTiles=sizeTiles[run.simpleFarmSize];
 const bestCrop=crops.filter(c=>cropAvailableToBuy(run,c,run.date)&&c.seed>0).map(c=>({c,e:cropEconomics(c,run.date,1,run.tiller)})).filter(x=>x.e.harvests>0&&available(run,'Gold')>=x.c.seed).sort((a,b)=>b.e.profit-a.e.profit)[0];
 const profit=source.find(task=>task.id.endsWith(':profit'))??(bestCrop?{id:`${absoluteDay(run.date)}:simple-profit`,name:`Plant ${bestCrop.c.name}`,entity:bestCrop.c.name,detail:`Strong seasonal value · ${gold(bestCrop.c.seed)} per seed`,why:'A straightforward crop choice with strong conservative raw-crop value for the days left in this season. Processing value is not assumed.',skip:'Plant less, choose a bundle crop instead, or keep the gold for another goal.',group:1 as const,category:'Farming',confidence:'Strategy'}:undefined);
 const simpleGoal=run.goal==='Maximum Profit'?'Maximum Profit':run.goal==='Community Center'||run.goal==='Fast Greenhouse'?'Community Center':'Balanced';
 const bundlePlant=plants.find(task=>task.category==='Bundle');
 const decorate=(task:Task|undefined)=>{if(!task)return task;const crop=crops.find(c=>c.name===task.entity);if(!crop||!isPlant(task))return task;const free=plantingCapacity(run,targetTiles).free;const affordable=crop.seed>0?Math.floor(available(run,'Gold')/crop.seed):free;const quantity=Math.max(0,Math.min(free,affordable));const hint=task.category==='Bundle'?`Plant at least 1. ${run.simpleFarmSize} plan: keep the rest of your space flexible.`:quantity>0?`${run.simpleFarmSize} plan: up to about ${quantity} tiles fits your current tracked space and gold.`:`${run.simpleFarmSize} plan: save space or gold for this crop when you can.`;return {...task,detail:`${task.detail} · ${hint}`};};
 if(simpleGoal==='Maximum Profit'){push(decorate(profit),0);}else{push(decorate(bundlePlant),0);if(simpleGoal==='Balanced'&&profit?.entity!==bundlePlant?.entity)push(decorate(profit),1);}
 push(source.find(isField),0);
 const timely=source.find(task=>['Event','Fishing','Shopping'].includes(task.category));
 push(timely,1);
 if(!chosen.some(task=>task.category==='Fishing')&&!run.noFishing){const seasonalFish=fish.filter(f=>f.seasons.includes(run.date.season)&&needed(run,f.name))[0];if(seasonalFish){const condition=seasonalFish.weather==='Any'?'Any weather':seasonalFish.weather==='Rain'?'Rainy day':'Sunny or clear day';push({id:`${absoluteDay(run.date)}:simple-fish-${seasonalFish.name}`,name:seasonalFish.weather==='Any'?`Catch ${seasonalFish.name}`:`Watch for ${seasonalFish.name}`,entity:seasonalFish.name,detail:`${condition} · ${seasonalFish.location} · ${clock(seasonalFish.start)}–${clock(seasonalFish.end)}`,why:'This fish is still needed for a standard Community Center bundle and is available this season. Simple Mode shows the condition without asking you to track weather every day.',skip:'If the conditions do not line up today, keep it in mind for another eligible day this season.',group:1,category:'Fishing',confidence:'Seasonal'},1);}}
 const seasonal=source.find(task=>['Foraging','Mining','Farming','Bundle'].includes(task.category)&&!isPlant(task)&&!isField(task));
 push(seasonal,2);
 const personal=source.find(task=>task.category==='Personal');
 push(personal,2);
 for(const task of source)push(task,2);
 return chosen.slice(0,4);
}

export interface Deadline{name:string;entity:string;detail:string;day:number;urgent:boolean}
export function deadlines(run:RunState):Deadline[]{const results:Deadline[]=[];const d=run.date;
 for(const c of crops.filter(c=>needed(run,c.name)&&cropAvailableToBuy(run,c,d)&&c.seasons.includes(d.season)&&!owned(run,c.name)&&!run.plots.some(p=>p.crop===c.name&&plotAlive(p,d))&&!c.seasons.includes(nextDate({...d,day:28}).season))){const last=lastPlantDay(c,d.season);if(last>=d.day)results.push({name:`Plant ${c.name}`,entity:c.name,detail:`By ${d.season} ${last} · ${last-d.day===0?'today':`${last-d.day} days left`}`,day:last,urgent:last-d.day<=3});}
 for(const e of events.filter(e=>e.season===d.season&&e.type==='festival'&&(e.end??e.day)>=d.day&&(!e.requires||run.unlocks.includes(e.requires))))results.push({name:e.name,entity:'Calendar',detail:`${e.season} ${e.day}${e.end?'–'+e.end:''}`,day:Math.max(d.day,e.day),urgent:e.day-d.day<=2});
 if(rainy(run.tomorrow)&&!run.noFishing&&['Spring','Fall'].includes(d.season)&&needed(run,'Catfish'))results.push({name:'Catfish opportunity',entity:'Catfish',detail:'Rain forecast tomorrow · River',day:d.day+1,urgent:true});
 return results.sort((a,b)=>a.day-b.day).slice(0,5);
}
export function recordHarvest(run:RunState,id:string):RunState{const p=run.plots.find(p=>p.id===id);const c=p?plotCrop(p):undefined;if(!p||!c||absoluteDay(run.date)<p.nextHarvest||!plotAlive(p,run.date))return run;
 const inventory=run.inventory.map(x=>({...x}));const item=inventory.find(i=>i.name===c.name&&i.quality===0);if(item)item.quantity+=p.quantity*c.yield;else inventory.push({name:c.name,quantity:p.quantity*c.yield,quality:0});
 const plots=c.regrow?run.plots.map(x=>x.id===id?{...x,harvests:x.harvests+1,nextHarvest:absoluteDay(run.date)+c.regrow}:x):run.plots.filter(x=>x.id!==id);
 return {...run,inventory,plots};}
export function addPlot(run:RunState,crop:string,quantity:number):Plot{const c=crops.find(c=>c.name===crop);if(!c||!c.seasons.includes(run.date.season)||!Number.isInteger(quantity)||quantity<1||quantity>9999)throw new Error('Choose an in-season crop and a valid quantity.');return {id:crypto.randomUUID(),crop,quantity,planted:run.date,nextHarvest:absoluteDay(run.date)+c.days,harvests:0,missedDays:0}}

export function addExistingPlot(run:RunState,input:{crop:string;quantity:number;daysUntilHarvest:number;location:NonNullable<Plot['location']>;customCrop?:Plot['customCrop']}):Plot{
 if(!Number.isInteger(input.daysUntilHarvest)||input.daysUntilHarvest<0||input.daysUntilHarvest>365)throw new Error('Days until harvest must be between 0 and 365.');
 if(run.plots.length>=200)throw new Error('The journal supports up to 200 crop groups.');
 const crop=input.crop.trim();
 if(!crop)throw new Error('Enter a crop name.');
 const plot=runSchema.shape.plots.element.parse({id:crypto.randomUUID(),crop,quantity:input.quantity,planted:run.date,nextHarvest:absoluteDay(run.date)+input.daysUntilHarvest,location:input.location,customCrop:input.customCrop,harvests:0,missedDays:0});
 const data=plotCrop(plot);
 if(!data)throw new Error('Add growth details for this custom crop.');
 if(input.location==='Farm'&&!data.seasons.includes(run.date.season))throw new Error('Choose a growing season that includes today, or select an indoor location.');
 return plot;
}

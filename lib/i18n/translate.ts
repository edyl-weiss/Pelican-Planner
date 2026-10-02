import {terms} from './terms';
import {messages} from './messages';
export type Locale='en'|'zh-CN';
export const dictionary:Record<string,string>={...terms,...messages,'Gold quality':'金星','Donate':'献祭','today':'今天','birthday':'生日','harvest':'收获','Festivals':'节日','Read today’s farm plan':'读取今日农场计划','Read the current farm date, priorities and deadlines without changing the farm.':'读取当前农场日期、优先任务和截止日期，不修改农场记录。','The imported farm data is invalid. Check the file and try again.':'导入的农场数据无效，请检查文件后重试。'};
const templates: [RegExp,string][]=[
 [/^The crop catalog covers (\\d+) crops, plus all 30 standard bundles, seasonal events and common bundle fish\\. Each suggestion includes a reason\\.$/,'作物目录收录了{0}种作物，还有全部30个标准收集包、季节活动和常见收集包鱼类。每条建议都会说明推荐理由。'],
 [/^Moved to (.+)\. Plan recalculated\.$/,'已进入{0}，计划已重新计算。'],
 [/^Weather updated to (.+)\. Plan recalculated\.$/,'天气已更新为{0}，计划已重新计算。'],
 [/^Tomorrow’s forecast: (.+)\.$/,'明日天气预报：{0}。'],
 [/^Mark (.+) incomplete$/,'将“{0}”标记为未完成'],
 [/^Mark (.+) complete$/,'将“{0}”标记为完成'],
 [/^(\d+) of 30 standard bundles completed$/,'已完成{0}个标准收集包，共30个'],
 [/^(\d+) of 30 bundles donated$/,'已完成{0}个收集包，共30个'],
 [/^Added (\d+) (.+) to your tracked inventory\.$/,'已将{0}个{1}加入物品栏。'],
 [/^(\d+) matching bundles$/,'找到{0}个收集包'],
 [/^Complete this room to unlock: (.+)$/,'完成此房间后解锁：{0}'],
 [/^(\d+)\s*\/\s*(\d+) donated$/,'已献祭{0} / {1}'],
 [/^choose (\d+) of (\d+)$/,'从{1}项中选{0}项'],
 [/^(.+), ([\d,]+) required( gold quality)?, (not donated|donated)$/,'{0}，需要{1}个{2}，{3}'],
 [/^Keep up to (\d+) for tracked bundles \/ reserves$/,'为收集包与预留最多保留{0}个'],
 [/^(.+) unmarked for (.+)\.$/,'已撤销{1}中的{0}献祭记录。'],
 [/^(.+) recorded as donated for (.+)\.$/,'已将{1}中的{0}标记为已献祭。'],
 [/^Recorded (\d+) (.+) planted on (.+)\.$/,'已记录在{2}种下{0}格{1}。'],
 [/^Reserved resources for (.+)\.$/,'已为{0}预留资源。'],
 [/^Resources reserved for (.+)\. Gold has not been spent\.$/,'已为{0}预留资源，金币尚未花费。'],
 [/^Requires (.+) unlock$/,'需要先解锁{0}'],
 [/^Pinned a task for (.+)\.$/,'已在{0}记下一项待办。'],
 [/^Ready (.+)$/,'预计{0}成熟'],
 [/^(.+) estimated growth (\d+) percent$/,'{0}预计生长进度{1}%'],
 [/^Harvested (\d+) (.+)\.$/,'已收获{0}格{1}。'],
 [/^(.+) harvest delayed by one missed watering day\.$/,'{0}因漏浇一天，收获日期顺延一天。'],
 [/^(.+) would remain unreserved\.$/,'还可自由使用{0}。'],
 [/^Released reservation for (.+)\.$/,'已解除{0}的资源预留。'],
 [/^Date changed to (.+)\.$/,'日期已调整为{0}。'],
 [/^Plan adjusted for (.+)\.$/,'计划已按“{0}”调整。'],
 [/^(Spring|Summer|Fall|Winter) (\d+), Year (\d+)$/,'第{2}年{0}{1}日'],
 [/^(Spring|Summer|Fall|Winter) (\d+(?:–\d+)?)$/,'{0}{1}日'],
 [/^Year (\d+)$/,'第{0}年'],
 [/^Give (.+) a birthday gift$/,'给{0}送一份生日礼物'],
 [/^Harvest (\d+) (.+)$/,'收获{0}格{1}'],
 [/^Catch (.+)$/,'钓一条{0}'],
 [/^Donate (.+)$/,'献祭{0}'],
 [/^Plant (.+)$/,'种植{0}'],
 [/^(\d+) days$/,'{0}天'],
 [/^(.+) per seed$/,'每颗种子{0}'],
 [/^Keep one for (.+?)\. (Use owned seeds or another open seller\. )?Water it every day\.$/,'为{0}留一个，每天记得浇水。{1}'],
 [/^Up to (.+) net \/ tile this season$/,'本季每格净收益最多{0}'],
 [/^Reach mine floor (\d+)$/,'到达矿井第{0}层'],
 [/^Currently floor (\d+)$/,'当前位于第{0}层'],
 [/^By (Spring|Summer|Fall|Winter) (\d+)$/,'最晚{0}{1}日'],
 [/^(\d+) days left$/,'还剩{0}天'],
 [/^([\d,]+)g$/,'{0}金'],
 [/^([\d,]+) (.+)$/,'{0} {1}'],
 [/^(.+) birthday$/,'{0}的生日'],
 [/^harvest (.+)$/,'收获{0}'],
];
Object.assign(dictionary,{'Pierre closed today':'皮埃尔今天休息','Use owned seeds or another open seller.':'请用已有种子，或去其他营业中的商店购买。','save an elevator checkpoint':'解锁一个电梯存档点','2,500g':'2,500金','5,000g':'5,000金','10,000g':'10,000金','25,000g':'25,000金'});
export function translate(text:string,locale:Locale):string{
 if(locale==='en'||!text.trim())return text;
 const s=text.trim();const before=text.slice(0,text.indexOf(s));const after=text.slice(text.indexOf(s)+s.length);
 const exact=dictionary[s];if(exact!==undefined)return before+exact+after;
 for(const [pattern,replacement] of templates){const match=s.match(pattern);if(match)return before+replacement.replace(/\{(\d+)\}/g,(_,i)=>translate((match[Number(i)+1]??'').trim(),locale))+after;}
 if(/^\d{1,2}(am|pm)$/.test(s)){const h=parseInt(s);return `${s.endsWith('am')?(h===12?'凌晨':'上午'):(h===12?'中午':'下午')}${h}点`;}
 // Compound display labels are composed of independently translated segments.
 for(const separator of [' · ',', ',' / ','–']){if(s.includes(separator)){const parts=s.split(separator);const translated=parts.map(part=>translate(part,locale));if(translated.some((part,i)=>part!==parts[i]))return before+translated.join(separator)+after;}}
 return text;
}
const wikiPages:Record<string,string>={Crops:'农作物',Bundles:'收集包',Calendar:'日历',Fish:'鱼类',Festivals:'节日',Traveling_Cart:'旅行货车','Spirit’s Eve':'万灵节','Salmonberry season':'美洲大树莓','Blackberry season':'黑莓'};
export function localizedWiki(href:string,locale:Locale){
 if(locale==='en'||!href.startsWith('https://stardewvalleywiki.com/'))return href;
 const key=decodeURIComponent(href.slice('https://stardewvalleywiki.com/'.length)).replaceAll('_',' ');
 const page=wikiPages[key]??wikiPages[key.replaceAll(' ','_')]??terms[key];
 return 'https://zh.stardewvalleywiki.com/'+(page?encodeURIComponent(page):'');
}
export function matchesSearch(name:string,query:string){const q=query.trim().toLocaleLowerCase();return name.toLocaleLowerCase().includes(q)||translate(name,'zh-CN').includes(q);}

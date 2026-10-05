import {entryDetails} from './encyclopedia-details';
import assets from './assets-source.json';
import {bundles,crops,events,fish,festivalGuidance,roomRewards,wiki,type Bundle,type CalendarEvent,type Crop,type Fish} from './data';
import {obtainMethods} from './obtain';
import {villagerProfiles} from './villager-profiles';
import {craftingReferenceEntries,treeReferenceEntries} from './encyclopedia-crafting';

export type EncyclopediaCategory='Overview'|'Crops'|'Fish'|'Villagers'|'Events'|'Bundles'|'Trees'|'Crafting'|'Items'|'Tools & Gear'|'Places & Systems';
export interface EncyclopediaSource{label:string;url:string}
export interface EncyclopediaEntry{
 id:string;
 title:string;
 aliases:string[];
 category:EncyclopediaCategory;
 summary:string;
 facts:string[];
 related:string[];
 sprite?:string;
 sources:EncyclopediaSource[];
 keywords:string[];
}

type AssetRecord={local_path:string;original_image_url?:string;source_page_url?:string};
const registry=assets as Record<string,AssetRecord>;
const qualityLabel=(quality:number)=>quality>=2?'Gold quality':quality===1?'Silver quality':'Normal quality';
const slug=(text:string)=>text.toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const source=(name:string,label='Stardew Valley Wiki'):EncyclopediaSource=>({label,url:wiki(name)});
const official:EncyclopediaSource={label:'Official Stardew Valley site',url:'https://www.stardewvalley.net/'};
const distinct=(values:string[])=>[...new Set(values.filter(Boolean))];
const titleFromAsset=(name:string)=>name.endsWith(' Icon')?name.slice(0,-5):name.endsWith(' Quality')?name.replace(' Quality',' quality'):name;
const spriteFor=(title:string)=>{
 if(registry[title])return title;
 if(registry[title+' Icon'])return title+' Icon';
 const hit=Object.keys(registry).find(key=>titleFromAsset(key).toLowerCase()===title.toLowerCase());
 return hit;
};

const broad:EncyclopediaEntry[]=[
 {id:'overview-encyclopedia',title:'Encyclopedia',aliases:['guide','reference','search'],category:'Overview',summary:'A local Stardew reference built into Pelican Planner. Search entries without depending on the Wiki being available, then open the source links whenever you want the full page.',facts:['Search works against the bundled index first, so common lookups still work if outside sites are unavailable.','Broad searches show a chooser when several entries match. If a general overview exists, it stays available at the top.','Downloaded offline copies include the same entry text, search index, and local sprites used by the reader.'],related:['Crops','Fish','Villagers','Festivals','Bundles','Trees','Crafting','Community Center'],sprite:'Calendar',sources:[official,source('Stardew_Valley_Wiki','Stardew Valley Wiki')],keywords:['offline','wiki','search']},
 {id:'overview-crops',title:'Crops',aliases:['crop','seeds','farming crops'],category:'Overview',summary:'Seasonal plants grown from seeds or starters. The built-in crop entries focus on season, growth time, regrowth, seed cost, base sale value, and practical planting notes.',facts:['Most outdoor crops die when their season ends unless they also grow in the next season.','Regrowing crops keep producing after the first harvest if watered and kept in a valid growing area.','Pelican Planner uses conservative raw-crop math unless an entry says processing changes the picture.'],related:['Farming','Greenhouse','Sprinklers','Artisan Goods'],sprite:'Parsnip',sources:[source('Crops')],keywords:['plant','seed','harvest']},
 {id:'overview-fish',title:'Fish',aliases:['fishing fish','fish list'],category:'Overview',summary:'Fish availability can depend on season, time, weather, and location. Individual entries use the planner’s checked fishing data when it is available.',facts:['A fish can have different availability outside the standard locations modeled here, especially with late-game areas or special mechanics.','Weather requirements matter for several Community Center fish.','Crab Pot catches are indexed too, even though they do not use rod-fishing schedules.'],related:['Fishing','Fish Tank','Bundles'],sprite:'Catfish',sources:[source('Fish')],keywords:['fishing','rod','catch']},
 {id:'overview-villagers',title:'Villagers',aliases:['villager','people','npc','npcs'],category:'Overview',summary:'Pelican Town residents and other giftable characters. Each local profile includes birthday, home, role, relationship status, and a full offline gift-taste guide.',facts:['Birthday gifts are especially valuable for friendship, so each profile keeps the birthday near the top.','Gift tastes are stored locally, including universal defaults and character-specific exceptions.','Some characters only become available after progression milestones.'],related:['Friendship','Calendar'],sprite:'Abigail Icon',sources:[source('Villagers')],keywords:['npc','birthday','friendship']},
 {id:'overview-festivals',title:'Festivals',aliases:['festival','events','holiday'],category:'Overview',summary:'Scheduled valley events that can change normal routines, shop access, or what is available that day.',facts:['Festival start windows and locations are included where the planner tracks them.','Some multi-day events stay active for several calendar days.'],related:['Calendar','Egg Festival','Night Market','Stardew Valley Fair'],sprite:'Calendar',sources:[source('Festivals')],keywords:['event','calendar']},
 {id:'overview-bundles',title:'Bundles',aliases:['bundle','community center bundles'],category:'Overview',summary:'Community Center donation sets. The Encyclopedia includes all 30 standard bundles used by Pelican Planner, plus the items they request.',facts:['Some bundles require every listed item; others let you choose a subset.','Quality requirements are shown when the standard bundle calls for them.'],related:['Community Center','Crafts Room','Pantry','Fish Tank','Boiler Room','Bulletin Board','Vault'],sprite:'Bundle Green',sources:[source('Bundles')],keywords:['donate','community center']},
 {id:'overview-community-center',title:'Community Center',aliases:['cc','community centre'],category:'Places & Systems',summary:'The main bundle-based restoration project in the standard Pelican Town route. Completing room bundles unlocks major conveniences and progression rewards.',facts:['Pelican Planner models the 30 standard bundles rather than every remixed-bundle possibility.','Room rewards include the Greenhouse, Minecarts, Bus repair, and other upgrades.'],related:['Bundles','Pantry','Boiler Room','Vault'],sprite:'Bundle Green',sources:[source('Community_Center')],keywords:['bundles','junimo']},
 {id:'overview-farming',title:'Farming',aliases:['farm skill','planting'],category:'Places & Systems',summary:'The skill covering crop growth, animal products, and many farm machines. In the planner, farming data is mostly used for crops, sprinklers, professions, and harvest timing.',facts:['Crop quality and profession bonuses can change real profit beyond base-value comparisons.','Daily watering is normally required for growing crops unless rain or a sprinkler covers the tile.'],related:['Crops','Crafting','Sprinklers','Artisan Goods','Greenhouse'],sprite:'Parsnip',sources:[source('Farming')],keywords:['skill','farm']},
 {id:'overview-fishing',title:'Fishing',aliases:['fish skill','rod'],category:'Places & Systems',summary:'The skill and activity used to catch fish, treasure, and other water-based items. Planner recommendations focus on time-sensitive catches and Community Center needs.',facts:['Location, clock time, season, and weather can all matter.','Some fish are available in more places than the compact planner model lists.'],related:['Fish','Fish Tank','Crab Pot'],sprite:'Catfish',sources:[source('Fishing')],keywords:['skill','rod']},
 {id:'overview-mining',title:'Mining',aliases:['mine skill','mines'],category:'Places & Systems',summary:'Breaking rocks and progressing underground for ore, gems, geodes, and combat resources.',facts:['Mine elevator checkpoints make repeated trips much faster.','Ore and geode availability changes as you reach deeper floor bands.'],related:['Mines','Skull Cavern','Pickaxe','Copper Bar','Iron Bar','Gold Bar'],sprite:'Pickaxe',sources:[source('Mining')],keywords:['ore','mine','rocks']},
 {id:'overview-foraging',title:'Foraging',aliases:['forage','wild items'],category:'Places & Systems',summary:'Collecting seasonal wild items, chopping trees, and gathering several renewable resources around the valley.',facts:['Seasonal forage is important for early bundles and easy gifts.','Wood and Hardwood also connect foraging with construction and crafting.'],related:['Trees','Wood','Hardwood','Spring Foraging','Summer Foraging','Fall Foraging','Winter Foraging'],sprite:'Daffodil',sources:[source('Foraging')],keywords:['wild','gather']},
 {id:'overview-friendship',title:'Friendship',aliases:['hearts','relationships'],category:'Places & Systems',summary:'The relationship system for villagers. Talking, gifts, quests, events, and birthdays all affect friendship over time.',facts:['Birthdays are especially valuable gift days.','Open any villager profile for locally stored loved, liked, neutral, disliked, and hated gifts.','Character-specific tastes override universal gift rules when they conflict.'],related:['Villagers','Calendar'],sprite:'Rabbit\'s Foot',sources:[source('Friendship')],keywords:['heart','gift']},
 {id:'overview-weather',title:'Weather',aliases:['rain','forecast'],category:'Places & Systems',summary:'Daily conditions that affect watering, some fish, festivals, and a few special systems.',facts:['Rain waters outdoor crops automatically.','Some fish only appear in rain or only under fair conditions.'],related:['Fishing','Crops','Catfish'],sprite:'Calendar',sources:[source('Weather')],keywords:['rain','sunny','storm']},
 {id:'overview-luck',title:'Luck',aliases:['daily luck','fortune teller'],category:'Places & Systems',summary:'A daily modifier that influences several random outcomes, especially mining and treasure-related activities.',facts:['Daily Luck is separate from Luck buffs from food or drink.','The planner only uses luck in Full Mode.'],related:['Mining','Skull Cavern'],sprite:'Rabbit\'s Foot',sources:[source('Luck')],keywords:['fortune','random']},
 {id:'overview-trees',title:'Trees',aliases:['tree','wild trees','common trees'],category:'Trees',summary:'Wild and special trees supply Wood, Sap, seeds, Hardwood, Moss, and valuable tapper products used throughout crafting and farm progression.',facts:['Oak, Maple, Pine, and Mahogany are the four common tree types most relevant to repeatable crafting resources.','Special trees include Mushroom, Mystic, Palm, and Green Rain Trees.','Open a tree entry for its seed, tapper product, and crafting connections.'],related:['Oak Tree','Maple Tree','Pine Tree','Mahogany Tree','Mystic Tree','Tapper','Tree Fertilizer'],sprite:'Oak Tree',sources:[source('Trees')],keywords:['tree','wood','foraging','tapper','resource']},
 {id:'overview-crafting',title:'Crafting',aliases:['craft','recipes','crafting recipes'],category:'Crafting',summary:'Making tools, machines, paths, consumables, and other objects from gathered resources.',facts:['Recipes can come from skill levels, friendships, quests, shops, and events.','Crafted equipment can turn a steady supply of gathered resources into repeatable production.'],related:['Trees','Wood','Stone','Coal','Copper Bar','Iron Bar','Gold Bar','Quality Sprinkler'],sprite:'Wood',sources:[source('Crafting')],keywords:['recipe','materials']},
 {id:'overview-cooking',title:'Cooking',aliases:['cook','recipes food'],category:'Places & Systems',summary:'Preparing food once a kitchen or Cookout Kit is available. Meals can restore energy and health and may grant temporary buffs.',facts:['Recipes are learned from TV, friendships, skill progression, shops, and other sources.','Ingredients can overlap with bundle or gifting plans, so check before using rare items.'],related:['Fried Egg','Maki Roll','Energy','Health'],sprite:'Fried Egg',sources:[source('Cooking')],keywords:['food','recipe']},
 {id:'overview-artisan-goods',title:'Artisan Goods',aliases:['artisan','processed goods'],category:'Items',summary:'Processed farm goods such as Wine, Jelly, Cheese, Honey, and Truffle Oil. Processing can make raw-crop comparisons look very different.',facts:['The Artisan profession increases the sale price of many processed goods.','Machine time and input availability matter when comparing processing routes.'],related:['Wine','Jelly','Cheese','Goat Cheese','Honey','Truffle Oil'],sprite:'Wine',sources:[source('Artisan_Goods')],keywords:['keg','preserves jar','processing']},
 {id:'overview-tools',title:'Tools',aliases:['tool','farm tools'],category:'Tools & Gear',summary:'Reusable equipment for farming, mining, fishing, and clearing the farm.',facts:['Most core tools can be upgraded at the Blacksmith using metal bars and gold.','Upgrade timing matters because Clint keeps many tools while work is in progress.'],related:['Pickaxe','Watering Can','Copper Pickaxe','Steel Pickaxe'],sprite:'Pickaxe',sources:[source('Tools')],keywords:['upgrade','equipment']},
 {id:'overview-weapons',title:'Weapons',aliases:['weapon','combat gear'],category:'Tools & Gear',summary:'Combat equipment used in the Mines, Skull Cavern, and other dangerous areas. Swords are one weapon type alongside daggers and clubs.',facts:['Weapon speed, damage, defense bonuses, and special effects vary widely.','Use the full Wiki page for exact current stats on a specific weapon.'],related:['Sword','Galaxy Sword','Infinity Blade','Lava Katana','Obsidian Edge'],sprite:'Pickaxe',sources:[source('Weapons')],keywords:['combat','sword','dagger','club']},
 {id:'overview-sword',title:'Sword',aliases:['swords','blade'],category:'Tools & Gear',summary:'A common melee weapon type with a broad swing and a blocking special move. Search “sword” to compare several named sword entries or stay on this overview.',facts:['Different swords trade off damage, speed, defense, weight, and special effects.','Check damage alongside attack speed when deciding whether a new sword suits your playstyle.'],related:['Galaxy Sword','Infinity Blade','Lava Katana','Obsidian Edge','Forest Sword','Bone Sword'],sprite:'Pickaxe',sources:[source('Weapons')],keywords:['weapon','blade','combat']},
 {id:'overview-sprinklers',title:'Sprinklers',aliases:['sprinkler','watering automation'],category:'Tools & Gear',summary:'Farm equipment that waters nearby tilled tiles automatically each morning.',facts:['Coverage changes by sprinkler tier.','Quality Sprinklers are a major midgame step because they reduce daily watering time.'],related:['Quality Sprinkler','Watering Can','Farming'],sprite:'Quality Sprinkler',sources:[source('Sprinkler')],keywords:['watering','farm']},
 {id:'overview-greenhouse',title:'Greenhouse',aliases:['the greenhouse'],category:'Places & Systems',summary:'An indoor growing area where crops and fruit trees are not restricted by outdoor seasons.',facts:['In the standard Community Center route, completing the Pantry repairs the Greenhouse.','The planner treats Greenhouse crops as season-safe once the area is unlocked.'],related:['Pantry','Crops','Ancient Fruit'],sprite:'Ancient Fruit',sources:[source('Greenhouse')],keywords:['indoor crops','pantry']},
 {id:'overview-mines',title:'Mines',aliases:['the mines','mine'],category:'Places & Systems',summary:'The 120-floor mountain dungeon used for mining, combat, ore, geodes, and progression.',facts:['An elevator saves progress in five-floor increments after those checkpoints are reached.','Floor themes and common resources change as you go deeper.'],related:['Mining','Pickaxe','Copper Bar','Iron Bar','Gold Bar'],sprite:'Pickaxe',sources:[source('The_Mines')],keywords:['floor','elevator','ore']},
 {id:'overview-skull-cavern',title:'Skull Cavern',aliases:['skull cave','desert cavern'],category:'Places & Systems',summary:'A dangerous, effectively bottomless desert dungeon focused on deep runs, valuable ore, and strong enemies.',facts:['Access requires reaching the Calico Desert and obtaining the Skull Key.','Luck, bombs, staircases, food, and speed are common preparation considerations.'],related:['Calico Desert','Mining','Luck','Prismatic Shard'],sprite:'Prismatic Shard',sources:[source('Skull_Cavern')],keywords:['desert','mine','combat']},
 {id:'overview-calico-desert',title:'Calico Desert',aliases:['desert'],category:'Places & Systems',summary:'A region reached by bus after the route is repaired, with the Oasis, Skull Cavern, desert forage, and seasonal events.',facts:['The Vault room reward repairs the Bus in the standard Community Center route.','Coconut and Cactus Fruit are common desert forage items.'],related:['Vault','Oasis','Skull Cavern','Coconut','Cactus Fruit'],sprite:'Cactus Fruit',sources:[source('Calico_Desert')],keywords:['bus','oasis']},
 {id:'overview-ginger-island',title:'Ginger Island',aliases:['island'],category:'Places & Systems',summary:'A late-game region with its own farm, characters, resources, quests, and progression systems.',facts:['Island progress revolves around exploring, gathering Golden Walnuts, and unlocking routes and facilities.'],related:['Leo','Crops'],sprite:'Leo Icon',sources:[source('Ginger_Island')],keywords:['late game','walnut']},
 {id:'overview-traveling-cart',title:'Traveling Cart',aliases:['traveling merchant','cart'],category:'Places & Systems',summary:'A rotating merchant in Cindersap Forest with a changing assortment that can include hard-to-get crops, bundle items, and seeds.',facts:['Inventory and prices vary between visits.','The cart can be especially useful for Year 1 Community Center routing.'],related:['Red Cabbage','Sweet Gem Berry','Coconut'],sprite:'Traveling Cart Icon',sources:[source('Traveling_Cart')],keywords:['merchant','shop']},
 {id:'overview-pierre',title:"Pierre's General Store",aliases:['pierre','general store','pierres'],category:'Places & Systems',summary:'The main seed shop in Pelican Town and a common stop for seasonal crop planning.',facts:['Seed availability changes by season and, for a few crops, by year.','Festival days and weekly schedules can change normal shopping access.'],related:['Crops','Seeds','Pierre'],sprite:'Pierre Icon',sources:[source("Pierre's General Store")],keywords:['shop','seeds']},
 {id:'overview-oasis',title:'Oasis',aliases:['sandy shop'],category:'Places & Systems',summary:'The shop in the Calico Desert run by Sandy, with several unique seed and item options.',facts:['Rhubarb, Starfruit, and Beet seeds are tied to desert shopping in the planner’s crop guidance.'],related:['Sandy','Calico Desert','Rhubarb','Starfruit','Beet'],sprite:'Sandy Icon',sources:[source('Oasis')],keywords:['shop','desert']},
 {id:'overview-energy',title:'Energy',aliases:['stamina'],category:'Places & Systems',summary:'The resource spent on many physical actions such as using tools and fishing.',facts:['Food and several special progression rewards can restore or expand day-to-day capacity.','Passing out or exhausting yourself can cost time and create penalties.'],related:['Health','Cooking'],sprite:'Fried Egg',sources:[source('Energy')],keywords:['stamina','food']},
 {id:'overview-health',title:'Health',aliases:['hp','hit points'],category:'Places & Systems',summary:'Combat survivability. Health falls when monsters or hazards damage the player and can be restored with food or other effects.',facts:['Reaching zero health can cause lost items and progress during dangerous trips.'],related:['Energy','Cooking','Skull Cavern'],sprite:'Fried Egg',sources:[source('Health')],keywords:['combat','hp']},
 {id:'overview-skills',title:'Skills',aliases:['skill','levels'],category:'Places & Systems',summary:'Farming, Mining, Foraging, Fishing, and Combat each level through related actions and unlock recipes or professions.',facts:['Profession choices can materially change profit or playstyle.','Pelican Planner currently models Farming professions most directly.'],related:['Farming','Fishing','Mining','Foraging'],sprite:'Calendar',sources:[source('Skills')],keywords:['level','profession']},
];

const curatedGear:EncyclopediaEntry[]=[
 ['Galaxy Sword','galaxy blade','A high-tier sword associated with the desert and Prismatic Shard progression.'],
 ['Infinity Blade','infinity sword','An endgame sword upgrade built from the Galaxy Sword path.'],
 ['Lava Katana','katana','A strong sword sold through the Adventurer’s Guild once its progression requirement is met.'],
 ['Obsidian Edge','obsidian sword','A sword obtained while progressing through the Mines.'],
 ['Forest Sword','forest blade','An early sword that can appear from breakables and monster-related sources.'],
 ['Bone Sword','bone blade','A sword associated with Skeleton drops and early-to-midgame combat progression.'],
 ['Steel Smallsword','steel sword','An early sword used near the beginning of Mines progression.'],
 ['Templar\'s Blade','templar blade','A sword in the broader weapon pool; use the source page for exact stats and acquisition details.'],
 ['Neptune\'s Glaive','neptune glaive','A sword that can appear through fishing treasure and other weapon sources.'],
 ['Dragontooth Cutlass','dragontooth sword','A late-game sword found through Ginger Island combat progression.'],
].map(([title,alias,summary],index)=>({id:'gear-'+slug(title),title,aliases:[alias],category:'Tools & Gear' as const,summary,facts:['Exact damage, speed, defense, and special-effect values are left on the source page so the built-in summary stays version-resilient.'],related:index<2?['Sword','Weapons','Prismatic Shard']:['Sword','Weapons'],sprite:spriteFor(title),sources:[source(title)],keywords:['sword','weapon','combat']}));

function cropEntry(crop:Crop):EncyclopediaEntry{
 const facts=[
  `Grows in ${crop.seasons.join(' / ')} and takes ${crop.days} day${crop.days===1?'':'s'} to mature.`,
  crop.regrow?`Regrows every ${crop.regrow} day${crop.regrow===1?'':'s'} after the first harvest.`:'Single-harvest crop; replant for another harvest.',
  crop.buyable===false?'Its seed is not a normal shop purchase in the planner data.':`Seed price used for planning: ${crop.seed}g. A normal-quality harvest item sells for ${crop.sell}g before profession bonuses.`,
  ...(crop.note?[crop.note]:[]),
  ...obtainMethods(crop.name),
  `Minimum harvest used in the planner: ${crop.yield} item${crop.yield===1?'':'s'} per planted tile. Extra random yields are not included.`,
  'Growth times assume daily watering and no growth-speed bonuses. A missed watering day delays growth rather than killing the plant.',
  ...bundles.filter(b=>b.items.some(i=>i.name===crop.name)).map(b=>{const i=b.items.find(i=>i.name===crop.name)!;return `For the ${b.name} bundle, keep ${i.count} ${crop.name}${i.quality?' at '+qualityLabel(i.quality).toLowerCase()+' or better':''}.`}),
 ];
 return {id:'crop-'+slug(crop.name),title:crop.name,aliases:[crop.name+' crop',crop.name+' seed',crop.name+' seeds'],category:'Crops',summary:`${crop.name} grows in ${crop.seasons.join(' and ')} and is ready after ${crop.days} days of growth. ${crop.regrow?`Keep the plant after harvesting: it produces again every ${crop.regrow} days.`:'Harvesting removes the plant, so keep spare seeds if you want another crop.'}`,facts:distinct(facts),related:distinct(['Crops',...bundles.filter(b=>b.items.some(i=>i.name===crop.name)).map(b=>b.name)]),sprite:spriteFor(crop.name),sources:[source(crop.name),source('Crops','Crop table')],keywords:['crop','seed','harvest',...crop.seasons]};
}
function fishEntry(item:Fish):EncyclopediaEntry{
 const weather=item.weather==='Any'?'any weather':item.weather==='Rain'?'rain':'sunny or windy weather';
 const facts=[`Fishing window: ${formatHour(item.start)}–${formatHour(item.end)} at ${item.location}.`,`Seasons: ${item.seasons.join(' / ')}; weather: ${weather}.`,...obtainMethods(item.name),...bundles.filter(b=>b.items.some(i=>i.name===item.name)).map(b=>`Save a catch for the ${b.name} bundle before selling your extras.`)];
 return {id:'fish-'+slug(item.name),title:item.name,aliases:[item.name+' fish'],category:'Fish',summary:`${item.name} can be caught at ${item.location} during ${item.seasons.join(' and ')}. Plan your visit between ${formatHour(item.start)} and ${formatHour(item.end)}${item.weather==='Any'?', with no weather restriction':` in ${weather}`}. These are its standard fishing conditions; special locations and late-game equipment can offer other options.`,facts:distinct(facts),related:distinct(['Fish',...bundles.filter(b=>b.items.some(i=>i.name===item.name)).map(b=>b.name)]),sprite:spriteFor(item.name),sources:[source(item.name),source('Fish','Fish table')],keywords:['fish','fishing',item.location,...item.seasons,item.weather]};
}
function formatHour(hour:number){const h=hour%24;const suffix=h<12?'am':'pm';return `${h%12||12}${suffix}`}
function villagerEntry(event:CalendarEvent):EncyclopediaEntry{
 const sprite=spriteFor(event.name);
 const profile=villagerProfiles[event.name];
 const birthday=profile?`${profile.birthday.season} ${profile.birthday.day}`:`${event.season} ${event.day}`;
 const facts=distinct([
  `Birthday: ${birthday}${event.minYear&&event.minYear>1?` (available from Year ${event.minYear})`:''}.`,
  profile?.address?`Home: ${profile.address}.`:'',
  profile?.occupation?`Role: ${profile.occupation}.`:'',
  profile?.roommate?'Relationship: can become the player’s roommate.':profile?.marriageable?'Relationship: marriage candidate.':'',
  profile?.availability??(event.requires?`Requires ${event.requires} access.`:''),
  profile?.loves.length?`Loved gifts include ${profile.loves.slice(0,2).join(' and ')}. Check the full gift list below for more choices.`:'',
  profile?.hates.length?`Hated gifts: ${profile.hates.join(', ')}.`:'',
  'Birthday gifts have a much larger effect on friendship, so choosing something they love is especially worthwhile.',
  'Use the gift guide below to check personal exceptions as well as the universal gift rules.'
 ]);
 const related=distinct(['Villagers','Friendship','Calendar',...(profile?.loves??[]).filter(name=>!!spriteFor(name)).slice(0,5)]);
 const keywords=distinct(['villager','npc','birthday',event.season,profile?.occupation??'',...(profile?.loves??[]),...(profile?.likes??[])]);
 return {id:'villager-'+slug(event.name),title:event.name,aliases:[event.name+' villager',event.name+' birthday',event.name+' gifts'],category:'Villagers',summary:profile?`${event.name} lives at ${profile.address} and is listed here as ${profile.occupation.toLowerCase()}. Their birthday is ${birthday}. ${profile.roommate?'You can invite Krobus to share your farmhouse as a roommate.':profile.marriageable?'You can pursue friendship and, eventually, marriage with this character.':'Build your friendship through conversations and gifts they enjoy.'}`:`A Stardew Valley character with a birthday on ${birthday}.`,facts,related,sprite,sources:[source(event.name),source('Friendship','Friendship & gift rules')],keywords};
}
function eventEntry(event:CalendarEvent):EncyclopediaEntry{
 const guide=festivalGuidance[event.name];
 const span=event.end&&event.end!==event.day?`${event.season} ${event.day}–${event.end}`:`${event.season} ${event.day}`;
 const sprite=event.type==='festival'?spriteFor(event.name)??spriteFor('Calendar'):spriteFor(event.name)??spriteFor('Calendar');
 const facts=[`Calendar: ${span}.`,guide?`Location: ${guide.location}. Entry window: ${guide.window}.`:'A seasonal calendar event tracked by Pelican Planner.',event.requires?`Requires ${event.requires} access.`:''];
 return {id:'event-'+slug(event.name),title:event.name,aliases:[event.name+' event'],category:'Events',summary:event.type==='festival'?`${event.name} takes place on ${span}.${guide?` Head to ${guide.location} during ${guide.window} to attend.`:''} Check the timing before setting out so you can finish farm chores around your visit.`:`${event.name} is a ${event.type} event on ${span}. Keep these dates in mind when planning your seasonal routine.`,facts:distinct(facts),related:['Festivals','Calendar'],sprite,sources:[source(event.name)],keywords:['event',event.type,event.season]};
}
function bundleEntry(bundle:Bundle):EncyclopediaEntry{
 const itemFacts=bundle.items.map(item=>`${item.count>1?item.count+' × ':''}${item.name}${item.quality?` (${qualityLabel(item.quality)} or better)`:''}`);
 return {id:'bundle-'+bundle.id,title:bundle.name,aliases:[bundle.name+' bundle',bundle.room+' '+bundle.name],category:'Bundles',summary:`${bundle.name} is part of the ${bundle.room} at the Community Center. ${bundle.required<bundle.items.length?`Choose ${bundle.required} of the ${bundle.items.length} options below; you do not need to donate every option.`:'You need to fill every listed slot to finish this bundle.'} Completing all the bundles in this room unlocks ${roomRewards[bundle.room]??'its room reward'}.`,facts:[`Room: ${bundle.room}. Reward for completing the room: ${roomRewards[bundle.room]??'See the Community Center page'}.`,`Required contribution: ${bundle.required} slot${bundle.required===1?'':'s'}.`,...itemFacts],related:distinct(['Bundles',bundle.room,...bundle.items.map(item=>item.name)]),sprite:'Bundle Green',sources:[source('Bundles')],keywords:['bundle','community center',bundle.room,...bundle.items.map(i=>i.name)]};
}

const bundleNamesByItem=new Map<string,string[]>();
for(const bundle of bundles)for(const item of bundle.items){const list=bundleNamesByItem.get(item.name)??[];list.push(bundle.name);bundleNamesByItem.set(item.name,list)}
const fishItemNames=new Set(bundles.filter(b=>b.room==='Fish Tank').flatMap(b=>b.items.map(i=>i.name)));
const toolNames=new Set(['Pickaxe','Watering Can','Quality Sprinkler']);
const systemNames=new Set(['Gold','Calendar','Bundle Green','Traveling Cart Icon','Silver Quality','Gold Quality','Iridium Quality']);
const cropNames=new Set(crops.map(c=>c.name));
const modeledFishNames=new Set(fish.map(f=>f.name));
function itemCategory(assetName:string,title:string):EncyclopediaCategory{
 if(assetName.endsWith(' Icon'))return 'Villagers';
 if(toolNames.has(title))return 'Tools & Gear';
 if(systemNames.has(assetName)||systemNames.has(title))return 'Places & Systems';
 if(fishItemNames.has(title)||modeledFishNames.has(title))return 'Fish';
 if(cropNames.has(title))return 'Crops';
 return 'Items';
}
function itemEntry(assetName:string,asset:AssetRecord):EncyclopediaEntry{
 const title=titleFromAsset(assetName);
 const obtain=obtainMethods(title);
 const bundlesFor=bundleNamesByItem.get(title)??[];
 const sourceUrl=asset.source_page_url||wiki(title);
 const facts=distinct([
  ...obtain,
  ...bundlesFor.map(name=>`Used in the ${name} bundle.`),
  
 ]);
 const category=itemCategory(assetName,title);
 const summary=obtain.length
  ?`${title}: ${obtain[0]}${bundlesFor.length?` Keep some for ${bundlesFor.slice(0,2).join(' and ')} as you work through the Community Center.`:''}`
  :`${title} is part of Stardew Valley’s ${category.toLowerCase()} collection.`;
 return {id:'item-'+slug(title),title,aliases:distinct([assetName,title+' item']),category,summary,facts,related:distinct([...(bundlesFor.length?bundlesFor:[]),category==='Fish'?'Fish':'']),sprite:assetName,sources:[{label:'Stardew Valley Wiki',url:sourceUrl},...(sourceUrl!==wiki(title)?[source(title,'Item page')]:[])],keywords:distinct([category.toLowerCase(),...bundlesFor])};
}

const referenceEntries:EncyclopediaEntry[]=[...treeReferenceEntries,...craftingReferenceEntries]
 .map(entry=>({id:`reference-${slug(entry.title)}`,title:entry.title,aliases:entry.aliases,category:entry.category,summary:entry.summary,facts:entry.facts,related:entry.related,sprite:spriteFor(entry.sprite),sources:[source(entry.wikiPage),{label:'Game-data cross-check',url:entry.category==='Trees'?'https://stardew.gs/trees/':'https://stardew.gs/recipes/'}],keywords:entry.keywords}));

const roomEntries:EncyclopediaEntry[]=Object.entries(roomRewards).map(([room,reward])=>({id:'room-'+slug(room),title:room,aliases:[room+' community center'],category:'Places & Systems',summary:`The ${room} contains ${bundles.filter(b=>b.room===room).length} standard bundles. Complete all of them to earn ${reward.toLowerCase()}. Use the bundle entries below to check each item and quantity before your next donation trip.`,facts:[`Room reward: ${reward}.`,...bundles.filter(b=>b.room===room).map(b=>`${b.name}: ${b.required} required contribution${b.required===1?'':'s'}.`)],related:['Community Center','Bundles',...bundles.filter(b=>b.room===room).map(b=>b.name)],sprite:'Bundle Green',sources:[source('Bundles')],keywords:['community center','room','bundle']}));

const specialItems:EncyclopediaEntry[]=[
 ['Seeds',['seed','crop seeds'],'Items','Plantable items used to start crops. Shop availability depends on the crop, season, year, and seller.',['Crops',"Pierre's General Store",'Traveling Cart'],'Parsnip','Seeds'],
 ['Crab Pot',['crab pots'],'Tools & Gear','A placeable fishing tool that catches certain shellfish, trash, and other items when baited.',['Fishing','Fish','Lobster','Crayfish'],'Crab','Crab_Pot'],
 ['Silo',['hay storage'],'Places & Systems','A farm building that stores Hay cut from grass, making animal feeding easier.',['Hay','Barn','Coop'],'Hay','Silo'],
 ['Barn',['animal barn'],'Places & Systems','A Robin-built farm building for cows and other barn animals, with upgrades expanding capacity and species options.',['Large Milk','Large Goat Milk','Truffle'],'Wood','Barn'],
 ['Coop',['chicken coop'],'Places & Systems','A Robin-built farm building for chickens and other coop animals, with upgrades expanding capacity and species options.',['Large Egg','Duck Egg','Rabbit\'s Foot'],'Wood','Coop'],
 ['Calendar',['town calendar'],'Places & Systems','The in-game calendar tracks birthdays and festivals. Pelican Planner also uses calendar data for deadlines and seasonal planning.',['Festivals','Villagers'],'Calendar','Calendar'],
].map(([title,aliases,category,summary,related,sprite,page])=>({id:'special-'+slug(title as string),title:title as string,aliases:aliases as string[],category:category as EncyclopediaCategory,summary:summary as string,facts:['Open the source page when online for the complete recipe, upgrade, price, or placement details.'],related:related as string[],sprite:spriteFor(sprite as string),sources:[source(page as string)],keywords:[...(aliases as string[]),category as string]}));


function enrichEntry(entry:EncyclopediaEntry):EncyclopediaEntry{
 const detail=entryDetails[entry.title];
 const usefulFacts=entry.facts.filter(f=>!f.startsWith('Exact damage, speed')&&!f.startsWith('Open the source page when online'));
 const giftLovers=Object.entries(villagerProfiles).filter(([,p])=>p.loves.includes(entry.title)).map(([name])=>name);
 const recipes=craftingReferenceEntries.filter(r=>r.related.includes(entry.title)&&r.title!==entry.title);
 const extras:string[]=[];
 if(entry.category==='Trees'&&entry.related.includes('Fruit Trees')){
  extras.push('Leave the eight tiles around the sapling clear while it matures. Fruit Trees do not need daily watering.');
  extras.push('A mature tree holds up to three fruit at once. Pick them regularly so it can keep producing.');
 }
 if(entry.category==='Crafting'){
  const unlock=entry.facts.find(f=>f.startsWith('Recipe source:'));
  if(unlock)extras.push(`Before gathering ingredients, make sure you have learned the recipe through ${unlock.slice(15).replace(/\.$/,'')}.`);
 }

 if(entry.category==='Items'||entry.category==='Fish'||entry.category==='Crops'||entry.category==='Crafting'){
  if(giftLovers.length)extras.push(`Loved by ${giftLovers.slice(0,2).join(' and ')}. See their profiles for birthday dates and other gift choices.`);
  if(recipes.length)extras.push(`Related crafting: ${recipes.slice(0,2).map(r=>r.title).join(' and ')}. Open those entries for recipe and unlock details.`);
 }
 return {...entry,summary:detail?.summary??entry.summary,facts:distinct([...usefulFacts,...(detail?.facts??[]),...extras]),related:distinct([...entry.related,...giftLovers.slice(0,2),...recipes.slice(0,2).map(r=>r.title)])};
}

const all:EncyclopediaEntry[]=[];
const byTitle=new Map<string,EncyclopediaEntry>();
function add(input:EncyclopediaEntry){const entry=enrichEntry(input);const key=entry.title.toLowerCase();if(byTitle.has(key))return;byTitle.set(key,entry);all.push({...entry,aliases:distinct(entry.aliases),facts:distinct(entry.facts),related:distinct(entry.related.filter(x=>x&&x.toLowerCase()!==entry.title.toLowerCase())),keywords:distinct(entry.keywords)})}
for(const entry of broad)add(entry);
for(const entry of referenceEntries)add(entry);
for(const crop of crops)add(cropEntry(crop));
for(const item of fish)add(fishEntry(item));
for(const event of events.filter(e=>e.type==='birthday'))add(villagerEntry(event));
for(const event of events.filter(e=>e.type!=='birthday'))add(eventEntry(event));
for(const bundle of bundles)add(bundleEntry(bundle));
for(const room of roomEntries)add(room);
for(const entry of curatedGear)add(entry);
for(const entry of specialItems)add(entry);
for(const [assetName,asset] of Object.entries(registry))add(itemEntry(assetName,asset));

export const encyclopediaEntries=all;
export const encyclopediaByTitle=new Map(encyclopediaEntries.map(entry=>[entry.title.toLowerCase(),entry]));
export const encyclopediaCategories:EncyclopediaCategory[]=['Overview','Crops','Fish','Villagers','Events','Bundles','Trees','Crafting','Items','Tools & Gear','Places & Systems'];

const inlineLinkEntries=encyclopediaEntries.filter(entry=>entry.sprite&&entry.title.length>2).sort((a,b)=>b.title.length-a.title.length);
const inlineTermLookup=new Map<string,EncyclopediaEntry>();
for(const entry of inlineLinkEntries){for(const term of [entry.title,...entry.aliases]){const key=term.toLowerCase();if(term.length>2&&!inlineTermLookup.has(key))inlineTermLookup.set(key,entry)}}
const escapeInlinePattern=(text:string)=>text.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const inlinePatternSource=[...inlineTermLookup.keys()].sort((a,b)=>b.length-a.length).map(escapeInlinePattern).join('|');
const isEntityWordChar=(char:string|undefined)=>!!char&&/[A-Za-z0-9]/.test(char);

export interface EncyclopediaInlineMatch{start:number;end:number;text:string;entry:EncyclopediaEntry}
export function findEncyclopediaInlineMatches(text:string):EncyclopediaInlineMatch[]{
 if(!text||!inlinePatternSource)return [];
 const pattern=new RegExp(`(${inlinePatternSource})`,'gi');
 const matches:EncyclopediaInlineMatch[]=[];
 let match:RegExpExecArray|null;
 while((match=pattern.exec(text))){
  const start=match.index,end=start+match[0].length;
  // Only link complete terms. This prevents Carp in Carpenter, Sap in Cindersap,
  // Shad in Shadow, Eel in Freelance, Mine/Cart in Minecarts, and similar collisions.
  if(isEntityWordChar(text[start-1])||isEntityWordChar(text[end]))continue;
  const entry=inlineTermLookup.get(match[0].toLowerCase());
  if(entry)matches.push({start,end,text:match[0],entry});
 }
 return matches;
}

export function normalizeEncyclopediaQuery(text:string){return text.toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9\s-]+/g,' ').replace(/\s+/g,' ').trim()}
function containsWholeNormalizedTerm(text:string,term:string){
 if(!term)return false;
 let start=text.indexOf(term);
 while(start!==-1){const end=start+term.length;if(!isEntityWordChar(text[start-1])&&!isEntityWordChar(text[end]))return true;start=text.indexOf(term,start+1)}
 return false;
}

type SearchRecord={entry:EncyclopediaEntry;title:string;aliases:string[];keywords:string[];body:string};
const searchRecords:SearchRecord[]=encyclopediaEntries.map(entry=>({
 entry,
 title:normalizeEncyclopediaQuery(entry.title),
 aliases:entry.aliases.map(normalizeEncyclopediaQuery),
 keywords:entry.keywords.map(normalizeEncyclopediaQuery),
 body:normalizeEncyclopediaQuery([entry.summary,...entry.facts,...entry.related].join(' ')),
}));
const searchRecordsByCategory=new Map<EncyclopediaCategory,SearchRecord[]>(encyclopediaCategories.map(category=>[category,searchRecords.filter(record=>record.entry.category===category)]));
const exactLookup=new Map<string,EncyclopediaEntry>();
for(const record of searchRecords){for(const key of [record.title,...record.aliases])if(key&&!exactLookup.has(key))exactLookup.set(key,record.entry)}

export function searchEncyclopedia(query:string,category?:EncyclopediaCategory|'All'){
 const q=normalizeEncyclopediaQuery(query);const words=q.split(' ').filter(Boolean);
 const pool=category&&category!=='All'?searchRecordsByCategory.get(category)??[]:searchRecords;
 if(!q)return pool.slice(0,24).map(record=>record.entry);
 const scored=pool.map(record=>{
  const {entry,title,aliases,keywords,body}=record;
  let score=0;let contextual=false;
  if(title===q)score=120;
  else if(aliases.includes(q))score=112;
  else if(title.startsWith(q))score=96;
  else if(aliases.some(x=>x.startsWith(q)))score=90;
  else if(title.includes(q))score=82;
  else if(aliases.some(x=>x.includes(q)))score=76;
  else if(keywords.includes(q))score=72;
  else if(keywords.some(x=>containsWholeNormalizedTerm(x,q)))score=64;
  else if(words.length&&words.every(word=>title.includes(word)||aliases.some(x=>x.includes(word))||keywords.some(x=>containsWholeNormalizedTerm(x,word))||containsWholeNormalizedTerm(body,word))){score=48;contextual=true}
  else if(containsWholeNormalizedTerm(body,q)){score=32;contextual=true}
  return {entry,score,contextual};
 }).filter(item=>item.score>0).sort((a,b)=>b.score-a.score||a.entry.title.localeCompare(b.entry.title));
 const direct=scored.filter(item=>!item.contextual);
 const contextual=scored.filter(item=>item.contextual);
 // When a broad term already has plenty of direct matches, do not swamp the chooser
 // with every entry that merely mentions it in a bundle, recipe, or related link.
 return (direct.length>=12?direct:[...direct,...contextual.slice(0,Math.max(0,36-direct.length))]).map(item=>item.entry);
}
export function exactEncyclopediaMatch(query:string){return exactLookup.get(normalizeEncyclopediaQuery(query))}
export function encyclopediaSpritePath(entry:EncyclopediaEntry){if(!entry.sprite)return null;const record=registry[entry.sprite]??registry[entry.sprite+' Icon'];return record?.local_path??null}
export function relatedEncyclopediaEntries(entry:EncyclopediaEntry){return entry.related.map(name=>encyclopediaByTitle.get(name.toLowerCase())).filter((item):item is EncyclopediaEntry=>!!item)}

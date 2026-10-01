export const SEASONS = ['Spring', 'Summer', 'Fall', 'Winter'] as const;
export type Season = typeof SEASONS[number];
export const DAYS_PER_SEASON = 28;
export const SOURCE_ROOT = 'https://stardewvalleywiki.com/';
export const wiki = (name: string) => SOURCE_ROOT + encodeURIComponent(name.replaceAll(' ', '_'));
export interface Crop { name: string; seasons: Season[]; days: number; regrow: number; seed: number; sell: number; yield: number; fruit?: boolean; note?: string; buyable?:boolean }
export const crops: Crop[] = [
 {name:'Parsnip',seasons:['Spring'],days:4,regrow:0,seed:20,sell:35,yield:1},
 {name:'Green Bean',seasons:['Spring'],days:10,regrow:3,seed:60,sell:40,yield:1,note:'Trellis crop. Leave a path to reach it.'},
 {name:'Cauliflower',seasons:['Spring'],days:12,regrow:0,seed:80,sell:175,yield:1},
 {name:'Potato',seasons:['Spring'],days:6,regrow:0,seed:50,sell:80,yield:1,note:'Conservative estimate: one potato per harvest; random extras excluded.'},
 {name:'Strawberry',seasons:['Spring'],days:8,regrow:4,seed:100,sell:120,yield:1,fruit:true,note:'Seeds sold at the Egg Festival on Spring 13. Earlier planting requires saved seeds.'},
 {name:'Blueberry',seasons:['Summer'],days:13,regrow:4,seed:80,sell:50,yield:3,fruit:true},
 {name:'Melon',seasons:['Summer'],days:12,regrow:0,seed:80,sell:250,yield:1,fruit:true},
 {name:'Tomato',seasons:['Summer'],days:11,regrow:4,seed:50,sell:60,yield:1},
 {name:'Hot Pepper',seasons:['Summer'],days:5,regrow:3,seed:40,sell:40,yield:1,fruit:true},
 {name:'Corn',seasons:['Summer','Fall'],days:14,regrow:4,seed:150,sell:50,yield:1},
 {name:'Cranberries',seasons:['Fall'],days:7,regrow:5,seed:240,sell:75,yield:2,fruit:true},
 {name:'Pumpkin',seasons:['Fall'],days:13,regrow:0,seed:100,sell:320,yield:1},
 {name:'Eggplant',seasons:['Fall'],days:5,regrow:5,seed:20,sell:60,yield:1},
 {name:'Yam',seasons:['Fall'],days:10,regrow:0,seed:60,sell:160,yield:1},
 {name:'Bok Choy',seasons:['Fall'],days:4,regrow:0,seed:50,sell:80,yield:1},
 {name:'Wheat',seasons:['Summer','Fall'],days:4,regrow:0,seed:10,sell:25,yield:1,note:'Random hay excluded.'},
 {name:'Garlic',seasons:['Spring'],days:4,regrow:0,seed:40,sell:60,yield:1},
 {name:'Kale',seasons:['Spring'],days:6,regrow:0,seed:70,sell:110,yield:1},
 {name:'Rhubarb',seasons:['Spring'],days:13,regrow:0,seed:100,sell:220,yield:1,fruit:true},
 {name:'Radish',seasons:['Summer'],days:6,regrow:0,seed:40,sell:90,yield:1},
 {name:'Red Cabbage',seasons:['Summer'],days:9,regrow:0,seed:100,sell:260,yield:1},
 {name:'Starfruit',seasons:['Summer'],days:13,regrow:0,seed:400,sell:750,yield:1,fruit:true},
 {name:'Artichoke',seasons:['Fall'],days:8,regrow:0,seed:30,sell:160,yield:1},
 {name:'Beet',seasons:['Fall'],days:6,regrow:0,seed:20,sell:100,yield:1},
 {name:'Amaranth',seasons:['Fall'],days:7,regrow:0,seed:70,sell:150,yield:1},
 {name:'Grape',seasons:['Summer','Fall'],days:10,regrow:3,seed:60,sell:80,yield:1,fruit:true,note:'Trellis crop. Leave a path to reach it.'},
 {name:'Sunflower',seasons:['Summer','Fall'],days:8,regrow:0,seed:200,sell:80,yield:1},
 {name:'Ancient Fruit',seasons:['Spring','Summer','Fall'],days:28,regrow:7,seed:0,sell:550,yield:1,fruit:true,buyable:false,note:'Not sold as a seed. Use a seed maker or an existing seed.'},
 {name:'Sweet Gem Berry',seasons:['Fall'],days:24,regrow:0,seed:1000,sell:3000,yield:1,fruit:true,buyable:false,note:'Rare Seed is sold by the Traveling Cart.'},
 {name:'Carrot',seasons:['Spring'],days:3,regrow:0,seed:15,sell:35,yield:1,buyable:false,note:'Carrot Seeds are not sold in shops.'},
 {name:'Summer Squash',seasons:['Summer'],days:6,regrow:3,seed:20,sell:45,yield:1,buyable:false,note:'Seeds are not sold in shops.'},
 {name:'Broccoli',seasons:['Fall'],days:8,regrow:4,seed:30,sell:70,yield:1,buyable:false,note:'Seeds are not sold in shops.'},
 {name:'Powdermelon',seasons:['Winter'],days:7,regrow:0,seed:20,sell:60,yield:1,buyable:false,note:'Seeds are not sold in shops.'},

];
export interface BundleItem { name: string; count: number; quality: number }
export interface Bundle { id: string; room: string; name: string; required: number; items: BundleItem[]; season?: Season }
const items=(names:string):BundleItem[]=>names.split('|').map(text=>{const [name,count='1',quality='0']=text.split(':');return {name,count:Number(count),quality:Number(quality)}});
const b=(id:string,room:string,name:string,names:string,required?:number,season?:Season):Bundle=>({id,room,name,items:items(names),required:required??names.split('|').length,season});
export const bundles:Bundle[] = [
 b('spring-forage','Crafts Room','Spring Foraging','Wild Horseradish|Daffodil|Leek|Dandelion',undefined,'Spring'),
 b('summer-forage','Crafts Room','Summer Foraging','Grape|Spice Berry|Sweet Pea',undefined,'Summer'),
 b('fall-forage','Crafts Room','Fall Foraging','Common Mushroom|Wild Plum|Hazelnut|Blackberry',undefined,'Fall'),
 b('winter-forage','Crafts Room','Winter Foraging','Winter Root|Crystal Fruit|Snow Yam|Crocus',undefined,'Winter'),
 b('construction','Crafts Room','Construction','Wood:99|Wood:99|Stone:99|Hardwood:10'),
 b('exotic','Crafts Room','Exotic Foraging','Coconut|Cactus Fruit|Cave Carrot|Red Mushroom|Purple Mushroom|Maple Syrup|Oak Resin|Pine Tar|Morel',5),
 b('spring-crop','Pantry','Spring Crops','Parsnip|Green Bean|Cauliflower|Potato',undefined,'Spring'),
 b('summer-crop','Pantry','Summer Crops','Tomato|Hot Pepper|Blueberry|Melon',undefined,'Summer'),
 b('fall-crop','Pantry','Fall Crops','Corn|Eggplant|Pumpkin|Yam',undefined,'Fall'),
 b('quality','Pantry','Quality Crops','Parsnip:5:2|Melon:5:2|Pumpkin:5:2|Corn:5:2',3),
 b('animal','Pantry','Animal','Large Milk|Large Brown Egg|Large Egg|Large Goat Milk|Wool|Duck Egg',5),
 b('artisan','Pantry','Artisan','Truffle Oil|Cloth|Goat Cheese|Cheese|Honey|Jelly|Apple|Apricot|Orange|Peach|Pomegranate|Cherry',6),
 b('river','Fish Tank','River Fish','Sunfish|Catfish|Shad|Tiger Trout'),
 b('lake','Fish Tank','Lake Fish','Largemouth Bass|Carp|Bullhead|Sturgeon'),
 b('ocean','Fish Tank','Ocean Fish','Sardine|Tuna|Red Snapper|Tilapia'),
 b('night','Fish Tank','Night Fishing','Walleye|Bream|Eel'),
 b('specialty','Fish Tank','Specialty Fish','Pufferfish|Ghostfish|Sandfish|Woodskip'),
 b('crab','Fish Tank','Crab Pot','Lobster|Crayfish|Crab|Cockle|Mussel|Shrimp|Snail|Periwinkle|Oyster|Clam',5),
 b('blacksmith','Boiler Room',"Blacksmith's",'Copper Bar|Iron Bar|Gold Bar'),
 b('geologist','Boiler Room',"Geologist's",'Quartz|Earth Crystal|Frozen Tear|Fire Quartz'),
 b('adventurer','Boiler Room',"Adventurer's",'Slime:99|Bat Wing:10|Solar Essence|Void Essence',2),
 b('chef','Bulletin Board',"Chef's",'Maple Syrup|Fiddlehead Fern|Truffle|Poppy|Maki Roll|Fried Egg'),
 b('dye','Bulletin Board','Dye','Red Mushroom|Sea Urchin|Sunflower|Duck Feather|Aquamarine|Red Cabbage'),
 b('research','Bulletin Board','Field Research','Purple Mushroom|Nautilus Shell|Chub|Frozen Geode'),
 b('fodder','Bulletin Board','Fodder','Wheat:10|Hay:10|Apple:3'),
 b('enchanter','Bulletin Board',"Enchanter's",'Oak Resin|Wine|Rabbit’s Foot|Pomegranate'),
 ...[2500,5000,10000,25000].map(g=>b('vault-'+g,'Vault',g.toLocaleString('en-US')+'g','Gold:'+g)),
];
export const roomRewards:Record<string,string>={'Crafts Room':'Bridge repair','Pantry':'Greenhouse','Fish Tank':'Glittering Boulder removed','Boiler Room':'Minecarts repaired','Bulletin Board':'Friendship','Vault':'Bus repair'};
export interface Fish {name:string; seasons:Season[]; weather:'Any'|'Rain'|'Sun'; start:number; end:number; location:string}
export const fish:Fish[]=[
 {name:'Sunfish',seasons:['Spring','Summer'],weather:'Sun',start:6,end:19,location:'River'},
 {name:'Catfish',seasons:['Spring','Fall'],weather:'Rain',start:6,end:24,location:'River'},
 {name:'Shad',seasons:['Spring','Summer','Fall'],weather:'Rain',start:9,end:26,location:'River'},
 {name:'Tiger Trout',seasons:['Fall','Winter'],weather:'Any',start:6,end:19,location:'River'},
 {name:'Largemouth Bass',seasons:[...SEASONS],weather:'Any',start:6,end:19,location:'Mountain Lake'},
 {name:'Carp',seasons:['Spring','Summer','Fall'],weather:'Any',start:6,end:26,location:'Mountain Lake'},
 {name:'Bullhead',seasons:[...SEASONS],weather:'Any',start:6,end:26,location:'Mountain Lake'},
 {name:'Sturgeon',seasons:['Summer','Winter'],weather:'Any',start:6,end:19,location:'Mountain Lake'},
 {name:'Sardine',seasons:['Spring','Fall','Winter'],weather:'Any',start:6,end:19,location:'Ocean'},
 {name:'Tuna',seasons:['Summer','Winter'],weather:'Any',start:6,end:19,location:'Ocean'},
 {name:'Red Snapper',seasons:['Summer','Fall'],weather:'Rain',start:6,end:19,location:'Ocean'},
 {name:'Tilapia',seasons:['Summer','Fall'],weather:'Any',start:6,end:14,location:'Ocean'},
 {name:'Walleye',seasons:['Fall'],weather:'Rain',start:12,end:26,location:'River / Mountain Lake'},
 {name:'Bream',seasons:[...SEASONS],weather:'Any',start:18,end:26,location:'River'},
 {name:'Eel',seasons:['Spring','Fall'],weather:'Rain',start:16,end:26,location:'Ocean'},
 {name:'Pufferfish',seasons:['Summer'],weather:'Sun',start:12,end:16,location:'Ocean'},
];
export interface CalendarEvent {name:string;season:Season;day:number;type:'festival'|'birthday'|'forage';end?:number;minYear?:number;requires?:string}
export const events:CalendarEvent[]=[
 ...(['Spring','Summer','Fall','Winter'] as Season[]).flatMap((season,i)=>[
 ['Kent:4','Lewis:7','Vincent:10','Haley:14','Pam:18','Shane:20','Pierre:26','Emily:27'],
 ['Jas:4','Gus:8','Maru:10','Alex:13','Sam:17','Demetrius:19','Dwarf:22','Willy:24','Leo:26'],
 ['Penny:2','Elliott:5','Jodi:11','Abigail:13','Sandy:15','Marnie:18','Robin:21','George:24'],
 ['Krobus:1','Linus:3','Caroline:7','Sebastian:10','Harvey:14','Wizard:17','Evelyn:20','Leah:23','Clint:26']][i].map(s=>{const[name,d]=s.split(':');return {name,day:Number(d),season,type:'birthday' as const,minYear:name==='Kent'?2:1,requires:name==='Leo'?'Island':undefined}})),
 {name:'Egg Festival',season:'Spring',day:13,type:'festival'},
 {name:'Desert Festival',season:'Spring',day:15,end:17,type:'festival',requires:'Bus'},
 {name:'Flower Dance',season:'Spring',day:24,type:'festival'},
 {name:'Salmonberry season',season:'Spring',day:15,end:18,type:'forage'},
 {name:'Luau',season:'Summer',day:11,type:'festival'},
 {name:'Trout Derby',season:'Summer',day:20,end:21,type:'festival'},
 {name:'Dance of the Moonlight Jellies',season:'Summer',day:28,type:'festival'},
 {name:'Stardew Valley Fair',season:'Fall',day:16,type:'festival'},
 {name:'Spirit’s Eve',season:'Fall',day:27,type:'festival'},
 {name:'Blackberry season',season:'Fall',day:8,end:11,type:'forage'},
 {name:'Festival of Ice',season:'Winter',day:8,type:'festival'},
 {name:'SquidFest',season:'Winter',day:12,end:13,type:'festival'},
 {name:'Night Market',season:'Winter',day:15,end:17,type:'festival'},
 {name:'Feast of the Winter Star',season:'Winter',day:25,type:'festival'},
];
export const FARM_TYPES=['Standard','Riverland','Forest','Hill-top','Wilderness','Four Corners','Beach','Meadowlands'] as const;
export const LEVELS=['Relaxed','Guided','Efficient','Highly Optimized','Min-Max'] as const;
export const GOALS=['Balanced','Community Center','Maximum Profit','Fast Greenhouse','Mining','Friendship','Low Effort'] as const;
export const purchaseOptions=[
 {name:'Backpack (24 slots)',gold:2000,resources:{},benefit:'Carry 12 more items. Available at Pierre’s.'},
 {name:'Copper Pickaxe',gold:2000,resources:{'Copper Bar':5},benefit:'A mining upgrade. Clint holds the tool for two days.'},
 {name:'Steel Pickaxe',gold:5000,resources:{'Iron Bar':5},benefit:'Requires a copper pickaxe. Clint holds the tool for two days.'},
 {name:'Coop',gold:4000,resources:{Wood:300,Stone:100},benefit:'Houses 4 coop animals. Allow 3 days for construction; animals cost extra.'},
 {name:'Barn',gold:6000,resources:{Wood:350,Stone:150},benefit:'Houses 4 barn animals. Allow 3 days for construction; animals cost extra.'},
];

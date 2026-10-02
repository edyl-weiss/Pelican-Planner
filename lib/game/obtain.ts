import {crops,fish} from './data';

export interface ObtainContext { year?: number }

const fixed:Record<string,string[]>= {
 'Wild Horseradish':['Forage in Spring around the Mountain, Backwoods, Forest, or Bus Stop.'],
 'Daffodil':['Forage in Spring around Pelican Town or the Bus Stop.','Also sold by Pierre during the Flower Dance.'],
 'Leek':['Forage in Spring around the Mountain, Backwoods, or Bus Stop.'],
 'Dandelion':['Forage in Spring around the Bus Stop or Railroad.','Also sold by Pierre during the Flower Dance.'],
 'Spice Berry':['Forage in Summer around the Mountain, Backwoods, Bus Stop, or Railroad.'],
 'Sweet Pea':['Forage in Summer around Pelican Town, the Bus Stop, or Railroad.'],
 'Common Mushroom':['Forage in Fall; also found in the Secret Woods or a mushroom Farm Cave.'],
 'Wild Plum':['Forage in Fall around the Mountain, Backwoods, Bus Stop, or Railroad.'],
 'Hazelnut':['Forage in Fall around the Mountain, Backwoods, Bus Stop, or Railroad.'],
 'Blackberry':['Forage in Fall; bushes produce them during Blackberry season.'],
 'Winter Root':['Dig Artifact Spots or tillable soil in Winter; also dropped by Blue Slimes.'],
 'Crystal Fruit':['Forage in Winter around the Mountain, Bus Stop, Railroad, or Backwoods.'],
 'Snow Yam':['Dig Artifact Spots or tillable soil in Winter.'],
 'Crocus':['Forage in Winter around Pelican Town, the Mountain, Bus Stop, Railroad, or Backwoods.'],
 'Wood':['Chop trees, stumps, branches, or buy from Robin.'],
 'Stone':['Break rocks in the Mines or around the farm; also sold by Robin.'],
 'Hardwood':['Break Large Stumps/Logs with upgraded axes; the Secret Woods has renewable stumps.'],
 'Coconut':['Forage in the Calico Desert; can also appear at the Traveling Cart.'],
 'Cactus Fruit':['Forage in the Calico Desert or grow indoors from Cactus Seeds sold at the Oasis.'],
 'Cave Carrot':['Hoe dirt patches or break containers in the Mines.'],
 'Red Mushroom':['Forage in the Mines or Secret Woods; also from a mushroom Farm Cave or Mushroom Trees.'],
 'Purple Mushroom':['Find in the Mines; also from a mushroom Farm Cave or Forest Farm in Fall.'],
 'Maple Syrup':['Place a Tapper on a Maple Tree.'],
 'Oak Resin':['Place a Tapper on an Oak Tree.'],
 'Pine Tar':['Place a Tapper on a Pine Tree.'],
 'Morel':['Forage in the Secret Woods in Spring; also from a mushroom Farm Cave.'],
 'Large Milk':['Raise a happy adult Cow and milk it.'],
 'Large Brown Egg':['Raise a happy adult Brown Chicken.'],
 'Large Egg':['Raise a happy adult White Chicken.'],
 'Large Goat Milk':['Raise a happy adult Goat and milk it.'],
 'Wool':['Produced by Sheep or Rabbits.'],
 'Duck Egg':['Produced by adult Ducks.'],
 'Truffle Oil':['Put a Truffle from a Pig into an Oil Maker.'],
 'Cloth':['Process Wool in a Loom.','Can also come from recycling Soggy Newspaper or Mummy drops in Skull Cavern.'],
 'Goat Cheese':['Process Goat Milk in a Cheese Press.'],
 'Cheese':['Process Milk in a Cheese Press.','Also traded by the Desert Trader.'],
 'Honey':['Produced by a Bee House.','Can also be bought at the Oasis.'],
 'Jelly':['Put fruit into a Preserves Jar.'],
 'Apple':['Harvest an Apple Tree in Fall or use the fruit-bat Farm Cave.'],
 'Apricot':['Harvest an Apricot Tree in Spring or use the fruit-bat Farm Cave.'],
 'Orange':['Harvest an Orange Tree in Summer or use the fruit-bat Farm Cave.'],
 'Peach':['Harvest a Peach Tree in Summer or use the fruit-bat Farm Cave.'],
 'Pomegranate':['Harvest a Pomegranate Tree in Fall or use the fruit-bat Farm Cave.'],
 'Cherry':['Harvest a Cherry Tree in Spring or use the fruit-bat Farm Cave.'],
 'Lobster':['Catch with a Crab Pot placed in the ocean.'],
 'Crayfish':['Catch with a Crab Pot placed in freshwater.'],
 'Crab':['Catch with an ocean Crab Pot.','Also dropped by Rock Crabs and Lava Crabs in the Mines.'],
 'Cockle':['Catch with an ocean Crab Pot or forage on the Beach.'],
 'Mussel':['Catch with an ocean Crab Pot or forage on the Beach.'],
 'Shrimp':['Catch with a Crab Pot placed in the ocean.'],
 'Snail':['Catch with a Crab Pot placed in freshwater.'],
 'Periwinkle':['Catch with a Crab Pot placed in freshwater.'],
 'Oyster':['Catch with an ocean Crab Pot or forage on the Beach.'],
 'Clam':['Catch with an ocean Crab Pot or forage on the Beach.'],
 'Ghostfish':['Fish on Mines floors 20 or 60 at any time.','Ghosts can also drop one.'],
 'Sandfish':['Fish in the Calico Desert pond, 6am–8pm, any season.'],
 'Woodskip':['Fish in the Secret Woods at any time; also available on the Forest Farm.'],
 'Copper Bar':['Smelt Copper Ore in a Furnace.'],
 'Iron Bar':['Smelt Iron Ore in a Furnace; Transmute (Fe) is another option.'],
 'Gold Bar':['Smelt Gold Ore in a Furnace; Transmute (Au) is another option.'],
 'Quartz':['Forage throughout the Mines.'],
 'Earth Crystal':['Find on Mines floors 1–39, in Geodes, or from Duggies.'],
 'Frozen Tear':['Find on Mines floors 41–79, in Frozen/Omni Geodes, or from Dust Sprites.'],
 'Fire Quartz':['Find on Mines floors 81–119 or in Magma/Omni Geodes.'],
 'Slime':['Dropped by Slimes.'],
 'Bat Wing':['Dropped by Bats in the Mines or Skull Cavern.'],
 'Solar Essence':['Dropped by Ghosts, Squid Kids, or Metal Heads in the Mines; also Mummies/Iridium Bats in Skull Cavern.','Can be bought from Krobus.'],
 'Void Essence':['Dropped by Shadow Brutes/Shamans in the Mines or Serpents in Skull Cavern.','Can be bought from Krobus.'],
 'Fiddlehead Fern':['Forage in the Secret Woods in Summer.','Also found on Prehistoric Skull Cavern floors or from Green Rain Trees.'],
 'Truffle':['Let an adult Pig outside on a non-rainy day.'],
 'Maki Roll':['Cook it after learning the recipe from The Queen of Sauce or the Stardrop Saloon.'],
 'Fried Egg':['Cook an Egg in a kitchen or Cookout Kit.'],
 'Sea Urchin':['Forage on the east side of the Beach after repairing the bridge; also available on Beach Farm.'],
 'Duck Feather':['Produced by happy adult Ducks.'],
 'Aquamarine':['Mine Aquamarine Nodes, break Mines boxes, or find in Fishing Treasure Chests.'],
 'Nautilus Shell':['Forage on the Beach in Winter; Beach Farm can produce it in any season.'],
 'Chub':['Fish in the Mountain Lake or Forest River, any season and any time.'],
 'Frozen Geode':['Break rocks on Mines floors 41–79.'],
 'Hay':['Buy from Marnie’s Ranch or the Desert Trader.','Harvest Grass with a scythe when you have a Silo; Wheat can also yield Hay.'],
 'Wine':['Put fruit into a Keg.'],
 "Rabbit's Foot":['Produced by happy adult Rabbits.','Rarely dropped by Serpents in Skull Cavern.'],
 'Rabbit’s Foot':['Produced by happy adult Rabbits.','Rarely dropped by Serpents in Skull Cavern.'],
 'Gold':['Earn gold by selling items, completing quests, fishing, farming, mining, and other activities.'],
 'Quality Sprinkler':['Craft after reaching Farming level 6 using 1 Iron Bar, 1 Gold Bar, and 1 Refined Quartz.'],
 'Watering Can':['You start with a Watering Can. Upgrade it at the Blacksmith using bars and gold.'],
 'Backpack':['Buy backpack upgrades from Pierre’s General Store.'],
 'Copper Pickaxe':['Upgrade your Pickaxe at the Blacksmith with 5 Copper Bars and 2,000g.'],
 'Steel Pickaxe':['Upgrade a Copper Pickaxe at the Blacksmith with 5 Iron Bars and 5,000g.'],
};

const pierreYear2=new Set(['Garlic','Artichoke','Red Cabbage']);
const oasis=new Set(['Rhubarb','Starfruit','Beet']);
const seedSpot=new Set(['Carrot','Summer Squash','Broccoli','Powdermelon']);
const standardPierre=new Set(crops.filter(c=>c.buyable!==false&&!oasis.has(c.name)&&c.name!=='Strawberry'&&c.name!=='Sweet Gem Berry'&&c.name!=='Ancient Fruit').map(c=>c.name));

function cropMethods(name:string,context:ObtainContext):string[]|undefined{
 const crop=crops.find(c=>c.name===name);if(!crop)return undefined;
 if(name==='Grape')return ['Forage wild Grapes in Summer.','Or grow Grape Starter in Fall; the starter is sold at Pierre’s.'];
 if(name==='Strawberry')return ['Grow from Strawberry Seeds sold at the Egg Festival on Spring 13.','Saved seeds or Seed Maker seeds can be planted earlier in later years.'];
 if(oasis.has(name))return [`Grow from ${name} Seeds bought at the Oasis in the Calico Desert.`,'The Traveling Cart can occasionally sell the seeds too.'];
 if(name==='Sweet Gem Berry')return ['Grow from a Rare Seed, sold by the Traveling Cart in Spring and Summer.'];
 if(name==='Ancient Fruit')return ['Grow from Ancient Seeds. Donate the Ancient Seed artifact to the Museum to unlock the seed recipe.','A Seed Maker can make more seeds from Ancient Fruit.'];
 if(seedSpot.has(name))return [`Grow from ${name} Seeds found by digging Seed Spots.`,'Mystery Boxes can also contain the seasonal seeds; they are not sold in normal shops.'];
 if(standardPierre.has(name)){
  if(pierreYear2.has(name)&&((context.year??1)<2)){
   if(name==='Red Cabbage')return ['Pierre’s General Store sells Red Cabbage Seeds starting in Year 2.','In Year 1, check the Traveling Cart. Red Cabbage Seeds can also drop in Skull Cavern from Mummies, Serpents, or first-generation Purple Slimes.'];
   if(name==='Artichoke')return ['Pierre’s General Store sells Artichoke Seeds starting in Year 2.','Before Year 2, check the Traveling Cart. Mixed Seeds can also grow an Artichoke in Fall; use that crop in a Seed Maker for seeds.'];
   return [`Pierre’s General Store sells ${name} Seeds starting in Year 2.`,`Before Year 2, check the Traveling Cart.`];
  }
  return [`Grow from ${name} Seeds sold at Pierre’s General Store during its growing season.`];
 }
 return [`Grow or obtain ${name} through its normal seasonal source.`];
}

function fishMethods(name:string):string[]|undefined{
 const f=fish.find(x=>x.name===name);if(!f)return undefined;
 const weather=f.weather==='Any'?'any weather':f.weather==='Rain'?'rain':'sunny or windy weather';
 return [`Fish at ${f.location}, ${formatHour(f.start)}–${formatHour(f.end)}, during ${f.seasons.join(' / ')} in ${weather}.`];
}
function formatHour(hour:number){const h=hour%24;const suffix=h<12?'am':'pm';const display=h%12||12;return `${display}${suffix}`;}

export function obtainMethods(name:string,context:ObtainContext={}):string[]{
 return cropMethods(name,context)??fishMethods(name)??fixed[name]??[];
}

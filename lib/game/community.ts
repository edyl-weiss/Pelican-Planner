export const communityRoomImages=[
 {name:'Crafts Room',src:'https://stardewvalleywiki.com/mediawiki/images/1/11/Community_Center_Crafts_Room.png'},
 {name:'Pantry',src:'https://stardewvalleywiki.com/mediawiki/images/f/f0/Community_Center_Pantry.png'},
 {name:'Fish Tank',src:'https://stardewvalleywiki.com/mediawiki/images/0/0c/Community_Center_Fish_Tank.png'},
 {name:'Boiler Room',src:'https://stardewvalleywiki.com/mediawiki/images/7/7d/Community_Center_Boiler_Room.png'},
 {name:'Bulletin Board',src:'https://stardewvalleywiki.com/mediawiki/images/5/53/Community_Center_Bulletin_Board.png'},
 {name:'Vault',src:'https://stardewvalleywiki.com/mediawiki/images/5/59/Community_Center_Vault.png'},
] as const;

export const communityRoomImageByName:Record<string,string>=Object.fromEntries(
 communityRoomImages.map(({name,src})=>[name,src]),
);

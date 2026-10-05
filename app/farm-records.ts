import type {RecordKind} from '@/lib/game/activity';

export const recordNames:Record<RecordKind,[string,string]>={
 income:['Highest daily earnings','单日最高收入'],
 harvest:['Largest daily harvest','单日最多收获'],
 fish:['Most fish in a day','单日最多钓鱼'],
 mine:['Fastest daily mine progress','单日矿井进度纪录'],
};

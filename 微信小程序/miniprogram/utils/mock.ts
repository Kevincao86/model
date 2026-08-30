import { assetUrl } from './oss'

export type CoverKey = 'tea' | 'lake' | 'book' | 'food' | 'park' | 'movie'

export interface Merchant {
  id: string
  name: string
  cat: string
  dist: string
  area: string
  tag: string
  price: string
  score: string
  hours: string
  dish: string
  cover: CoverKey
  locked: boolean
  image: string
}

function withImage<T extends { cover: CoverKey }>(item: T): T & { image: string } {
  return { ...item, image: assetUrl(item.cover) }
}

export const cats = [
  { id: 'food', name: '餐饮', short: '餐', cover: 'tea' as CoverKey, image: assetUrl('tea') },
  { id: 'spot', name: '景区', short: '雁', cover: 'lake' as CoverKey, image: assetUrl('lake') },
  { id: 'kid', name: '亲子', short: '娃', cover: 'park' as CoverKey, image: assetUrl('park') },
  { id: 'movie', name: '影院', short: '影', cover: 'movie' as CoverKey, image: assetUrl('movie') },
  { id: 'pack', name: '套餐', short: '套', cover: 'food' as CoverKey, image: assetUrl('food') },
  { id: 'wheel', name: '转盘', short: '转', cover: 'book' as CoverKey, image: assetUrl('book') },
]

export const gridCats = [
  { id: 'food', name: '美食', cover: 'tea' as CoverKey, image: assetUrl('tea') },
  { id: 'night', name: '夜宵', cover: 'food' as CoverKey, image: assetUrl('food') },
  { id: 'spot', name: '南雁', cover: 'lake' as CoverKey, image: assetUrl('lake') },
  { id: 'kid', name: '亲子', cover: 'park' as CoverKey, image: assetUrl('park') },
  { id: 'movie', name: '电影', cover: 'movie' as CoverKey, image: assetUrl('movie') },
  { id: 'pack', name: '套餐', cover: 'food' as CoverKey, image: assetUrl('food') },
  { id: 'tea', name: '茶馆', cover: 'tea' as CoverKey, image: assetUrl('tea') },
  { id: 'book', name: '非遗', cover: 'book' as CoverKey, image: assetUrl('book') },
  { id: 'ticket', name: '南麂', cover: 'lake' as CoverKey, image: assetUrl('lake') },
  { id: 'wheel', name: '转盘', cover: 'book' as CoverKey, image: assetUrl('book') },
]

export const merchants: Merchant[] = [
  {
    id: '1',
    name: '昆阳茶寮',
    cat: '餐饮',
    dist: '0.4km',
    area: '昆阳 · 人民路',
    tag: '首次锁客',
    price: '人均 58',
    score: '4.8',
    hours: '10:00–22:00',
    dish: '平阳黄汤 · 鱼丸',
    cover: 'tea',
    locked: true,
  },
  {
    id: '2',
    name: '南麂列岛船票',
    cat: '景区',
    dist: '18km',
    area: '鳌江 · 码头',
    tag: '门票核销',
    price: '船票 120',
    score: '4.9',
    hours: '07:30–16:00',
    dish: '岛际航线',
    cover: 'lake',
    locked: false,
  },
  {
    id: '3',
    name: '南雁非遗馆',
    cat: '景区',
    dist: '1.2km',
    area: '昆阳 · 南雁',
    tag: '积分抵现',
    price: '文创 42',
    score: '4.7',
    hours: '08:30–17:00',
    dish: '畲乡手作',
    cover: 'book',
    locked: false,
  },
  {
    id: '4',
    name: '鳌江夜市',
    cat: '餐饮',
    dist: '0.8km',
    area: '鳌江 · 滨江',
    tag: '买单推券',
    price: '人均 48',
    score: '4.6',
    hours: '18:00–02:00',
    dish: '灯盏糕 · 生蚝',
    cover: 'food',
    locked: true,
  },
  {
    id: '5',
    name: '南雁亲子谷',
    cat: '亲子',
    dist: '14km',
    area: '山门 · 南雁荡',
    tag: '套餐卡',
    price: '亲子 158',
    score: '4.8',
    hours: '09:30–18:00',
    dish: '溪谷 + 小火车',
    cover: 'park',
    locked: false,
  },
  {
    id: '6',
    name: '昆阳影城',
    cat: '影院',
    dist: '1.6km',
    area: '昆阳 · 广场',
    tag: '关联券',
    price: '电影 42',
    score: '4.5',
    hours: '10:00–24:00',
    dish: '巨幕厅',
    cover: 'movie',
    locked: false,
  },
].map(withImage)

export const packs = [
  {
    id: 'p1',
    name: '昆阳美食三店通',
    shops: '昆阳茶寮 / 鳌江夜市 / 水头甜品',
    price: '199',
    origin: '268',
    cover: 'food' as CoverKey,
    image: assetUrl('food'),
  },
  {
    id: 'p2',
    name: '南雁亲子两日',
    shops: '南麂船票 + 南雁亲子谷',
    price: '298',
    origin: '360',
    cover: 'park' as CoverKey,
    image: assetUrl('park'),
  },
]

export const coupons = [
  { id: 'c1', title: '满 100 减 20', shop: '昆阳茶寮', expire: '7 天内', off: '20', cover: 'tea' as CoverKey, image: assetUrl('tea') },
  { id: 'c2', title: '电影票立减 15', shop: '昆阳影城', expire: '本周日', off: '15', cover: 'movie' as CoverKey, image: assetUrl('movie') },
  { id: 'c3', title: '南雁周末亲子券', shop: '南雁亲子谷', expire: '14 天内', off: '30', cover: 'park' as CoverKey, image: assetUrl('park') },
]

export const tickets = [
  {
    id: 't1',
    name: '南麂列岛 · 成人票',
    date: '随时可约',
    price: '120',
    cover: 'lake' as CoverKey,
    image: assetUrl('lake'),
  },
  {
    id: 't2',
    name: '南雁荡山门票',
    date: '当日有效',
    price: '50',
    cover: 'book' as CoverKey,
    image: assetUrl('book'),
  },
]

export const verifyQueue = [
  {
    id: 'v1',
    title: '南雁亲子两日',
    user: '陈女士',
    remain: '2 次',
    cover: 'park' as CoverKey,
    image: assetUrl('park'),
  },
  {
    id: 'v2',
    title: '南麂列岛成人票',
    user: '王先生',
    remain: '1 张',
    cover: 'lake' as CoverKey,
    image: assetUrl('lake'),
  },
  {
    id: 'v3',
    title: '昆阳美食三店通',
    user: '林先生',
    remain: '1 次',
    cover: 'food' as CoverKey,
    image: assetUrl('food'),
  },
]

export const weekendRoute = [
  {
    id: 'r1',
    when: '上午',
    name: '南雁荡山',
    tip: '山门最清静',
    cover: 'lake' as CoverKey,
    image: assetUrl('lake'),
  },
  {
    id: 'r2',
    when: '中午',
    name: '昆阳茶寮',
    tip: '锁客店午餐',
    cover: 'tea' as CoverKey,
    image: assetUrl('tea'),
  },
  {
    id: 'r3',
    when: '下午',
    name: '南雁亲子谷',
    tip: '玩到四点',
    cover: 'park' as CoverKey,
    image: assetUrl('park'),
  },
]

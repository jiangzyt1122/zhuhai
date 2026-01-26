import { POI } from './types';
import { poiImageMap } from './poiImages';

export const ZHUHAI_CENTER: [number, number] = [22.2707, 113.5767]; // Near Fisher Girl
export const COORDINATE_SYSTEM: 'wgs84' | 'gcj02' = 'wgs84';

const BASE_URL = import.meta.env.BASE_URL || '/';
const BASE_WITH_SLASH = BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`;
const buildImageUrl = (path: string) => encodeURI(`${BASE_WITH_SLASH}${path.replace(/^\/+/, '')}`);
const getPoiImages = (name: string) => (poiImageMap[name] ?? []).map(buildImageUrl);

const parentChildAttractions = [
  {
    name: '珠海长隆海洋王国',
    category: '主题乐园',
    latitude: 22.0997006,
    longitude: 113.5299779,
    playTimeHours: 6,
    whatToPlay: [
      '看大型海洋动物：鲸鲨、白鲸、企鹅',
      '走室内水族馆通道，让孩子近距离看鱼群',
      '观看1-2场动物表演（海豚或白鲸即可）'
    ],
    mustNotMiss: [
      '鲸鲨馆（孩子震撼感最强）',
      '企鹅馆（孩子停留时间最长）',
      '一场动物表演（注意选择靠前时间）'
    ],
    whatToPrepare: [
      '推车（园区非常大，3–5岁孩子走不动）',
      '替换衣物（容易出汗）',
      '少量零食和水',
      '提前给孩子讲动物名称，现场更投入'
    ],
    notesForParents: [
      '不建议追求项目数量，孩子容易过载',
      '刺激类游乐设施可以直接放弃',
      '优先安排室内项目，避免中暑'
    ]
  },
  {
    name: '景山公园',
    category: '城市公园',
    latitude: 22.2599753,
    longitude: 113.5677169,
    noteLinks: [
      'https://m.dianping.com/ugcdetail/2525767872?bizType=1&utm_source=aisearch',
      'https://m.dianping.com/ugcdetail/2919686687?bizType=1&utm_source=aisearch'
    ],
    playTimeHours: 2,
    whatToPlay: [
      '草地自由奔跑',
      '放风筝或追泡泡',
      '观察树叶、蚂蚁、小鸟'
    ],
    mustNotMiss: [
      '大草坪区域',
      '相对安静、人少的位置'
    ],
    whatToPrepare: [
      '防蚊喷雾',
      '帽子、防晒',
      '泡泡机或简单玩具',
      '野餐垫（可选）'
    ],
    notesForParents: [
      '这是放电型地点，不是拍照型',
      '不需要安排任务，让孩子自己玩',
      '适合上午或傍晚'
    ]
  },
  {
    name: '海滨公园',
    category: '滨海公园',
    latitude: 22.2620583,
    longitude: 113.5801167,
    playTimeHours: 1.5,
    whatToPlay: [
      '沿海慢走，看海和船',
      '亲子聊天、讲故事',
      '观察浪花、海风'
    ],
    mustNotMiss: [
      '靠海的步行道',
      '傍晚日落时段'
    ],
    whatToPrepare: [
      '薄外套（海风大）',
      '推车',
      '水'
    ],
    notesForParents: [
      '这里不是玩项目的地方',
      '适合行程末尾，让孩子慢下来',
      '注意看护，不要靠近护栏'
    ]
  },
  {
    name: '野狸岛',
    category: '自然岛屿',
    latitude: 22.2812296,
    longitude: 113.5841078,
    noteLinks: [
      'https://m.dianping.com/ugcdetail/351262772?bizType=29&utm_source=aisearch',
      'https://m.dianping.com/ugcdetail/2846126987?bizType=1&utm_source=aisearch'
    ],
    playTimeHours: 1.5,
    whatToPlay: [
      '走完整个小岛',
      '看桥、看海、看城市',
      '拍亲子照片'
    ],
    mustNotMiss: [
      '环岛步道',
      '能看到城市天际线的位置'
    ],
    whatToPrepare: [
      '舒适运动鞋',
      '水',
      '帽子'
    ],
    notesForParents: [
      '不适合奔跑',
      '是认知型体验，不是放电型',
      '游玩时间不宜过长'
    ]
  },
  {
    name: '珠海海滨泳场',
    category: '沙滩',
    latitude: 22.2571703,
    longitude: 113.5860359,
    playTimeHours: 2,
    whatToPlay: [
      '玩沙、堆沙堡',
      '捡贝壳',
      '踩浅水'
    ],
    mustNotMiss: [
      '沙滩玩沙区'
    ],
    whatToPrepare: [
      '沙滩玩具',
      '防晒霜',
      '替换衣服',
      '湿巾'
    ],
    notesForParents: [
      '3–5岁不建议下水游泳',
      '玩完及时清洗',
      '避免正午高温时段'
    ]
  },
  {
    name: '爱情邮局',
    category: '海滨地标',
    latitude: 22.25922,
    longitude: 113.584676,
    noteLinks: [
      'https://m.dianping.com/ugcdetail/2538772164?bizType=1&utm_source=aisearch'
    ],
    whatToPlay: [
      '海边灯塔与木栈道拍照',
      '写明信片寄给自己或家人',
      '情侣路海景漫步'
    ],
    mustNotMiss: [
      '灯塔视角',
      '傍晚海景与日落'
    ],
    whatToPrepare: [
      '防晒用品',
      '帽子',
      '相机或手机稳定器'
    ],
    notesForParents: []
  },
  {
    name: '城市阳台',
    category: '观景平台',
    latitude: 22.268018,
    longitude: 113.576968,
    noteLinks: [
      'https://m.dianping.com/ugcdetail/2616052907?bizType=1&utm_source=aisearch',
      'https://m.dianping.com/ugcdetail/323459031?bizType=29&utm_source=aisearch'
    ],
    whatToPlay: [
      '远眺港珠澳大桥',
      '拍城市+海湾全景'
    ],
    mustNotMiss: [
      '面向香炉湾的观景位'
    ],
    whatToPrepare: [
      '长焦镜头（可选）',
      '薄外套（海风较大）'
    ],
    notesForParents: []
  },
  {
    name: '香炉湾沙滩',
    category: '城市沙滩',
    latitude: 22.259419,
    longitude: 113.581974,
    noteLinks: [
      'https://m.dianping.com/ugcdetail/2538357227?bizType=1&utm_source=aisearch',
      'https://m.dianping.com/ugcdetail/396047308?bizType=29&utm_source=aisearch',
      'https://m.dianping.com/ugcdetail/431304977?bizType=29&utm_source=aisearch'
    ],
    whatToPlay: [
      '踩沙、拍照',
      '看海、看日落',
      '轻度玩沙'
    ],
    mustNotMiss: [
      '日落时段的逆光剪影'
    ],
    whatToPrepare: [
      '防晒霜',
      '沙滩拖鞋',
      '替换衣物'
    ],
    notesForParents: []
  },
  {
    name: '日月贝（珠海大剧院）',
    category: '城市地标建筑',
    latitude: 22.278023,
    longitude: 113.579971,
    noteLinks: [
      'https://m.dianping.com/shop/k58gNVidB0pQTboo?utm_source=aisearch'
    ],
    whatToPlay: [
      '贝壳建筑外观拍照',
      '傍晚到夜间看灯光效果',
      '海边散步'
    ],
    mustNotMiss: [
      '日落后亮灯时的贝壳外立面'
    ],
    whatToPrepare: [
      '夜拍模式或三脚架',
      '步行舒适鞋'
    ],
    notesForParents: []
  },
  {
    name: '北山',
    category: '历史文化街区',
    latitude: 22.274943,
    longitude: 113.530869,
    noteLinks: [
      'https://m.dianping.com/ugcdetail/2429810720?bizType=1&utm_source=aisearch',
      'https://m.dianping.com/ugcdetail/2680884604?bizType=1&utm_source=aisearch',
      'https://m.dianping.com/ugcdetail/2548362421?bizType=1&utm_source=aisearch'
    ],
    whatToPlay: [
      '逛老街与文艺小店',
      '咖啡馆休息',
      '拍墙绘与老建筑'
    ],
    mustNotMiss: [
      '北山老屋群',
      '街区咖啡店'
    ],
    whatToPrepare: [
      '舒适步行鞋',
      '预留1–2小时慢逛时间'
    ],
    notesForParents: []
  },
  {
    name: '夏湾夜市',
    category: '夜市美食',
    latitude: 22.224222,
    longitude: 113.54212,
    coordinateSystem: 'gcj02',
    noteLinks: [
      'https://m.dianping.com/ugcdetail/424880888?bizType=29&utm_source=aisearch',
      'https://m.dianping.com/ugcdetail/3016112502?bizType=1&utm_source=aisearch',
      'https://m.dianping.com/ugcdetail/452226061?bizType=29&utm_source=aisearch'
    ],
    whatToPlay: [
      '品尝丰富夜宵美食，如烤串、海鲜、生蚝和砂锅米线',
      '体验当地最热闹的夜生活氛围',
      '享受宵夜街散步和社交体验'
    ],
    mustNotMiss: [
      '百余摊位汇聚的夜市现场',
      '现炒小锅菜与爆汁烤生蚝',
      '当地特色串串与甜品摊'
    ],
    whatToPrepare: [
      '带足现金和手机扫码支付',
      '戴上口罩与湿巾',
      '穿舒适鞋子以便走动'
    ],
    notesForParents: []
  },
  {
    name: '唐人街夜市',
    category: '夜市美食',
    latitude: 22.166577,
    longitude: 113.413385,
    coordinateSystem: 'gcj02',
    noteLinks: [
      'https://m.dianping.com/ugcdetail/367310095?bizType=29&utm_source=aisearch',
      'https://m.dianping.com/ugcdetail/2982568340?bizType=1&utm_source=aisearch',
      'https://m.dianping.com/ugcdetail/3000703433?bizType=1&utm_source=aisearch'
    ],
    whatToPlay: [
      '逛三灶镇最大夜市，探索各地小吃',
      '尝试卤味、小龙虾、砂锅粥等地道美食',
      '感受霓虹灯下的夜市特色氛围'
    ],
    mustNotMiss: [
      '地道本地风味串烧和炸物',
      '特色砂锅粥和卤味组合',
      '十几种小吃一站吃尽'
    ],
    whatToPrepare: [
      '建议尽早前往占位',
      '穿着适合傍晚出行的轻便衣着',
      '带现金及手机扫码支付'
    ],
    notesForParents: []
  },
  {
    name: '白藤头夜市',
    category: '夜市美食',
    latitude: 22.153623,
    longitude: 113.367169,
    coordinateSystem: 'gcj02',
    noteLinks: [],
    whatToPlay: [
      '夜晚到白藤头水产批发市场旁边的海鲜夜市尝鲜',
      '尝试蒜蓉蒸扇贝、避风塘炒蟹等海鲜烹饪',
      '体验食客大排档的热闹气氛'
    ],
    mustNotMiss: [
      '现捞现做的海鲜烧烤美味',
      '各式蝦蟹大排档特色小吃'
    ],
    whatToPrepare: [
      '带足现金备选用餐',
      '注意晚间人潮与周边环境'
    ],
    notesForParents: []
  },
  {
    name: '金鼎夜市',
    category: '夜市美食',
    latitude: 22.379728,
    longitude: 113.541989,
    coordinateSystem: 'gcj02',
    noteLinks: [
      'https://m.dianping.com/ugcdetail/449460629?bizType=29&utm_source=aisearch',
      'https://m.dianping.com/ugcdetail/454548954?bizType=29&utm_source=aisearch',
      'https://m.dianping.com/ugcdetail/350813411?bizType=29&utm_source=aisearch'
    ],
    whatToPlay: [
      '在金鼎地区夜市品尝最地道的广式夜市风味',
      '尝试双皮奶等当地特色甜品',
      '观赏摊主现场制作食物'
    ],
    mustNotMiss: [
      '炭烤鸡翅与广式甜品摊',
      '简陋摊档里的传统广式美味'
    ],
    whatToPrepare: [
      '配备现金与扫码支付',
      '穿着轻便以便慢走观光',
      '注意个人物品安全'
    ],
    notesForParents: []
  },
  {
    name: '共乐园',
    category: '儿童游乐园',
    latitude: 22.365607,
    longitude: 113.5853684,
    playTimeHours: 2,
    whatToPlay: [
      '自由选择游乐项目',
      '和同龄孩子互动'
    ],
    mustNotMiss: [
      '开放式儿童活动区'
    ],
    whatToPrepare: [
      '水',
      '零食',
      '替换衣物'
    ],
    notesForParents: [
      '这是孩子主导型场所',
      '家长以看护为主',
      '适合社交型孩子'
    ]
  }
];

const restaurants = [
  {
    name: '新海利海鲜酒家（夏湾店）',
    category: '海鲜',
    latitude: 22.224903,
    longitude: 113.541593,
    restaurantFeatures: [
      '珠海老牌海鲜酒家，本地人聚餐首选',
      '海鲜以清蒸、白灼为主，突出原味',
      '大厅+包间，适合家庭聚餐'
    ],
    recommendedDishes: [
      '清蒸石斑鱼',
      '白灼虾',
      '椒盐濑尿虾',
      '蒜蓉蒸扇贝'
    ],
    notesForParents: [
      '可提前告知少盐少油',
      '适合孩子尝试原味海鲜',
      '晚餐高峰期建议提前到'
    ]
  },
  {
    name: '海屿花田海岛花园餐厅（珠海日月贝店）',
    category: '海景餐厅',
    latitude: 22.281949,
    longitude: 113.589728,
    noteLinks: [
      'https://m.dianping.com/ugcdetail/2833826697?bizType=1&utm_source=aisearch',
      'https://m.dianping.com/ugcdetail/2799931656?bizType=1&utm_source=aisearch',
      'https://m.dianping.com/ugcdetail/455708582?bizType=29&utm_source=aisearch'
    ],
    restaurantFeatures: [
      '日月贝旁海岛花园景观位，环境开阔',
      '傍晚到夜间灯光氛围适合拍照',
      '海边微风较大，体验感更佳'
    ],
    recommendedDishes: [],
    whatToPlay: [
      '在日月贝海边花园环境中用餐，边吃饭边看海景',
      '傍晚时段拍海景、花园与日月贝同框照片',
      '夜晚体验灯光点亮后的海岛花园氛围'
    ],
    mustNotMiss: [
      '靠海位置的花园座位区',
      '日落时段的海景视角',
      '夜晚灯光与日月贝建筑背景'
    ],
    whatToPrepare: [
      '建议提前预约（周末和傍晚较满）',
      '给孩子准备外套（海边夜晚风大）',
      '手机或相机（环境非常适合拍照）'
    ],
    notesForParents: [
      '环境开阔、花园式布局，对3-6岁孩子相对友好，但需注意靠海区域安全',
      '可优先选择不辣、清淡类菜品，等待时间较长时可让孩子在花园区域短暂活动'
    ]
  },
  {
    name: '金悦轩海鲜火锅',
    category: '海鲜火锅',
    latitude: 22.228086,
    longitude: 113.557167,
    restaurantFeatures: [
      '主打清淡汤底的粤式海鲜火锅',
      '食材新鲜，调味不重',
      '适合孩子一起吃'
    ],
    recommendedDishes: [
      '花胶鸡汤锅底',
      '鲜切鱼片',
      '手打鱼丸',
      '时令蔬菜拼盘'
    ],
    notesForParents: [
      '避免辣锅',
      '注意火锅安全，防烫',
      '适合天气稍凉时前往'
    ]
  },
  {
    name: '彩凤楼',
    category: '粤菜',
    latitude: 22.221495,
    longitude: 113.553412,
    restaurantFeatures: [
      '传统粤菜酒楼',
      '口味稳定，菜品选择多',
      '适合三代同堂家庭'
    ],
    recommendedDishes: [
      '叉烧',
      '白切鸡',
      '蒸排骨',
      '煲仔饭'
    ],
    notesForParents: [
      '点菜时可选择蒸菜为主',
      '孩子接受度高',
      '适合中午用餐'
    ]
  },
  {
    name: '水禾轩',
    category: '粤菜',
    latitude: 22.27534,
    longitude: 113.531218,
    restaurantFeatures: [
      '环境安静，偏家庭型餐厅',
      '菜品偏清淡',
      '适合不想太吵的家庭'
    ],
    recommendedDishes: [
      '老火汤',
      '清炒时蔬',
      '蒸鱼',
      '烧腊拼盘'
    ],
    notesForParents: [
      '适合孩子情绪需要稳定的时段',
      '不适合追求热闹氛围'
    ]
  }
];

const malls = [
  {
    name: '珠海华发商都',
    category: '综合购物中心',
    latitude: 22.2276683,
    longitude: 113.5057585,
    backgroundIntro: '珠海华发商都是珠海规模最大、最成熟的商业综合体之一，由华发集团开发，集购物、餐饮、娱乐于一体，是本地家庭周末活动的核心区域。',
    whyGoodForFamily: [
      '餐饮选择多，适合带孩子解决一日三餐',
      '通道宽敞，推车友好',
      '周边配套成熟，停车方便'
    ],
    recommendedActivities: [
      '家庭用餐',
      '简单购物',
      '带孩子短暂放松'
    ]
  },
  {
    name: '扬名广场',
    category: '综合购物中心',
    latitude: 22.2785517,
    longitude: 113.5745434,
    noteLinks: [
      'https://m.dianping.com/ugcdetail/457214216?bizType=29&utm_source=aisearch',
      'https://m.dianping.com/ugcdetail/378054883?bizType=29&utm_source=aisearch',
      'https://m.dianping.com/ugcdetail/371210844?bizType=29&utm_source=aisearch'
    ],
    backgroundIntro: '扬名广场位于珠海老城区，是较早一批成熟商业中心，服务本地居民为主，生活气息浓厚。',
    whyGoodForFamily: [
      '距离居民区近',
      '餐厅价格相对友好',
      '不追求高端，节奏慢'
    ],
    recommendedActivities: [
      '日常吃饭',
      '补给型购物',
      '行程中途休息'
    ]
  },
  {
    name: '富华里',
    category: '城市商业街区',
    latitude: 22.2370608,
    longitude: 113.5358704,
    noteLinks: [
      'https://m.dianping.com/ugcdetail/2485119959?bizType=1&utm_source=aisearch',
      'https://m.dianping.com/ugcdetail/2822195968?bizType=1&utm_source=aisearch',
      'https://m.dianping.com/ugcdetail/352112875?bizType=29&utm_source=aisearch'
    ],
    backgroundIntro: '富华里是珠海新兴城市商业街区，融合餐饮、咖啡、零售和城市公共空间，更偏生活方式与休闲。',
    whyGoodForFamily: [
      '室外空间多，孩子活动自由',
      '餐厅选择丰富',
      '适合傍晚散步'
    ],
    recommendedActivities: [
      '亲子散步',
      '早晚用餐',
      '城市休闲体验'
    ]
  }
];

const historyCulture = [
  {
    name: '圆明新园',
    category: '历史文化景区',
    latitude: 22.2450028,
    longitude: 113.5330989,
    noteLinks: [
      'https://m.dianping.com/shop/k8i9SsHgzsIRekZy?utm_source=aisearch&poiid=1753672'
    ],
    backgroundInfo: '圆明新园是以北京圆明园为蓝本修建的大型仿古皇家园林，用于展示中国古代园林建筑与历史文化。',
    openTime: '09:00',
    closeTime: '18:00',
    recommendedVisitWay: [
      '慢走为主，不追求全逛',
      '给孩子讲简单的“皇宫、园林”概念',
      '以视觉体验为主'
    ],
    notesForParents: [
      '对3–5岁孩子不宜停留过久',
      '避开正午高温',
      '以认知启蒙为目标'
    ]
  },
  {
    name: '珠海博物馆',
    category: '博物馆',
    latitude: 22.2960255,
    longitude: 113.5716702,
    noteLinks: [
      'https://m.dianping.com/ugcdetail/2734235558?bizType=1&utm_source=aisearch',
      'https://m.dianping.com/ugcdetail/3044731504?bizType=1&utm_source=aisearch',
      'https://m.dianping.com/ugcdetail/395621577?bizType=29&utm_source=aisearch'
    ],
    backgroundInfo: '珠海博物馆展示珠海地区的历史沿革、海洋文化与城市发展，是了解珠海背景的重要公共文化空间。',
    openTime: '09:00',
    closeTime: '17:00',
    recommendedVisitWay: [
      '只选1–2个展厅参观',
      '通过图片和模型讲故事',
      '控制参观时间在1小时左右'
    ],
    notesForParents: [
      '孩子注意力有限',
      '不适合长时间参观',
      '更适合作为安静型补充行程'
    ]
  },
  {
    name: '唐家古镇',
    category: '历史街区',
    latitude: 22.3621965,
    longitude: 113.5882707,
    noteLinks: [
      'https://m.dianping.com/ugcdetail/429522563?bizType=29&utm_source=aisearch',
      'https://m.dianping.com/ugcdetail/420947169?bizType=29&utm_source=aisearch',
      'https://m.dianping.com/ugcdetail/2483573741?bizType=1&utm_source=aisearch'
    ],
    backgroundInfo: '唐家古镇是珠海保存较完整的历史街区之一，体现了珠海早期渔村与商贸文化。',
    openTime: '全天开放',
    closeTime: '全天开放',
    recommendedVisitWay: [
      '边走边看老建筑',
      '结合吃饭或散步',
      '讲“以前的人是怎么生活的”'
    ],
    notesForParents: [
      '路面不完全平整',
      '注意安全',
      '适合短时间体验'
    ]
  }
];

const makeId = (prefix: string, name: string) =>
  `${prefix}-${name.replace(/[()（）\s]/g, '')}`;

const makeBase = (
  item: { name: string; category: string; latitude: number; longitude: number },
  id: string,
  poiType: 'attraction' | 'restaurant',
  brief: string,
  commend: string,
  noteLinks: string[] = [],
  coordinateSystem?: 'wgs84' | 'gcj02'
): POI => {
  const images = getPoiImages(item.name);
  return ({
  id,
  name: item.name,
  category: item.category,
  poiType,
  address: `珠海 · ${item.category}`,
  latitude: item.latitude,
  longitude: item.longitude,
  brief,
  commend,
  noteLinks,
  coordinateSystem,
  image: images[0] ?? `https://picsum.photos/seed/poi-${encodeURIComponent(id)}/800/400`,
  images
  });
};

export const ZHUHAI_POIS: POI[] = [
  ...parentChildAttractions.map((item, index) => ({
    ...makeBase(
      item,
      makeId('A', item.name),
      'attraction',
      item.whatToPlay[0] ?? item.name,
      item.notesForParents.join('；'),
      item.noteLinks ?? [],
      item.coordinateSystem
    ),
    playTimeHours: item.playTimeHours,
    whatToPlay: item.whatToPlay,
    mustNotMiss: item.mustNotMiss,
    whatToPrepare: item.whatToPrepare,
    notesForParents: item.notesForParents
  })),
  ...restaurants.map((item, index) => ({
    ...makeBase(
      item,
      makeId('R', item.name),
      'restaurant',
      item.restaurantFeatures[0] ?? item.name,
      item.notesForParents.join('；'),
      item.noteLinks ?? [],
      item.coordinateSystem
    ),
    restaurantFeatures: item.restaurantFeatures,
    recommendedDishes: item.recommendedDishes,
    whatToPlay: item.whatToPlay,
    mustNotMiss: item.mustNotMiss,
    whatToPrepare: item.whatToPrepare,
    notesForParents: item.notesForParents
  })),
  ...malls.map((item, index) => ({
    ...makeBase(
      item,
      makeId('M', item.name),
      'attraction',
      item.backgroundIntro,
      item.whyGoodForFamily.join('；'),
      item.noteLinks ?? [],
      item.coordinateSystem
    ),
    backgroundIntro: item.backgroundIntro,
    whyGoodForFamily: item.whyGoodForFamily,
    recommendedActivities: item.recommendedActivities
  })),
  ...historyCulture.map((item, index) => ({
    ...makeBase(
      item,
      makeId('H', item.name),
      'attraction',
      item.backgroundInfo,
      item.notesForParents.join('；'),
      item.noteLinks ?? [],
      item.coordinateSystem
    ),
    backgroundInfo: item.backgroundInfo,
    openTime: item.openTime,
    closeTime: item.closeTime,
    recommendedVisitWay: item.recommendedVisitWay,
    notesForParents: item.notesForParents
  }))
];

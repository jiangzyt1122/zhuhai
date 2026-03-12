import { POI } from './types';
import { poiImageMap } from './poiImages';

export const DEFAULT_MAP_CENTER: [number, number] = [40.040153, 116.369081];
export const DEFAULT_MAP_CENTER_COORDINATE_SYSTEM: 'wgs84' | 'gcj02' = 'gcj02';
export const HOME_MARKER = {
  name: '家',
  latitude: 40.040153,
  longitude: 116.369081,
  coordinateSystem: 'gcj02' as const
};
export const COORDINATE_SYSTEM: 'wgs84' | 'gcj02' = 'wgs84';

const getPoiImages = (name: string) => poiImageMap[name] ?? [];
const DEFAULT_CITY = '珠海';

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
  },
  {
    name: '长隆野生动物世界',
    category: '亲子景点',
    latitude: 23.002789,
    longitude: 113.315606,
    city: '广州',
    coordinateSystem: 'gcj02',
    noteLinks: [],
    whatToPlay: [
      '近距离观察和学习多种珍稀动物',
      '体验动物表演和互动体验项目',
      '参与亲子教育活动与科普课程'
    ],
    mustNotMiss: [
      '亚洲大型动物展示区',
      '自驾/乘车游览区域',
      '互动喂食和动物保育解说'
    ],
    whatToPrepare: [
      '太阳帽和防晒用品',
      '舒适鞋和水',
      '相机或手机稳定器'
    ],
    notesForParents: [
      '场馆非常大，建议安排整天时间参观，可带备推车供孩子午休或走累时使用。'
    ]
  },
  {
    name: '广东科学中心',
    category: '亲子博物馆',
    latitude: 23.039429,
    longitude: 113.362169,
    city: '广州',
    coordinateSystem: 'gcj02',
    noteLinks: [],
    whatToPlay: [
      '参与互动科学展区探索物理、太空与机器人技术',
      '观看 IMAX 影院和科技影片',
      '体验户外科学探索乐园'
    ],
    mustNotMiss: [
      '科技主题展馆核心展项',
      '球幕与 IMAX 科技影院体验',
      '儿童科学互动区'
    ],
    whatToPrepare: [
      '提前预约门票',
      '带孩子穿舒适衣物',
      '相机与笔记本记录学习体验'
    ],
    notesForParents: [
      '适合雨天或高温天气安排室内学习与亲子互动。'
    ]
  },
  {
    name: '广州塔',
    category: '城市地标',
    latitude: 23.106589,
    longitude: 113.324558,
    city: '广州',
    coordinateSystem: 'gcj02',
    noteLinks: [],
    whatToPlay: [
      '登高观景平台俯瞰广州全景',
      '体验世界最高的 Bubble Tram 观光设施',
      '夜晚欣赏珠江两岸灯光美景'
    ],
    mustNotMiss: [
      '观光塔顶俯视城市风光',
      '搭乘 Bubble Tram 旋转观光车',
      '夜晚灯光秀与江畔散步'
    ],
    whatToPrepare: [
      '提前预约观景票',
      '带相机记录日落或夜景',
      '天气晴好时更适合登高游览'
    ],
    notesForParents: [
      '塔内有餐厅可休息补给，适合带孩子观光与拍照。'
    ]
  },
  {
    name: '越秀公园',
    category: '城市公园',
    latitude: 23.139827,
    longitude: 113.266929,
    city: '广州',
    coordinateSystem: 'gcj02',
    noteLinks: [],
    whatToPlay: [
      '在湖畔散步、放风筝和家庭野餐',
      '参观五羊雕像、镇海楼等历史地标',
      '沿园内小道探索自然与花草'
    ],
    mustNotMiss: [
      '五羊雕像地标拍照点',
      '镇海楼与历史墙遗迹',
      '湖畔风景与儿童活动开放区'
    ],
    whatToPrepare: [
      '带水和遮阳装备',
      '准备小野餐食品与餐垫',
      '带安全帽或雨具根据天气调整'
    ],
    notesForParents: [
      '公园范围广，适合家庭散步或观察本地生活。'
    ]
  },
  {
    name: '广东省博物馆',
    category: '博物馆',
    latitude: 23.114611,
    longitude: 113.326802,
    city: '广州',
    coordinateSystem: 'gcj02',
    noteLinks: [],
    whatToPlay: [
      '探索广东历史文化和自然展览',
      '看恐龙化石、潮州木雕、端砚等特色展品',
      '参加公益展览和亲子科普活动'
    ],
    mustNotMiss: [
      '岭南地区文化艺术专展',
      '自然资源主题展区',
      '特色陶瓷与潮州木雕'
    ],
    whatToPrepare: [
      '提前在线预约免费门票并留足参观时间',
      '带水和舒适鞋子（参观时间较长）',
      '天气凉爽适合室内漫游'
    ],
    notesForParents: [
      '馆内展品丰富而互动性强，适合各年龄段孩子学习与体验。1月天气凉爽，是安排室内文化活动的好时机。'
    ]
  },
  {
    name: '珠江（夜游）',
    category: '城市河道/夜游',
    latitude: 23.112401,
    longitude: 113.285434,
    city: '广州',
    coordinateSystem: 'gcj02',
    noteLinks: [],
    whatToPlay: [
      '乘坐珠江夜游船欣赏两岸夜景',
      '观赏广州塔、花城广场等地标夜灯',
      '沿江步道散步看风景'
    ],
    mustNotMiss: [
      '珠江两岸灯光秀',
      '夜游船拍摄城市灯火',
      '沿江亲子散步区'
    ],
    whatToPrepare: [
      '带轻便外套（夜间江边有风）',
      '相机/手机稳定器拍夜景',
      '提前预定夜游航班'
    ],
    notesForParents: [
      '1月晚间气温较凉，夜游时带件外套更舒适，江风较大要注意保暖。'
    ]
  },
  {
    name: '石室圣心大教堂',
    category: '历史建筑',
    latitude: 23.114705,
    longitude: 113.260064,
    city: '广州',
    coordinateSystem: 'gcj02',
    noteLinks: [],
    whatToPlay: [
      '欣赏宏伟的哥特式建筑和石质结构',
      '了解天主教在广州的发展历史',
      '拍摄教堂建筑与玻璃彩窗'
    ],
    mustNotMiss: [
      '哥特式双尖塔',
      '内部彩色玻璃窗',
      '参观教堂外广场的历史氛围'
    ],
    whatToPrepare: [
      '注意尊重宗教场所礼仪与安静参观',
      '穿适合步行的舒适鞋子',
      '在周边咖啡馆稍作休息'
    ],
    notesForParents: [
      '教堂开放时间会因弥撒等宗教活动有所变化，建议提前查看开放时间再安排。'
    ]
  },
  {
    name: '沙面岛',
    category: '历史文化步行区',
    latitude: 23.106753,
    longitude: 113.244764,
    city: '广州',
    coordinateSystem: 'gcj02',
    noteLinks: [],
    whatToPlay: [
      '漫步沙面岛的林荫道和欧式建筑',
      '拍摄古老领事馆建筑与港风街景',
      '在小咖啡馆休息品茶'
    ],
    mustNotMiss: [
      '沙面岛经典欧洲建筑群',
      '臨江步道与雕像艺术',
      '特色咖啡馆小店体验'
    ],
    whatToPrepare: [
      '穿舒适鞋子适合步行',
      '带相机/手机拍照',
      '带上一件外套（1月气温凉爽）'
    ],
    notesForParents: [
      '沙面岛绿树成荫、开放式户外区域非常适合孩子走走拍拍，1月凉爽天气非常适宜。'
    ]
  },
  {
    name: '永庆坊',
    category: '文化街区',
    latitude: 23.114830,
    longitude: 113.238857,
    city: '广州',
    coordinateSystem: 'gcj02',
    noteLinks: [],
    whatToPlay: [
      '探索岭南老街区与文创空间',
      '参观手工艺店和特色展览',
      '体验传统与现代融合的街区文化'
    ],
    mustNotMiss: [
      '岭南传统建筑与瓦片屋顶',
      '特色手工艺及文创小店',
      '历史故事文化介绍牌与李小龙故居遗址'
    ],
    whatToPrepare: [
      '穿舒适鞋适合街区漫步',
      '带水和轻便外套',
      '拍照或购买地方特色记念品'
    ],
    notesForParents: [
      '永庆坊融合老广州历史文化与现代街区特色，适合亲子慢游体验与休闲轻松参观。'
    ]
  },
  {
    name: '广州市儿童公园',
    category: '亲子公园',
    latitude: 23.184587,
    longitude: 113.271815,
    city: '广州',
    coordinateSystem: 'gcj02',
    noteLinks: [],
    whatToPlay: [
      '大型儿童游乐区自由玩耍（滑梯、攀爬、沙坑）',
      '草地奔跑、亲子互动游戏',
      '主题儿童设施分龄体验'
    ],
    mustNotMiss: [
      '核心儿童游乐区',
      '开阔草坪活动空间',
      '低龄儿童安全游玩区'
    ],
    whatToPrepare: [
      '替换衣物（孩子活动量大）',
      '水壶与简单零食',
      '防风外套（1月早晚略凉）'
    ],
    notesForParents: [
      '1月广州天气凉爽不闷热，非常适合长时间户外放电；公园空间大，建议提前约定集合点防止走散。'
    ]
  },
  {
    name: '华南国家植物园',
    category: '自然科普',
    latitude: 23.184299,
    longitude: 113.369701,
    city: '广州',
    coordinateSystem: 'gcj02',
    noteLinks: [],
    whatToPlay: [
      '认识热带与亚热带植物',
      '自然科普步道慢走',
      '观察昆虫、植物形态'
    ],
    mustNotMiss: [
      '温室植物区',
      '热带雨林景观片区',
      '植物科普展板'
    ],
    whatToPrepare: [
      '舒适的步行鞋',
      '薄外套（林荫区体感偏凉）',
      '简单防晒用品'
    ],
    notesForParents: [
      '相比夏季，1月不炎热也蚊虫较少，是一年中最适合带孩子逛植物园的季节之一，整体节奏偏慢、适合自然教育。'
    ]
  },
  {
    name: '二沙岛',
    category: '城市休闲',
    latitude: 23.109857,
    longitude: 113.305374,
    city: '广州',
    coordinateSystem: 'gcj02',
    noteLinks: [],
    whatToPlay: [
      '江边草地散步与放风筝',
      '骑行或慢走环岛路线',
      '亲子拍照、看江景'
    ],
    mustNotMiss: [
      '江景草坪',
      '城市天际线视角',
      '傍晚日落时段'
    ],
    whatToPrepare: [
      '防风外套（江边风较大）',
      '运动鞋',
      '野餐垫或简单零食'
    ],
    notesForParents: [
      '1月二沙岛体感非常舒适，不晒不闷，是亲子慢走、放空的优质城市户外空间，注意江边安全即可。'
    ]
  },
  {
    name: '广州儿童活动中心',
    category: '亲子室内活动',
    latitude: 23.140692,
    longitude: 113.273854,
    city: '广州',
    coordinateSystem: 'gcj02',
    noteLinks: [],
    whatToPlay: [
      '参与儿童主题活动和体验项目',
      '动手类与兴趣培养活动',
      '室内自由活动空间'
    ],
    mustNotMiss: [
      '互动体验课程',
      '动手实践区',
      '主题活动场地'
    ],
    whatToPrepare: [
      '提前关注活动时间安排',
      '为孩子准备防滑袜',
      '携带水杯'
    ],
    notesForParents: [
      '适合需要控制体力消耗或遇到阴雨天气时安排；1月气温适中，可与户外景点灵活搭配。'
    ]
  },
  {
    name: '白云山',
    category: '自然景区',
    latitude: 23.183429,
    longitude: 113.300931,
    city: '广州',
    coordinateSystem: 'gcj02',
    noteLinks: [],
    whatToPlay: [
      '登山步道徒步',
      '乘坐索道俯瞰城市',
      '亲子自然观察'
    ],
    mustNotMiss: [
      '山顶观景平台',
      '索道体验',
      '城市全景视角'
    ],
    whatToPrepare: [
      '运动鞋',
      '薄外套（山顶温差）',
      '适量补给水'
    ],
    notesForParents: [
      '1月是白云山一年中最舒适的徒步季节之一，气温低、空气好；带3–6岁孩子可选择索道上下减少体力消耗。'
    ]
  },
  {
    name: '厦滘夜市',
    category: '夜市美食',
    latitude: 23.039515,
    longitude: 113.320132,
    city: '广州',
    coordinateSystem: 'gcj02',
    noteLinks: [],
    whatToPlay: [
      '夜晚逛夜市吃烧烤和海鲜',
      '边走边选小吃，感受广州夜生活',
      '找人少的摊位坐下来慢慢吃'
    ],
    mustNotMiss: [
      '烤生蚝和烧烤摊',
      '砂锅粥和炒粉面',
      '糖水和甜品摊'
    ],
    whatToPrepare: [
      '现金或手机支付',
      '纸巾和湿巾',
      '薄外套（1月夜晚有风）'
    ],
    notesForParents: [
      '1月天气凉爽不闷热，是一年中最适合逛夜市的时间段；人多但氛围热闹，建议避开最拥挤的高峰时段。'
    ]
  },
  {
    name: '龙洞夜市',
    category: '夜市美食',
    latitude: 23.195515,
    longitude: 113.365105,
    city: '广州',
    coordinateSystem: 'gcj02',
    noteLinks: [],
    whatToPlay: [
      '体验大学城周边的学生夜市',
      '尝试便宜又种类多的小吃',
      '随逛随吃，不需要久坐'
    ],
    mustNotMiss: [
      '炸串和烤串',
      '手抓饼、烤冷面',
      '奶茶和甜品摊'
    ],
    whatToPrepare: [
      '少量现金',
      '舒适鞋子（需要走动）',
      '给孩子准备不辣食物'
    ],
    notesForParents: [
      '整体价格友好、节奏轻松，1月不热不冷，适合简单体验夜市氛围，不必久逛。'
    ]
  },
  {
    name: '永泰夜市',
    category: '夜市美食',
    latitude: 23.228629,
    longitude: 113.276836,
    city: '广州',
    coordinateSystem: 'gcj02',
    noteLinks: [],
    whatToPlay: [
      '体验本地人日常夜宵生活',
      '边逛边吃，感受社区烟火气',
      '选择看起来干净、翻台快的摊位'
    ],
    mustNotMiss: [
      '广式糖水',
      '烧烤和炒粉',
      '粥档'
    ],
    whatToPrepare: [
      '轻便外套',
      '湿巾',
      '耐心慢慢逛'
    ],
    notesForParents: [
      '属于社区型夜市，游客不算多，1月晚上很舒服，适合想看真实广州生活的家人。'
    ]
  },
  {
    name: '西华路夜宵街',
    category: '夜市美食',
    latitude: 23.129748,
    longitude: 113.252116,
    city: '广州',
    coordinateSystem: 'gcj02',
    noteLinks: [],
    whatToPlay: [
      '找一家老店坐下来吃宵夜',
      '体验传统广式夜宵文化',
      '晚饭后慢慢走一走'
    ],
    mustNotMiss: [
      '猪杂粥',
      '云吞面',
      '老字号糖水铺'
    ],
    whatToPrepare: [
      '不需要赶时间',
      '带件外套',
      '给孩子点清淡口味'
    ],
    notesForParents: [
      '比传统夜市更安静，偏大排档形式，1月夜晚温度舒适，非常适合长辈。'
    ]
  },
  {
    name: '陈家祠',
    category: '历史文化',
    latitude: 23.1255,
    longitude: 113.2453,
    city: '广州',
    coordinateSystem: 'gcj02',
    autoLocate: true,
    noteLinks: [],
    whatToPlay: [
      '欣赏精美岭南建筑与民间工艺',
      '参观广东民间工艺博物馆的传统工艺收藏',
      '拍摄院落与雕刻细节照片'
    ],
    mustNotMiss: [
      '砖雕、木雕与石雕细节',
      '岭南工艺精品展览'
    ],
    whatToPrepare: [
      '舒适鞋子（室内外都有步行）',
      '带点零用钱购买纪念品',
      '讲解器或导览图'
    ],
    notesForParents: [
      '了解清末岭南特色建筑与民间艺术的最佳地点，冬季室内参观比夏季更舒服。开放时间约09:00–17:30。'
    ]
  },
  {
    name: '南越王博物院（王墓展区）',
    category: '历史博物馆',
    latitude: 23.1314,
    longitude: 113.2744,
    city: '广州',
    coordinateSystem: 'gcj02',
    autoLocate: true,
    noteLinks: [],
    whatToPlay: [
      '了解南越国历史及西汉墓葬文化',
      '参观出土文物与王墓遗址',
      '亲子讲解汉代文化背景'
    ],
    mustNotMiss: [
      '王墓遗迹与展示',
      '汉代彩绘石室结构'
    ],
    whatToPrepare: [
      '提前预定参观时段（周一闭馆）',
      '纸巾与小吃水',
      '儿童耳机或讲解材料'
    ],
    notesForParents: [
      '国家一级博物馆，可看到完整汉代文物与南越文化交融，适合带孩子学习历史。开放时间通常为09:00–17:30，周一闭馆。'
    ]
  },
  {
    name: '中山纪念堂',
    category: '历史文化',
    latitude: 23.1293,
    longitude: 113.2644,
    city: '广州',
    coordinateSystem: 'gcj02',
    autoLocate: true,
    noteLinks: [],
    whatToPlay: [
      '了解孙中山与近代中国历史',
      '参观纪念馆内展览',
      '在园区散步拍照'
    ],
    mustNotMiss: [
      '主体八角形纪念建筑',
      '孙中山铜像与历史展板'
    ],
    whatToPrepare: [
      '轻便外套（1月凉）',
      '讲解手册或音频',
      '水与小零食'
    ],
    notesForParents: [
      '纪念堂融合历史与园林，适合冬日散步型参观。可顺访越秀公园周边景点。'
    ]
  },
  {
    name: '广州大剧院',
    category: '艺术文化',
    latitude: 23.118379,
    longitude: 113.316286,
    city: '广州',
    coordinateSystem: 'wgs84',
    autoLocate: true,
    autoLocateKeyword: '广州大剧院 珠江西路 1号',
    noteLinks: [],
    whatToPlay: [
      '欣赏扎哈·哈迪德现代建筑设计',
      '现场观看戏剧/演出',
      '观看珠江风光与城市天际线'
    ],
    mustNotMiss: [
      '独特“双砾”外观建筑',
      '剧院内部空间与剧场体验'
    ],
    whatToPrepare: [
      '提前订票（若有演出）',
      '相机或手机',
      '保暖外套（户外河边风大）'
    ],
    notesForParents: [
      '不看演出也值得来此打卡建筑与珠江夜景。珠江新城周边餐饮与花城广场适合顺访。'
    ]
  },
  {
    name: '海心桥',
    category: '城市地标',
    latitude: 23.1082,
    longitude: 113.3180,
    city: '广州',
    coordinateSystem: 'gcj02',
    autoLocate: true,
    noteLinks: [],
    whatToPlay: [
      '漫步在珠江之上欣赏城市景观',
      '拍摄广州CBD及珠江夜景',
      '亲子轻松散步'
    ],
    mustNotMiss: [
      '桥上全景视角看珠江塔和珠江两岸',
      '夜晚灯光秀与桥梁灯效'
    ],
    whatToPrepare: [
      '保暖薄外套（江边风较大）',
      '相机或手机',
      '舒适鞋子'
    ],
    notesForParents: [
      '广州著名的步行桥梁与城市景观点，白天与夜色皆有不同体验。'
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
  },
  {
    name: '广州酒家（文昌总店）',
    category: '粤菜老字号',
    latitude: 23.10336,
    longitude: 113.248374,
    city: '广州',
    coordinateSystem: 'gcj02',
    autoLocate: true,
    noteLinks: [
      'https://m.dianping.com/shopinfo/H4vxgllOulKZ3eDW?msource=Appshare2021&utm_source=shop_share&shoptype=10&shopcategoryid=34283&cityid=4&isoversea=0'
    ],
    restaurantFeatures: [
      '体验最传统的广式早茶',
      '品尝经典粤菜与点心',
      '感受老广州酒楼氛围'
    ],
    whatToPlay: [
      '体验最传统的广式早茶',
      '品尝经典粤菜与点心',
      '感受老广州酒楼氛围'
    ],
    recommendedDishes: [
      '虾饺',
      '烧卖',
      '白切鸡',
      '叉烧'
    ],
    mustNotMiss: [
      '虾饺',
      '烧卖',
      '白切鸡',
      '叉烧'
    ],
    whatToPrepare: [
      '周末和早茶高峰需排队',
      '早点到店更轻松',
      '可提前查是否支持线上取号'
    ],
    notesForParents: [
      '广州代表性老字号，环境正规、口味稳，1月堂食非常舒适，适合爸妈与孩子一起慢慢吃。'
    ]
  },
  {
    name: '陶陶居（第十甫路总店）',
    category: '粤菜老字号',
    latitude: 23.122166,
    longitude: 113.260722,
    city: '广州',
    coordinateSystem: 'gcj02',
    autoLocate: true,
    noteLinks: [
      'https://m.dianping.com/shopinfo/j1h0w0JYscxJtdBe?msource=Appshare2021&utm_source=shop_share&shoptype=10&shopcategoryid=34282&cityid=4&isoversea=0'
    ],
    restaurantFeatures: [
      '吃广式点心和传统甜品',
      '体验百年老字号茶楼',
      '顺路逛上下九步行街'
    ],
    whatToPlay: [
      '吃广式点心和传统甜品',
      '体验百年老字号茶楼',
      '顺路逛上下九步行街'
    ],
    recommendedDishes: [
      '陶陶居大虾饺',
      '凤爪',
      '蛋挞',
      '马蹄糕'
    ],
    mustNotMiss: [
      '陶陶居大虾饺',
      '凤爪',
      '蛋挞',
      '马蹄糕'
    ],
    whatToPrepare: [
      '饭点人多需耐心排队',
      '点心可多样少量',
      '适合上午或下午茶时段'
    ],
    notesForParents: [
      '环境相对热闹，但服务成熟，适合第一次来广州的家人体验老广州早茶文化。'
    ]
  },
  {
    name: '点都德(汇点楼)',
    category: '广式早茶',
    latitude: 23.118945,
    longitude: 113.331987,
    city: '广州',
    coordinateSystem: 'gcj02',
    autoLocate: true,
    noteLinks: [
      'https://m.dianping.com/shopinfo/l4f06KVSqnKKC7NB?msource=Appshare2021&utm_source=shop_share&shoptype=10&shopcategoryid=34282&cityid=4&isoversea=0'
    ],
    restaurantFeatures: [
      '体验年轻化的广式早茶',
      '点心种类丰富',
      '适合家庭快速用餐'
    ],
    whatToPlay: [
      '体验年轻化的广式早茶',
      '点心种类丰富',
      '适合家庭快速用餐'
    ],
    recommendedDishes: [
      '金牌虾饺皇',
      '流沙包',
      '叉烧包'
    ],
    mustNotMiss: [
      '金牌虾饺皇',
      '流沙包',
      '叉烧包'
    ],
    whatToPrepare: [
      '高峰期排队',
      '可线上取号',
      '适合上午或午餐'
    ],
    notesForParents: [
      '相比老字号更现代，口味清爽稳定，孩子接受度高。'
    ]
  },
  {
    name: '泮溪酒家',
    category: '园林粤菜',
    latitude: 23.121321,
    longitude: 113.236214,
    city: '广州',
    coordinateSystem: 'gcj02',
    autoLocate: true,
    noteLinks: [
      'https://m.dianping.com/shopinfo/k6fO8WcRVlYBZAkW?msource=Appshare2021&utm_source=shop_share&shoptype=10&shopcategoryid=34283&cityid=4&isoversea=0'
    ],
    restaurantFeatures: [
      '在园林式环境中用餐',
      '体验岭南传统宴席氛围',
      '餐后可园区散步'
    ],
    whatToPlay: [
      '在园林式环境中用餐',
      '体验岭南传统宴席氛围',
      '餐后可园区散步'
    ],
    recommendedDishes: [
      '泮溪传统点心',
      '烧味拼盘',
      '广式汤品'
    ],
    mustNotMiss: [
      '泮溪传统点心',
      '烧味拼盘',
      '广式汤品'
    ],
    whatToPrepare: [
      '建议中午或下午去',
      '带相机拍园林',
      '注意园区面积较大'
    ],
    notesForParents: [
      '环境非常适合长辈，节奏慢、安静，1月气温凉爽，园林用餐体验很好。'
    ]
  },
  {
    name: '南园酒家',
    category: '粤菜老字号',
    latitude: 23.099956,
    longitude: 113.280458,
    city: '广州',
    coordinateSystem: 'gcj02',
    autoLocate: true,
    noteLinks: [
      'https://m.dianping.com/shopinfo/l426LpT7gmmW1sEX?msource=Appshare2021&utm_source=shop_share&shoptype=10&shopcategoryid=205&cityid=4&isoversea=0'
    ],
    restaurantFeatures: [
      '体验老广州宴席文化',
      '适合家庭聚餐',
      '感受传统酒楼格局'
    ],
    whatToPlay: [
      '体验老广州宴席文化',
      '适合家庭聚餐',
      '感受传统酒楼格局'
    ],
    recommendedDishes: [
      '烧鹅',
      '白切鸡',
      '老火靓汤'
    ],
    mustNotMiss: [
      '烧鹅',
      '白切鸡',
      '老火靓汤'
    ],
    whatToPrepare: [
      '饭点可能较忙',
      '点菜可请服务员推荐',
      '适合多人分食'
    ],
    notesForParents: [
      '老派酒楼风格，口味偏传统，非常适合爸妈。'
    ]
  },
  
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

const beijingKindergartens = [
  {
    shortName: '明天九幼',
    image: 'https://p5.itc.cn/q_70/images03/20230629/115945cbf7bf48a0802b59354d962873.png',
    name: '明天九幼永泰园',
    category: '教育部公办',
    city: '北京',
    latitude: 40.033377,
    longitude: 116.35854,
    coordinateSystem: 'gcj02' as const,
    phone: '62903154',
    contactPerson: '张老师',
    noteLinks: [
      'https://www.shangnaxue.com/ask/1173472.html',
      'https://zyk.bjhd.gov.cn/xxfw/zwfw/47f4e4af53ab4996a2f15859d7caec63.htm',
      'https://www.bjmt.com.cn/index.php?c=show&id=28'
    ],
    schoolFeatures: [
      '隶属海淀区教委的北京明天幼稚集团，可借力集团化办园与教研资源。',
      '公开资料显示园内设 7 个教学班，位于永泰东里社区，兼具社区配套与教育部门办园属性。',
      '办园理念强调“每个孩子都是美的种子”，并出现在海淀普惠托育试点名单中。'
    ],
    facultyStrength: [
      '公开招生资料显示教师 100% 为本科及以上学历。',
      '公开资料显示现有区级学科带头人 2 名、骨干教师 1 名。',
      '依托明天幼稚集团的托幼一体化探索，整体师资专业化公开度较高。'
    ],
    overallEvaluation:
      '这所园的公开硬信息最完整，师资学历和骨干教师数据都能查到，适合把“公办属性 + 教师配置”作为优先考察点。'
  },
  {
    shortName: '北师龙樾',
    image: 'https://child.bnu.edu.cn/images/2022-09/fadd69e4bf394789891ebeb3741240cd.jpeg',
    name: '北京师范大学实验幼儿园(龙樾分园)',
    category: '单位公办',
    city: '北京',
    latitude: 40.044295,
    longitude: 116.350929,
    coordinateSystem: 'gcj02' as const,
    phone: '82833199',
    contactPerson: '郭老师',
    noteLinks: [
      'https://child.bnu.edu.cn/dyjz/xxxqyy/4317903f04d3480fb4f8b3049a3f63b6.htm',
      'https://child.bnu.edu.cn/szdw/jshfz/999e7bdd7d1448928ec8607db2d79f8c.htm',
      'https://child.bnu.edu.cn/cydt/yeyxw/24aaf25d1dbf42fdb5eaf8ebf3043ed2.htm'
    ],
    schoolFeatures: [
      '龙樾分园为小区配套全日制公立幼儿园，公开信息显示规划 12 个班，总建筑面积约 4812 平方米。',
      '园所延续北师大实验幼儿园“以儿童为本”和“和合”文化，强调生活活动教育化、教育活动生活化。',
      '公开办园质量督导与园所新闻显示，其在自主游戏、幼小衔接和课程展示方面较活跃。'
    ],
    facultyStrength: [
      '北师大实验幼儿园公开介绍显示已形成多园区集团化办园，可共享专家、培训和教研体系。',
      '官方教师发展资料显示园所建立分层分类培训、园本研修和在职进修奖学金机制。',
      '2025 学年公开数据中，园内有 276 人次教师获评各类优秀教师，18 个班组获优秀班集体。'
    ],
    overallEvaluation:
      '如果看品牌、课程体系和教研能力，这所园在这批点位里竞争力最强；同时它也是关注度和预期值都更高的一类园。'
  },
  {
    shortName: '海融惠爱',
    image: 'https://p9.itc.cn/q_70/images03/20230629/e42d2298b101408695e2c21189d8df61.png',
    name: '海融惠爱幼儿园',
    category: '单位公办',
    city: '北京',
    latitude: 40.048063,
    longitude: 116.367928,
    coordinateSystem: 'gcj02' as const,
    phone: '15600588335',
    contactPerson: '程老师',
    noteLinks: [
      'https://www.bjhd.gov.cn/zjhd/hdyw/202302/t20230206_4603080.shtml',
      'https://www.sohu.com/a/729597257_121123709',
      'https://www.sohu.com/a/748812557_121123709'
    ],
    schoolFeatures: [
      '由国有企业承办的公办幼儿园，公开信息显示西三旗园规划 9 个班、约 315 个学位。',
      '园所宣传强调“惠及民生，爱育幼儿”，西三旗园突出艺术特色，永丰分园突出阅读与养成教育。',
      '近两年连续出现在海淀新增普惠学位、普惠托育试点和财政补助名单中。'
    ],
    facultyStrength: [
      '公开招聘口径强调“高规格管理团队、高标准师资团队”，说明其组织目标偏规范化办园。',
      '幼儿教师招聘要求通常为大专及以上、持教师资格证，并强调教科研能力与业务理论水平。',
      '公开渠道暂未见更细的教师学历占比或骨干教师数量披露，师资透明度一般。'
    ],
    overallEvaluation:
      '优势是新园、公办、普惠、艺术导向明确，基本面稳定；但网上能查到的硬性师资数据不如明天九幼和北师大实验幼儿园充分。'
  },
  {
    shortName: '六一西三旗',
    image: 'https://p2.itc.cn/q_70/images03/20230629/21b4e9c99b4d43d692e5b3e209b962ce.png',
    name: '北京市六一幼儿院西三旗院区',
    category: '教育部公办',
    city: '北京',
    latitude: 40.063909,
    longitude: 116.35847,
    coordinateSystem: 'gcj02' as const,
    phone: '62883025',
    contactPerson: '王老师',
    noteLinks: [
      'https://www.bjnews.com.cn/detail/155151915714964.html',
      'https://www.thepaper.cn/newsDetail_forward_2073832',
      'https://www.thepaper.cn/newsDetail_forward_20488925'
    ],
    schoolFeatures: [
      '西三旗院区 2014 年开园，承接北京市六一幼儿院“家园之爱”与保教合一传统。',
      '六一幼儿院本部具有较强历史积淀，是北京市首批示范幼儿园之一，并持续推进自主游戏与托幼一体化。',
      '公开报道显示西三旗院区参与区级课题成果交流，也承接了本部教育理念在北部片区的延伸。'
    ],
    facultyStrength: [
      '北京市六一幼儿院公开定位包含海淀区学前教育干部教师培训基地和北京市幼儿园教研基地。',
      '公开报道显示其长期承担示范、培训和辐射任务，说明教师培养与教研体系成熟。',
      '西三旗院区自身量化师资数据公开不多，但背靠主院的专业支持比较明显。'
    ],
    overallEvaluation:
      '如果更看重成熟公办体系、文化底蕴和教研传统，这所园很有吸引力；不足是西三旗院区单园的量化公开数据相对有限。'
  },
  {
    shortName: '9511',
    image: 'https://p5.itc.cn/q_70/images03/20230629/115945cbf7bf48a0802b59354d962873.png',
    name: '9511联合社区幼儿园',
    category: '单位公办',
    city: '北京',
    latitude: 40.059475,
    longitude: 116.333813,
    coordinateSystem: 'gcj02' as const,
    phone: '82929332',
    contactPerson: '夏老师',
    noteLinks: [
      'https://www.bjhd.gov.cn/zjhd/hdyw/202407/t20240718_4673875.shtml',
      'https://zyk.bjhd.gov.cn/xxfw/zwfw/df4dbb85657b4f2bbad1f20b171f18f8.htm',
      'https://www.sohu.com/a/826202417_121124216'
    ],
    schoolFeatures: [
      '海淀区公开名录显示其为单位办园，地址位于建材城西路 85 号院。',
      '2025 年财政补助明细显示该园按 10 个班核拨，且连续出现在托班招生与普惠托育试点名单中。',
      '整体更像稳定的社区型公办托幼资源点。'
    ],
    facultyStrength: [
      '海淀公开信息能确认其持续招生、托班服务和财政支持，说明基本办园运行稳定。',
      '公开渠道暂未见教师学历占比、骨干教师数量或系统教研成果披露。',
      '如果重点看师资，需要后续线下核实园长团队、师生比和教师流动率。'
    ],
    overallEvaluation:
      '这所园的线上透明度最低，但“单位公办 + 10 班规模 + 普惠托育/财政支持”说明基本盘稳定，更适合实地核实而不是只看网上资料。'
  },
  {
    shortName: '北科幼教',
    image: 'https://p9.itc.cn/q_70/images03/20230629/e42d2298b101408695e2c21189d8df61.png',
    name: '北京科技大学幼儿教育中心',
    category: '单位公办',
    city: '北京',
    latitude: 40.033399,
    longitude: 116.366899,
    coordinateSystem: 'gcj02' as const,
    phone: '62991349',
    contactPerson: '乔老师',
    noteLinks: [
      'https://ec.ustb.edu.cn/',
      'https://ec.ustb.edu.cn/zs/index.htm'
    ],
    schoolFeatures: [
      '隶属北京科技大学幼儿教育中心，属于高校系统单位办园资源。',
      '官网设有独立招生专栏，信息发布和招生通知更新相对规范。',
      '位置靠近永泰片区，适合与周边社区型公办园一起做通勤对比。'
    ],
    facultyStrength: [
      '当前公开页面可确认其有独立官网和招生信息发布体系。',
      '暂未检索到更细的教师学历比例或骨干教师数量公开数据。',
      '如果重点看师资，建议电话进一步确认教师稳定性和班级配置。'
    ],
    overallEvaluation:
      '这是典型的高校系统单位公办园，线上基础信息存在但不算细，比较适合先电话筛选再决定是否重点跟进。'
  },
  {
    shortName: '龙岗路',
    image: 'https://p2.itc.cn/q_70/images03/20230629/21b4e9c99b4d43d692e5b3e209b962ce.png',
    name: '北京市海淀区龙岗路幼儿园',
    category: '单位公办',
    city: '北京',
    latitude: 40.031638,
    longitude: 116.36289,
    coordinateSystem: 'gcj02' as const,
    phone: '62923010',
    contactPerson: '霍老师',
    noteLinks: [
      'https://www.shangnaxue.com/school/9518615.html'
    ],
    schoolFeatures: [
      '位于龙岗路附近的单位公办幼儿园，地理位置与永泰片区通勤关联度较高。',
      '公开招生类信息相对有限，更偏社区配套型园所。',
      '适合纳入周边公办园横向比较，重点看位置、接送便利度和班级规模。'
    ],
    facultyStrength: [
      '当前公开渠道能确认基础园所信息，但缺少教师学历结构和骨干教师数量披露。',
      '线上透明度一般，需要后续通过电话或实地补齐师资判断。',
      '如果关注师资稳定性，建议重点问园长团队、师生比和近年教师流动情况。'
    ],
    overallEvaluation:
      '这所园目前更像“需要补调研”的候选点，优势在位置和公办属性，最终判断要更依赖电话沟通和线下核实。'
  },
  {
    shortName: '中科院',
    image: 'https://p9.itc.cn/q_70/images03/20230629/e42d2298b101408695e2c21189d8df61.png',
    name: '中科幼教东升幼儿园',
    category: '单位公办',
    city: '北京',
    latitude: 40.050933,
    longitude: 116.351821,
    coordinateSystem: 'gcj02' as const,
    phone: '82612496',
    contactPerson: '刘老师',
    noteLinks: [
      'https://www.caspe.ac.cn/'
    ],
    schoolFeatures: [
      '属于中科幼教体系的单位公办园，位置落在东升片区，和现有几所候选园距离较近。',
      '具备科研院所系统办园背景，适合与高校系统、公办社区园做横向比较。',
      '通勤位置较好，适合纳入“离家近的单位公办园”候选池。'
    ],
    facultyStrength: [
      '当前可确认其属于中科幼教系统，但公开网页层面的细化师资数据较少。',
      '如果重点看师资，建议电话确认教师稳定性、班额和园所教研支持情况。',
      '从体系背景看，通常会有较稳定的单位办园管理支撑。'
    ],
    overallEvaluation:
      '这所园的核心优势是体系背景和位置，属于值得优先电话了解的近距离候选点；最终判断仍要补足公开师资和招生信息。'
  }
];

const makeId = (prefix: string, name: string) =>
  `${prefix}-${name.replace(/[()（）\s]/g, '')}`;

const makeBase = (
  item: {
    name: string;
    shortName?: string;
    category: string;
    latitude: number;
    longitude: number;
    city?: string;
    image?: string;
    images?: string[];
  },
  id: string,
  poiType: 'attraction' | 'restaurant',
  brief: string,
  commend: string,
  noteLinks: string[] = [],
  coordinateSystem?: 'wgs84' | 'gcj02'
): POI => {
  const localImages = getPoiImages(item.name);
  const images = localImages.length > 0 ? localImages : item.images ?? (item.image ? [item.image] : []);
  return ({
  id,
  name: item.name,
  shortName: item.shortName,
  category: item.category,
  poiType,
  address: `${item.city ?? DEFAULT_CITY} · ${item.category}`,
  latitude: item.latitude,
  longitude: item.longitude,
  brief,
  commend,
  noteLinks,
  coordinateSystem,
  image: item.image ?? images[0] ?? `https://picsum.photos/seed/poi-${encodeURIComponent(id)}/800/400`,
  images
  });
};

export const ZHUHAI_POIS: POI[] = [
  ...beijingKindergartens.map((item) => ({
    ...makeBase(
      item,
      makeId('K', item.name),
      'attraction',
      item.schoolFeatures[0],
      item.overallEvaluation,
      item.noteLinks,
      item.coordinateSystem
    ),
    backgroundInfo: undefined,
    schoolFeatures: item.schoolFeatures,
    facultyStrength: item.facultyStrength,
    overallEvaluation: item.overallEvaluation,
    phone: item.phone,
    contactPerson: item.contactPerson
  })),
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

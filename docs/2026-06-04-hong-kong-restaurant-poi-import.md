# 香港餐厅 POI 导入变更说明

## 背景

本次在现有地图探索应用中追加 10 个香港经典餐厅 POI。用户已提供店名、特色、具体位置和参考链接；坐标通过外部地理编码接口查询后写入静态数据。

## 范围

- 追加 10 个 `restaurant` 类型 POI。
- 追加后续 7 个香港美食 POI：甘牌燒鵝、鏞記酒家、一點心、Bakehouse、泰昌餅家、沾仔記、肥姐小食店。
- 复用现有 `restaurants` 源数组和 `POI` 模型。
- 香港美食 POI 统一按店型分类，并由 `category` 驱动 marker 颜色。
- 不新增图片导入；后续可按 `poi-images/<POI 名称>/` 目录约定补图。
- 不新增筛选、页面、路线或后端导入能力。

## 分类与颜色

| Category | Marker Color | Notes |
|---|---|---|
| 燒臘名店 | red | 甘牌燒鵝、鏞記酒家、一樂燒鵝 |
| 茶餐廳與冰室 | amber | 蘭芳園、澳洲牛奶公司、金華冰廳 |
| 港式點心與甜點 | pink | 一點心、Bakehouse、泰昌餅家、佳佳甜品 |
| 粉麵名店 | emerald | 九記牛腩、麥文記、沾仔記 |
| 街頭小吃 | orange | 肥姐小食店 |
| 大排檔小菜 | lime | 愛文生 |
| 煲仔飯小菜 | stone | 坤記煲仔小菜 |
| 港式西餐 | indigo | 太平館餐廳 |

## 字段来源

| Field | Meaning | Source | Owner Object | Editable | Notes |
|---|---|---|---|---|---|
| name | POI 展示名称 | 用户提供 | POI | 是 | 使用中文名 + 英文名 |
| category | 餐厅分类 | 补充整理 | POI | 是 | 用于卡片标签和主题 |
| address | 真实地址 | 用户提供 | POI | 是 | 复用现有 `POI.address` 字段 |
| latitude / longitude | 地图坐标 | Photon API / 高德 JS SDK 命名 POI 复查 | POI | 是 | 坐标按 WGS84 写入；第二批 7 个 POI 已用高德 GCJ-02 结果反算校准 |
| coordinateSystem | 坐标体系 | 本次导入规则 | POI | 是 | 香港坐标使用 `wgs84` |
| noteLinks | 参考链接 | 用户提供 | POI | 是 | 保留 discoverhongkong、MICHELIN、Cathay 等来源 |
| restaurantFeatures | 餐厅特色 | 用户提供 + 简要补充 | POI | 是 | 复用现有餐厅展示字段 |
| recommendedDishes | 推荐菜 | 用户提供 + 简要补充 | POI | 是 | 复用现有餐厅展示字段 |
| whatToPlay | 到店体验 | 简要补充 | POI | 是 | 用于详情页“什么值得玩”区域 |
| mustNotMiss | 必点/重点体验 | 简要补充 | POI | 是 | 用于详情页“必打卡”区域 |
| whatToPrepare | 行前准备 | 简要补充 | POI | 是 | 用于排队、现金、营业时间提示 |
| notesForParents | 家长提示 | 简要补充 | POI | 是 | 面向亲子出行的节奏和口味提示 |

## 验收

- 地图数据中出现 10 个新增香港餐厅 POI。
- 追加的第二批香港美食 POI 不重复创建已有店铺；兰芳园等已有 POI 只更新分类。
- 不同香港美食分类在地图 marker 上显示不同颜色。
- 应用初始地图视野优先定位到香港 POI，而不是北京学校点。
- 新增 POI 使用真实地址展示，不再 fallback 为“珠海 路 分类”。
- 香港 POI 卡片不展示“是否能上”和“备注”输入项，避免把学校/报名决策字段用于旅行餐厅。
- 新增 POI 不影响已有 POI 的地址和图片逻辑。
- `npm run build` 通过。

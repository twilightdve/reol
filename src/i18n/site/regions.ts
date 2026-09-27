// 開催地マップ・ツアーヒートマップ専用の地域名の翻訳(plan/28 第2弾)。
// extractPrefecture が返す日本語の都道府県名・国名・海外サブ地域名を表示言語に変換する。
// 辞書に無い名前はそのまま返す。これらのページからだけ import する(共通チャンクに載せない)。
import type { SiteLang } from "./langs";

type Names = { en: string; ko: string; hant: string; hans: string };

// [日本語, 英語, 韓国語, 繁体字, 簡体字]
const PREFECTURES: [string, string, string, string, string][] = [
  ["北海道", "Hokkaido", "홋카이도", "北海道", "北海道"],
  ["青森県", "Aomori", "아오모리현", "青森縣", "青森县"],
  ["岩手県", "Iwate", "이와테현", "岩手縣", "岩手县"],
  ["宮城県", "Miyagi", "미야기현", "宮城縣", "宫城县"],
  ["秋田県", "Akita", "아키타현", "秋田縣", "秋田县"],
  ["山形県", "Yamagata", "야마가타현", "山形縣", "山形县"],
  ["福島県", "Fukushima", "후쿠시마현", "福島縣", "福岛县"],
  ["茨城県", "Ibaraki", "이바라키현", "茨城縣", "茨城县"],
  ["栃木県", "Tochigi", "도치기현", "栃木縣", "栃木县"],
  ["群馬県", "Gunma", "군마현", "群馬縣", "群马县"],
  ["埼玉県", "Saitama", "사이타마현", "埼玉縣", "埼玉县"],
  ["千葉県", "Chiba", "지바현", "千葉縣", "千叶县"],
  ["東京都", "Tokyo", "도쿄도", "東京都", "东京都"],
  ["神奈川県", "Kanagawa", "가나가와현", "神奈川縣", "神奈川县"],
  ["新潟県", "Niigata", "니가타현", "新潟縣", "新潟县"],
  ["富山県", "Toyama", "도야마현", "富山縣", "富山县"],
  ["石川県", "Ishikawa", "이시카와현", "石川縣", "石川县"],
  ["福井県", "Fukui", "후쿠이현", "福井縣", "福井县"],
  ["山梨県", "Yamanashi", "야마나시현", "山梨縣", "山梨县"],
  ["長野県", "Nagano", "나가노현", "長野縣", "长野县"],
  ["岐阜県", "Gifu", "기후현", "岐阜縣", "岐阜县"],
  ["静岡県", "Shizuoka", "시즈오카현", "靜岡縣", "静冈县"],
  ["愛知県", "Aichi", "아이치현", "愛知縣", "爱知县"],
  ["三重県", "Mie", "미에현", "三重縣", "三重县"],
  ["滋賀県", "Shiga", "시가현", "滋賀縣", "滋贺县"],
  ["京都府", "Kyoto", "교토부", "京都府", "京都府"],
  ["大阪府", "Osaka", "오사카부", "大阪府", "大阪府"],
  ["兵庫県", "Hyogo", "효고현", "兵庫縣", "兵库县"],
  ["奈良県", "Nara", "나라현", "奈良縣", "奈良县"],
  ["和歌山県", "Wakayama", "와카야마현", "和歌山縣", "和歌山县"],
  ["鳥取県", "Tottori", "돗토리현", "鳥取縣", "鸟取县"],
  ["島根県", "Shimane", "시마네현", "島根縣", "岛根县"],
  ["岡山県", "Okayama", "오카야마현", "岡山縣", "冈山县"],
  ["広島県", "Hiroshima", "히로시마현", "廣島縣", "广岛县"],
  ["山口県", "Yamaguchi", "야마구치현", "山口縣", "山口县"],
  ["徳島県", "Tokushima", "도쿠시마현", "德島縣", "德岛县"],
  ["香川県", "Kagawa", "가가와현", "香川縣", "香川县"],
  ["愛媛県", "Ehime", "에히메현", "愛媛縣", "爱媛县"],
  ["高知県", "Kochi", "고치현", "高知縣", "高知县"],
  ["福岡県", "Fukuoka", "후쿠오카현", "福岡縣", "福冈县"],
  ["佐賀県", "Saga", "사가현", "佐賀縣", "佐贺县"],
  ["長崎県", "Nagasaki", "나가사키현", "長崎縣", "长崎县"],
  ["熊本県", "Kumamoto", "구마모토현", "熊本縣", "熊本县"],
  ["大分県", "Oita", "오이타현", "大分縣", "大分县"],
  ["宮崎県", "Miyazaki", "미야자키현", "宮崎縣", "宫崎县"],
  ["鹿児島県", "Kagoshima", "가고시마현", "鹿兒島縣", "鹿儿岛县"],
  ["沖縄県", "Okinawa", "오키나와현", "沖繩縣", "冲绳县"],
];

// 国名・海外サブ地域名(extractPrefecture の OVERSEAS_* の値に対応)
const OVERSEAS: [string, string, string, string, string][] = [
  ["台湾", "Taiwan", "대만", "台灣", "台湾"],
  ["韓国", "South Korea", "한국", "韓國", "韩国"],
  ["中国", "China", "중국", "中國", "中国"],
  ["アメリカ", "USA", "미국", "美國", "美国"],
  ["インドネシア", "Indonesia", "인도네시아", "印尼", "印度尼西亚"],
  ["香港", "Hong Kong", "홍콩", "香港", "香港"],
  // 台湾
  ["台北市", "Taipei", "타이베이시", "台北市", "台北市"],
  ["新北市", "New Taipei", "신베이시", "新北市", "新北市"],
  ["桃園縣", "Taoyuan", "타오위안", "桃園", "桃园"],
  ["台中市", "Taichung", "타이중시", "台中市", "台中市"],
  ["台南市", "Tainan", "타이난시", "台南市", "台南市"],
  ["高雄市", "Kaohsiung", "가오슝시", "高雄市", "高雄市"],
  // 韓国
  ["Seoul", "Seoul", "서울", "首爾", "首尔"],
  ["Gyeonggi-do", "Gyeonggi-do", "경기도", "京畿道", "京畿道"],
  ["Incheon", "Incheon", "인천", "仁川", "仁川"],
  ["Busan", "Busan", "부산", "釜山", "釜山"],
  ["Daegu", "Daegu", "대구", "大邱", "大邱"],
  ["Daejeon", "Daejeon", "대전", "大田", "大田"],
  ["Gwangju", "Gwangju", "광주", "光州", "光州"],
  ["Ulsan", "Ulsan", "울산", "蔚山", "蔚山"],
  ["Jeju-do", "Jeju", "제주도", "濟州道", "济州道"],
  // 中国
  ["上海市", "Shanghai", "상하이", "上海市", "上海市"],
  ["北京市", "Beijing", "베이징", "北京市", "北京市"],
  ["天津市", "Tianjin", "톈진", "天津市", "天津市"],
  ["重庆市", "Chongqing", "충칭", "重慶市", "重庆市"],
  ["浙江省", "Zhejiang", "저장성", "浙江省", "浙江省"],
  ["云南省", "Yunnan", "윈난성", "雲南省", "云南省"],
  ["广东省", "Guangdong", "광둥성", "廣東省", "广东省"],
  ["江苏省", "Jiangsu", "장쑤성", "江蘇省", "江苏省"],
  ["福建省", "Fujian", "푸젠성", "福建省", "福建省"],
  ["四川省", "Sichuan", "쓰촨성", "四川省", "四川省"],
  // アメリカ
  ["Massachusetts", "Massachusetts", "매사추세츠주", "麻薩諸塞州", "马萨诸塞州"],
  ["Washington", "Washington", "워싱턴주", "華盛頓州", "华盛顿州"],
  ["New York", "New York", "뉴욕주", "紐約州", "纽约州"],
  ["California", "California", "캘리포니아주", "加州", "加州"],
  ["Texas", "Texas", "텍사스주", "德州", "得克萨斯州"],
  ["Hawaii", "Hawaii", "하와이주", "夏威夷州", "夏威夷州"],
  // インドネシア
  ["DKI JAKARTA", "Jakarta", "자카르타", "雅加達", "雅加达"],
  ["BALI", "Bali", "발리", "峇里", "巴厘"],
  ["DAERAH ISTIMEWA YOGYAKARTA", "Yogyakarta", "족자카르타", "日惹", "日惹"],
];

const TABLE = new Map<string, Names>(
  [...PREFECTURES, ...OVERSEAS].map(([ja, en, ko, hant, hans]) => [ja, { en, ko, hant, hans }])
);

/** 地域名(都道府県・国・海外サブ地域)を表示言語に変換する。辞書に無ければそのまま */
export const regionLabel = (name: string, lang: SiteLang): string => {
  if (lang === "ja") return name;
  const names = TABLE.get(name);
  if (!names) return name;
  if (lang === "en") return names.en;
  if (lang === "ko") return names.ko;
  return lang === "zh-hant" ? names.hant : names.hans;
};

/**
 * 都道府県の短縮表記(「大阪府」→「大阪」)。ツアーヒートマップの列見出し用。
 * 北海道は接尾辞を取ると不自然になるため例外扱い(英語は元から接尾辞なし)。
 */
export const shortPrefectureLabel = (pref: string, lang: SiteLang): string => {
  const label = regionLabel(pref, lang);
  if (pref === "北海道" || lang === "en") return label;
  if (lang === "ko") return label.replace(/(현|부|도)$/, "");
  return label.replace(/[都道府県縣县]$/, "");
};

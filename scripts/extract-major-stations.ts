/**
 * 駅データ.jpのCSVと乗降客数ランキングをマージして主要駅を抽出するスクリプト
 *
 * 実行: npx tsx scripts/extract-major-stations.ts
 */

import * as fs from "fs";
import * as path from "path";

interface StationRanking {
  rank: number;
  stationName: string;
  companyName: string;
  passengerCount: number;
  prefecture?: string;
}

interface RankingData {
  updatedAt: string;
  source: string;
  totalCount: number;
  rankings: StationRanking[];
}

interface CsvStation {
  station_cd: string;
  station_g_cd: string;
  station_name: string;
  station_name_k: string;
  station_name_r: string;
  line_cd: string;
  pref_cd: string;
  post: string;
  address: string;
  lon: string;
  lat: string;
  open_ymd: string;
  close_ymd: string;
  e_status: string;
  e_sort: string;
}

interface MajorStation {
  stationId: string;
  stationCd: string;
  stationGCd: string;
  stationName: string;
  stationNameKana: string;
  stationNameEn: string;
  prefecture: string;
  prefCode: number;
  line: string;
  lineCd: number;
  lat: number;
  lng: number;
  address: string;
  passengerCount: number;
  passengerRank: number;
}

// 都道府県コードマッピング
const prefectureMap: Record<number, string> = {
  1: "北海道",
  2: "青森県",
  3: "岩手県",
  4: "宮城県",
  5: "秋田県",
  6: "山形県",
  7: "福島県",
  8: "茨城県",
  9: "栃木県",
  10: "群馬県",
  11: "埼玉県",
  12: "千葉県",
  13: "東京都",
  14: "神奈川県",
  15: "新潟県",
  16: "富山県",
  17: "石川県",
  18: "福井県",
  19: "山梨県",
  20: "長野県",
  21: "岐阜県",
  22: "静岡県",
  23: "愛知県",
  24: "三重県",
  25: "滋賀県",
  26: "京都府",
  27: "大阪府",
  28: "兵庫県",
  29: "奈良県",
  30: "和歌山県",
  31: "鳥取県",
  32: "島根県",
  33: "岡山県",
  34: "広島県",
  35: "山口県",
  36: "徳島県",
  37: "香川県",
  38: "愛媛県",
  39: "高知県",
  40: "福岡県",
  41: "佐賀県",
  42: "長崎県",
  43: "熊本県",
  44: "大分県",
  45: "宮崎県",
  46: "鹿児島県",
  47: "沖縄県",
};

// 駅名を正規化（マッチング用）
function normalizeStationName(name: string): string {
  return name
    .replace(/駅$/, "")
    .replace(/（.*）$/, "")
    .replace(/\(.*\)$/, "")
    .replace(/　/g, "")
    .replace(/ /g, "")
    .trim();
}

// スラッグ生成（URL用）
function generateSlug(name: string): string {
  // 簡易的なローマ字変換マップ
  const romajiMap: Record<string, string> = {
    新宿: "shinjuku",
    渋谷: "shibuya",
    池袋: "ikebukuro",
    東京: "tokyo",
    横浜: "yokohama",
    品川: "shinagawa",
    新橋: "shimbashi",
    大宮: "omiya",
    秋葉原: "akihabara",
    北千住: "kitasenju",
    高田馬場: "takadanobaba",
    有楽町: "yurakucho",
    上野: "ueno",
    川崎: "kawasaki",
    目黒: "meguro",
    恵比寿: "ebisu",
    五反田: "gotanda",
    大崎: "osaki",
    田町: "tamachi",
    浜松町: "hamamatsucho",
    神田: "kanda",
    御茶ノ水: "ochanomizu",
    中野: "nakano",
    吉祥寺: "kichijoji",
    立川: "tachikawa",
    荻窪: "ogikubo",
    錦糸町: "kinshicho",
    船橋: "funabashi",
    千葉: "chiba",
    柏: "kashiwa",
    原宿: "harajuku",
    代々木: "yoyogi",
    三鷹: "mitaka",
    国分寺: "kokubunji",
    八王子: "hachioji",
    町田: "machida",
    武蔵小杉: "musashikosugi",
    藤沢: "fujisawa",
    大船: "ofuna",
    戸塚: "totsuka",
    浦和: "urawa",
    赤羽: "akabane",
    川口: "kawaguchi",
    蒲田: "kamata",
    亀戸: "kameido",
    巣鴨: "sugamo",
    田端: "tabata",
    西日暮里: "nishinippori",
    日暮里: "nippori",
    鶯谷: "uguisudani",
    銀座: "ginza",
    表参道: "omotesando",
    六本木: "roppongi",
    赤坂: "akasaka",
    永田町: "nagatacho",
    霞ケ関: "kasumigaseki",
    大手町: "otemachi",
    日本橋: "nihonbashi",
    中目黒: "nakameguro",
    虎ノ門: "toranomon",
    大阪: "osaka",
    梅田: "umeda",
    難波: "namba",
    天王寺: "tennoji",
    京橋: "kyobashi",
    三宮: "sannomiya",
    京都: "kyoto",
    神戸: "kobe",
    新大阪: "shinosaka",
    心斎橋: "shinsaibashi",
    名古屋: "nagoya",
    栄: "sakae",
    金山: "kanayama",
    豊橋: "toyohashi",
    岐阜: "gifu",
    博多: "hakata",
    天神: "tenjin",
    小倉: "kokura",
    熊本: "kumamoto",
    鹿児島中央: "kagoshimachuo",
    札幌: "sapporo",
    大通: "odori",
    すすきの: "susukino",
    新札幌: "shinsapporo",
    手稲: "teine",
    仙台: "sendai",
    盛岡: "morioka",
    郡山: "koriyama",
    福島: "fukushima",
    山形: "yamagata",
    新宿三丁目: "shinjukusanchome",
    飯田橋: "iidabashi",
    市ヶ谷: "ichigaya",
    四ツ谷: "yotsuya",
    水道橋: "suidobashi",
    溜池山王: "tameikesanno",
    青山一丁目: "aoyamaitchome",
    乃木坂: "nogizaka",
    広尾: "hiroo",
    麻布十番: "azabujuban",
    白金高輪: "shirokanetakanawa",
    泉岳寺: "sengakuji",
    門前仲町: "monzennakamachi",
    清澄白河: "kiyosumishirakawa",
    押上: "oshiage",
    豊洲: "toyosu",
    月島: "tsukishima",
    勝どき: "kachidoki",
    築地: "tsukiji",
    東銀座: "higashiginza",
    新富町: "shintomicho",
    茅場町: "kayabacho",
    人形町: "ningyocho",
    小伝馬町: "kodenmacho",
    馬喰横山: "bakuroyokoyama",
    浅草橋: "asakusabashi",
    両国: "ryogoku",
    浅草: "asakusa",
    上野広小路: "uenohirokoji",
    御徒町: "okachimachi",
    新御茶ノ水: "shinochanomizu",
    小川町: "ogawamachi",
    神保町: "jimbocho",
    九段下: "kudanshita",
    半蔵門: "hanzomon",
    麹町: "kojimachi",
    赤坂見附: "akasakamitsuke",
    国会議事堂前: "kokkaigijidomae",
    桜田門: "sakuradamon",
    二重橋前: "nijubashimae",
    日比谷: "hibiya",
    内幸町: "uchisaiwaicho",
    御成門: "onarimon",
    神谷町: "kamiyacho",
    虎ノ門ヒルズ: "toranomonhills",
    外苑前: "gaienmae",
    代官山: "daikanyama",
    祐天寺: "yutenji",
    学芸大学: "gakugeidaigaku",
    都立大学: "toritsudaigaku",
    自由が丘: "jiyugaoka",
    田園調布: "denenchofu",
    多摩川: "tamagawa",
    武蔵新城: "musashishinjo",
    武蔵中原: "musashinakahara",
    武蔵溝ノ口: "musashimizonokuchi",
    登戸: "noborito",
    向ヶ丘遊園: "mukogaokayuen",
    生田: "ikuta",
    読売ランド前: "yomiurilandmae",
    百合ヶ丘: "yurigaoka",
    新百合ヶ丘: "shinyurigaoka",
    柿生: "kakio",
    鶴川: "tsurukawa",
    玉川学園前: "tamagawagakuenmae",
    相模大野: "sagamiono",
    海老名: "ebina",
    本厚木: "honatsugi",
    小田原: "odawara",
    平塚: "hiratsuka",
    茅ヶ崎: "chigasaki",
    辻堂: "tsujido",
    鎌倉: "kamakura",
    逗子: "zushi",
    久里浜: "kurihama",
    横須賀中央: "yokosukachuo",
    金沢文庫: "kanazawabunko",
    上大岡: "kamioooka",
    日吉: "hiyoshi",
    綱島: "tsunashima",
    菊名: "kikuna",
    新横浜: "shinyokohama",
    鴨居: "kamoi",
    中山: "nakayama",
    長津田: "nagatsuta",
    たまプラーザ: "tamaplaza",
    あざみ野: "azamino",
    青葉台: "aobadai",
    藤が丘: "fujigaoka",
    市が尾: "ichigao",
    江田: "eda",
    センター北: "centerkita",
    センター南: "centerminami",
    二俣川: "futamatagawa",
    大和: "yamato",
    湘南台: "shonandai",
    南越谷: "minamikoshigaya",
    越谷: "koshigaya",
    草加: "soka",
    春日部: "kasukabe",
    所沢: "tokorozawa",
    川越: "kawagoe",
    和光市: "wakoshi",
    志木: "shiki",
    朝霞台: "asakadai",
    津田沼: "tsudanuma",
    本八幡: "motoyawata",
    市川: "ichikawa",
    西船橋: "nishifunabashi",
  };

  return romajiMap[name] || name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// CSVをパース
function parseCsv(content: string): CsvStation[] {
  const lines = content.split("\n");
  const headers = lines[0].split(",");

  return lines
    .slice(1)
    .filter((line) => line.trim())
    .map((line) => {
      const values = line.split(",");
      const station: Record<string, string> = {};
      headers.forEach((header, index) => {
        station[header.trim()] = values[index]?.trim() || "";
      });
      return station as unknown as CsvStation;
    });
}

async function main() {
  const dataDir = path.join(process.cwd(), "data");

  // 乗降客数ランキングを読み込み
  const rankingPath = path.join(dataDir, "station-rankings.json");
  if (!fs.existsSync(rankingPath)) {
    console.error("station-rankings.json not found. Run scrape-station-rankings.ts first.");
    process.exit(1);
  }
  const rankingData: RankingData = JSON.parse(fs.readFileSync(rankingPath, "utf-8"));
  console.log(`Loaded ${rankingData.rankings.length} station rankings`);

  // CSVを読み込み
  const csvPath = path.join(process.cwd(), "station20251211free.csv");
  if (!fs.existsSync(csvPath)) {
    console.error("station20251211free.csv not found.");
    process.exit(1);
  }
  const csvContent = fs.readFileSync(csvPath, "utf-8");
  const csvStations = parseCsv(csvContent);
  console.log(`Loaded ${csvStations.length} stations from CSV`);

  // 営業中の駅のみフィルタリング（e_status = 0 が営業中）
  const activeStations = csvStations.filter((s) => s.e_status === "0");
  console.log(`Active stations: ${activeStations.length}`);

  // 駅名でインデックス作成
  const stationByName = new Map<string, CsvStation[]>();
  for (const station of activeStations) {
    const normalizedName = normalizeStationName(station.station_name);
    if (!stationByName.has(normalizedName)) {
      stationByName.set(normalizedName, []);
    }
    stationByName.get(normalizedName)!.push(station);
  }

  // マージ処理
  const majorStations: MajorStation[] = [];
  const unmatchedStations: string[] = [];

  for (const ranking of rankingData.rankings) {
    const normalizedName = normalizeStationName(ranking.stationName);
    const matches = stationByName.get(normalizedName);

    if (matches && matches.length > 0) {
      // 最初のマッチを使用（複数路線ある場合）
      const csvStation = matches[0];
      const prefCode = parseInt(csvStation.pref_cd, 10);

      majorStations.push({
        stationId: generateSlug(ranking.stationName),
        stationCd: csvStation.station_cd,
        stationGCd: csvStation.station_g_cd,
        stationName: ranking.stationName,
        stationNameKana: csvStation.station_name_k || "",
        stationNameEn: csvStation.station_name_r || generateSlug(ranking.stationName),
        prefecture: prefectureMap[prefCode] || ranking.prefecture || "",
        prefCode,
        line: "", // 路線情報は別途取得が必要
        lineCd: parseInt(csvStation.line_cd, 10),
        lat: parseFloat(csvStation.lat),
        lng: parseFloat(csvStation.lon),
        address: csvStation.address || "",
        passengerCount: ranking.passengerCount,
        passengerRank: ranking.rank,
      });
    } else {
      unmatchedStations.push(ranking.stationName);
      // マッチしなくてもフォールバックデータを使用
      if (ranking.prefecture) {
        majorStations.push({
          stationId: generateSlug(ranking.stationName),
          stationCd: "",
          stationGCd: "",
          stationName: ranking.stationName,
          stationNameKana: "",
          stationNameEn: generateSlug(ranking.stationName),
          prefecture: ranking.prefecture,
          prefCode: 0,
          line: "",
          lineCd: 0,
          lat: 0,
          lng: 0,
          address: "",
          passengerCount: ranking.passengerCount,
          passengerRank: ranking.rank,
        });
      }
    }
  }

  console.log(`\nMatched: ${majorStations.length} stations`);
  if (unmatchedStations.length > 0) {
    console.log(`Unmatched: ${unmatchedStations.length} stations`);
    console.log("Unmatched stations:", unmatchedStations.slice(0, 20).join(", "));
  }

  // 結果を保存
  const outputPath = path.join(dataDir, "major-stations.json");
  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      {
        updatedAt: new Date().toISOString(),
        totalCount: majorStations.length,
        stations: majorStations,
      },
      null,
      2
    ),
    "utf-8"
  );

  console.log(`\nSaved ${majorStations.length} major stations to ${outputPath}`);
  console.log("\nTop 10 stations:");
  majorStations.slice(0, 10).forEach((s) => {
    console.log(
      `  ${s.passengerRank}. ${s.stationName} (${s.prefecture}) - ${s.passengerCount.toLocaleString()}人/日`
    );
  });
}

main().catch(console.error);

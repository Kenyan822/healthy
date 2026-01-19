import { NextRequest, NextResponse } from "next/server";
import { getAllChains } from "@/lib/db/queries";
import { calculateDistance } from "@/lib/location";

// Google Places API キー（サーバーサイドのみ）
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// DBにあるチェーン店名とPlaces APIの検索キーワードのマッピング
const chainSearchKeywords: Record<string, string[]> = {
  ootoya: ["大戸屋"],
  matsuya: ["松屋"],
  yoshinoya: ["吉野家"],
  sukiya: ["すき家"],
  mcdonalds: ["マクドナルド", "McDonald's"],
  starbucks: ["スターバックス", "Starbucks"],
  "coco-ichibanya": ["CoCo壱番屋", "ココイチ"],
  ichiran: ["一蘭"],
  marugame: ["丸亀製麺"],
  gusto: ["ガスト"],
  saizeriya: ["サイゼリヤ"],
  yayoiken: ["やよい軒"],
};

// Places API (New) のレスポンス型
interface PlaceNewResult {
  id: string;
  displayName: {
    text: string;
    languageCode: string;
  };
  formattedAddress: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

interface NearbyStoreResult {
  chainId: string;
  chainName: string;
  storeName: string;
  address: string;
  distance: number;
  lat: number;
  lng: number;
  placeId: string;
  category: string;
}

/**
 * Google Places API (New) - Text Search でチェーン店を検索
 */
async function searchPlacesForChain(
  chainId: string,
  chainName: string,
  keywords: string[],
  lat: number,
  lng: number,
  radius: number
): Promise<NearbyStoreResult[]> {
  const results: NearbyStoreResult[] = [];
  const seenPlaceIds = new Set<string>();

  for (const keyword of keywords) {
    try {
      // Places API (New) - Text Search を使用
      const requestBody = {
        textQuery: keyword,
        locationBias: {
          circle: {
            center: {
              latitude: lat,
              longitude: lng,
            },
            radius: radius,
          },
        },
        languageCode: "ja",
        maxResultCount: 10,
        includedType: "restaurant",
      };

      console.log(`[Places API New] Searching for "${keyword}" near ${lat},${lng}`);

      const response = await fetch(
        "https://places.googleapis.com/v1/places:searchText",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY!,
            "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      if (data.error) {
        console.error(`[Places API New] Error for "${keyword}":`, data.error.message);
        continue;
      }

      const places = data.places || [];
      console.log(`[Places API New] Response for "${keyword}": ${places.length} results`);

      for (const place of places as PlaceNewResult[]) {
        // 重複チェック
        if (seenPlaceIds.has(place.id)) continue;
        seenPlaceIds.add(place.id);

        // 店名にチェーン店名が含まれているか確認
        const placeName = place.displayName?.text || "";
        const isMatch = keywords.some(
          (kw) =>
            placeName.includes(kw) ||
            placeName.toLowerCase().includes(kw.toLowerCase())
        );

        if (isMatch && place.location) {
          const distance = calculateDistance(
            lat,
            lng,
            place.location.latitude,
            place.location.longitude
          );

          // 指定した半径内のみ追加
          if (distance <= radius / 1000) {
            results.push({
              chainId,
              chainName,
              storeName: placeName,
              address: place.formattedAddress || "",
              distance: Math.round(distance * 100) / 100,
              lat: place.location.latitude,
              lng: place.location.longitude,
              placeId: place.id,
              category: "",
            });
          }
        }
      }
    } catch (error) {
      console.error(`Error searching for ${chainName}:`, error);
    }
  }

  return results;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get("lat") || "");
    const lng = parseFloat(searchParams.get("lng") || "");
    const radius = parseInt(searchParams.get("radius") || "3000", 10); // デフォルト3km
    const limit = parseInt(searchParams.get("limit") || "12", 10);

    console.log("[Nearby API] Request:", { lat, lng, radius, limit });

    // バリデーション
    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { success: false, error: "緯度・経度が必要です" },
        { status: 400 }
      );
    }

    if (!GOOGLE_MAPS_API_KEY) {
      console.error("[Nearby API] Google Maps API key is not set");
      return NextResponse.json(
        { success: false, error: "Google Maps APIが設定されていません" },
        { status: 500 }
      );
    }

    console.log("[Nearby API] API Key exists:", !!GOOGLE_MAPS_API_KEY);

    // DBからチェーン店一覧を取得
    const chains = getAllChains();
    console.log("[Nearby API] Chains from DB:", chains.length);
    const chainMap = new Map(chains.map((c) => [c.chainId, c]));

    // 各チェーン店を並行で検索
    const searchPromises = Object.entries(chainSearchKeywords).map(
      ([chainId, keywords]) => {
        const chain = chainMap.get(chainId);
        if (!chain) return Promise.resolve([]);

        return searchPlacesForChain(
          chainId,
          chain.chainName,
          keywords,
          lat,
          lng,
          radius
        ).then((results) =>
          results.map((r) => ({
            ...r,
            category: chain.category,
          }))
        );
      }
    );

    const allResults = await Promise.all(searchPromises);
    const flatResults = allResults.flat();

    // 距離順にソートしてリミット適用
    const sortedResults = flatResults
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    return NextResponse.json({
      success: true,
      data: sortedResults,
      meta: {
        location: { lat, lng },
        radius,
        totalFound: flatResults.length,
        returned: sortedResults.length,
      },
    });
  } catch (error) {
    console.error("Nearby stores API error:", error);
    return NextResponse.json(
      { success: false, error: "店舗検索中にエラーが発生しました" },
      { status: 500 }
    );
  }
}

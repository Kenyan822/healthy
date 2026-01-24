/**
 * Google Places API統合モジュール
 * 駅周辺のチェーン店を検索してDBに保存するための関数群
 */

// 環境変数からAPIキーを取得（サーバーサイド用）
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export interface PlacesSearchResult {
  placeId: string;
  displayName: string;
  formattedAddress: string;
  location: { lat: number; lng: number };
  rating?: number;
  userRatingCount?: number;
}

/**
 * Haversine公式で2点間の距離を計算（メートル）
 */
export function calculateDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // 地球の半径 (m)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Google Places API (New) で駅周辺のチェーン店を検索
 * @param lat 駅の緯度
 * @param lng 駅の経度
 * @param chainName チェーン店名（例: "大戸屋"）
 * @param radiusMeters 検索半径（デフォルト: 500m）
 */
export async function searchNearbyChain(
  lat: number,
  lng: number,
  chainName: string,
  radiusMeters: number = 500
): Promise<PlacesSearchResult[]> {
  if (!GOOGLE_PLACES_API_KEY) {
    console.warn("GOOGLE_MAPS_API_KEY is not configured");
    return [];
  }

  try {
    // Places API (New) - Text Search を使用
    const response = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount",
        },
        body: JSON.stringify({
          textQuery: chainName,
          locationBias: {
            circle: {
              center: { latitude: lat, longitude: lng },
              radius: radiusMeters,
            },
          },
          languageCode: "ja",
          maxResultCount: 5,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Places API error: ${response.status} - ${errorText}`);
      return [];
    }

    const data = await response.json();

    if (!data.places || data.places.length === 0) {
      return [];
    }

    const results: PlacesSearchResult[] = data.places.map(
      (place: {
        id: string;
        displayName?: { text: string };
        formattedAddress?: string;
        location?: { latitude: number; longitude: number };
        rating?: number;
        userRatingCount?: number;
      }) => ({
        placeId: place.id,
        displayName: place.displayName?.text || chainName,
        formattedAddress: place.formattedAddress || "",
        location: {
          lat: place.location?.latitude || 0,
          lng: place.location?.longitude || 0,
        },
        rating: place.rating,
        userRatingCount: place.userRatingCount,
      })
    );

    // 駅からの距離を計算してフィルタリング（radiusMeters以内のみ）
    return results.filter((place) => {
      const distance = calculateDistanceMeters(
        lat,
        lng,
        place.location.lat,
        place.location.lng
      );
      return distance <= radiusMeters;
    });
  } catch (error) {
    console.error("Error searching nearby chain:", error);
    return [];
  }
}

/**
 * 指定した駅とチェーン店の組み合わせで店舗を検索
 * @returns 店舗情報と距離
 */
export async function searchStationChain(
  stationLat: number,
  stationLng: number,
  chainName: string,
  radiusMeters: number = 500
): Promise<
  Array<PlacesSearchResult & { distanceMeters: number }>
> {
  const places = await searchNearbyChain(
    stationLat,
    stationLng,
    chainName,
    radiusMeters
  );

  return places.map((place) => ({
    ...place,
    distanceMeters: calculateDistanceMeters(
      stationLat,
      stationLng,
      place.location.lat,
      place.location.lng
    ),
  }));
}

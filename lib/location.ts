import type { UserLocation, NearbyStore } from "@/types/search";

// 環境変数からAPIキーを取得
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// 位置情報機能が有効かどうか
export const LOCATION_FEATURE_ENABLED = !!GOOGLE_MAPS_API_KEY;

/**
 * ブラウザのGeolocation APIで現在地を取得
 */
export function getCurrentPosition(): Promise<UserLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5分間キャッシュ
      }
    );
  });
}

/**
 * Haversine公式で2点間の距離を計算（km）
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // 地球の半径 (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Google Places APIで近くの店舗を検索
 * @param chainName チェーン店名
 * @param lat 緯度
 * @param lng 経度
 * @param radius 検索半径（メートル）
 */
export async function findNearbyStores(
  chainName: string,
  lat: number,
  lng: number,
  radius: number = 5000
): Promise<NearbyStore[]> {
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn("Google Maps API key is not configured");
    return [];
  }

  try {
    const url = new URL(
      "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    );
    url.searchParams.set("location", `${lat},${lng}`);
    url.searchParams.set("radius", radius.toString());
    url.searchParams.set("keyword", chainName);
    url.searchParams.set("type", "restaurant");
    url.searchParams.set("key", GOOGLE_MAPS_API_KEY);
    url.searchParams.set("language", "ja");

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("Google Places API error:", data.status);
      return [];
    }

    const results: NearbyStore[] = (data.results || []).map(
      (place: {
        place_id: string;
        name: string;
        vicinity: string;
        geometry: { location: { lat: number; lng: number } };
      }) => ({
        chainId: "", // チェーンIDは別途マッピングが必要
        storeName: place.name,
        address: place.vicinity,
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
        distance: calculateDistance(
          lat,
          lng,
          place.geometry.location.lat,
          place.geometry.location.lng
        ),
        placeId: place.place_id,
      })
    );

    // 距離順にソート
    return results.sort((a, b) => a.distance - b.distance);
  } catch (error) {
    console.error("Error fetching nearby stores:", error);
    return [];
  }
}

/**
 * 距離を人間が読みやすい形式に変換
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
}

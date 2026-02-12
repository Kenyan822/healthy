"use client";

import { useEffect } from "react";

export function ViewCounter({ menuId }: { menuId: string }) {
  useEffect(() => {
    fetch(`/api/menus/${menuId}/view`, { method: "POST" }).catch(() => {
      // サイレントに失敗
    });
  }, [menuId]);

  return null;
}

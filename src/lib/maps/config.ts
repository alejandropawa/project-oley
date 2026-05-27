export function areInteractiveMapsEnabled() {
  return (
    process.env.NEXT_PUBLIC_ENABLE_INTERACTIVE_MAPS === "true" &&
    Boolean(process.env.NEXT_PUBLIC_MAP_TILES_URL?.trim())
  );
}

export function getMapTilesUrl() {
  return process.env.NEXT_PUBLIC_MAP_TILES_URL?.trim() ?? "";
}

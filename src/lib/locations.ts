import raw from "./iran-locations.json";

type LocationTree = Record<string, Record<string, string[]>>;

const tree = raw as LocationTree;

export const PROVINCES: string[] = Object.keys(tree).sort((a, b) => a.localeCompare(b, "fa"));

export function getCounties(province: string): string[] {
  const counties = tree[province];
  if (!counties) return [];
  return Object.keys(counties).sort((a, b) => a.localeCompare(b, "fa"));
}

export function getCities(province: string, county: string): string[] {
  const cities = tree[province]?.[county];
  if (!cities) return [];
  return [...cities].sort((a, b) => a.localeCompare(b, "fa"));
}

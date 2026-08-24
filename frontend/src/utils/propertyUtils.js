export function parsePropertyPhotos(photoData) {
  try {
    const parsedPhotos = JSON.parse(photoData || "[]");
    return Array.isArray(parsedPhotos) ? parsedPhotos : [];
  } catch {
    return [];
  }
}

export function parseOpenHouseRemarks(allData) {
  try {
    const parsed = JSON.parse(allData || "{}");
    return parsed.OpenHouseRemarks || "";
  } catch {
    return "";
  }
}

export function sanitizeFileName(name: string) {
  return (
    name
      .replace(/[\\/:*?"<>|]/g, "-")
      .trim()
      .replace(/\s+/g, " ") || "ملف بدون اسم"
  );
}

export function extensionOf(name: string) {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : "";
}

export function formatBytes(bytes: number) {
  if (!bytes) return "0 ب";
  const units = ["ب", "ك.ب", "م.ب", "ج.ب"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** exponent;
  return `${value >= 10 || exponent === 0 ? Math.round(value) : value.toFixed(1)} ${units[exponent]}`;
}

type ShareableFile = { uri: string; name: string };

/** بديل فحص الأنواع؛ يختار Metro النسخة الأصلية أو نسخة الويب بحسب المنصة. */
export async function shareMultipleFiles(_files: ShareableFile[]): Promise<boolean> {
  return false;
}

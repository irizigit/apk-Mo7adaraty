import Share from "react-native-share";

type ShareableFile = { uri: string; name: string };

export async function shareMultipleFiles(files: ShareableFile[]): Promise<boolean> {
  const localUris = files
    .map((file) => file.uri.trim())
    .filter((uri) => uri.startsWith("file://"))
    .filter((uri, index, all) => all.indexOf(uri) === index);
  if (localUris.length < 2) return false;
  try {
    await Share.open({
      title: `مشاركة ${localUris.length} ملفات من محاضراتي`,
      urls: localUris,
      type: "*/*",
      failOnCancel: false,
    });
    return true;
  } catch {
    return false;
  }
}

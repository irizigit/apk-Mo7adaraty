import Share from "react-native-share";

type ShareableFile = { uri: string; name: string };

export async function shareMultipleFiles(files: ShareableFile[]): Promise<boolean> {
  if (files.length < 2) return false;
  try {
    await Share.open({
      title: `مشاركة ${files.length} ملفات من محاضراتي`,
      urls: files.map((file) => file.uri),
      filenames: files.map((file) => file.name),
      failOnCancel: false,
    });
    return true;
  } catch {
    return false;
  }
}

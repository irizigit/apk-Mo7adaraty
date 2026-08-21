import { describe, expect, it } from "vitest";
import { extensionOf, formatBytes, sanitizeFileName } from "../lib/file-utils";

describe("أدوات مدير الملفات", () => {
  it("ينظف اسم الملف من المحارف غير المسموحة", () => {
    expect(sanitizeFileName("  محاضرة: 1 / النهائية.pdf  ")).toBe(
      "محاضرة- 1 - النهائية.pdf",
    );
  });

  it("يتعرف على امتداد الملف ويعيده بحروف صغيرة", () => {
    expect(extensionOf("Lesson.PDF")).toBe("pdf");
    expect(extensionOf("ملاحظات")).toBe("");
  });

  it("يعرض حجم الملف بصيغة عربية مختصرة", () => {
    expect(formatBytes(0)).toBe("0 ب");
    expect(formatBytes(1024)).toBe("1.0 ك.ب");
    expect(formatBytes(2 * 1024 * 1024)).toBe("2.0 م.ب");
  });
});

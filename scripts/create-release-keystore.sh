#!/usr/bin/env bash
set -euo pipefail

OUTPUT_PATH="${1:-./mo7adaraty-release.keystore}"
ALIAS="${2:-mo7adaraty}"

if [ -e "$OUTPUT_PATH" ]; then
  echo "Refusing to overwrite existing keystore: $OUTPUT_PATH" >&2
  exit 1
fi

echo "سيُنشأ مفتاح توقيع دائم. احتفظ به في مكان آمن ولا ترفعه إلى GitHub."
keytool -genkeypair -v \
  -keystore "$OUTPUT_PATH" \
  -alias "$ALIAS" \
  -keyalg RSA -keysize 4096 -validity 10000 \
  -dname "CN=Mo7adaraty, O=Mo7adaraty, C=MA"

echo
echo "تم إنشاء: $OUTPUT_PATH"
echo "شغّل الأمر التالي على جهازك لنسخ قيمة ANDROID_KEYSTORE_BASE64:"
echo "base64 -w 0 '$OUTPUT_PATH'"

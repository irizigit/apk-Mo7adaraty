import { Text } from "react-native";
import { ScreenContainer } from "@/components/screen-container";

/**
 * بديل آمن لفحص الأنواع فقط؛ يحمّل Metro النسخة native أو web بحسب المنصة.
 */
export default function FilePreviewFallback() {
  return (
    <ScreenContainer className="items-center justify-center px-6">
      <Text>المعاينة غير متاحة على هذه المنصة.</Text>
    </ScreenContainer>
  );
}

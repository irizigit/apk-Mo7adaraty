# ملاحظات تكامل المشاركة والمعاينة

## استقبال ملفات المشاركة

تم اختيار مكتبة `expo-share-intent` بالإصدار `5.1.1` لأنها تتوافق مع Expo SDK 54 حسب تعريفات peer dependencies الخاصة بها. توفر المكتبة موفر `ShareIntentProvider` وخطاف `useShareIntentContext`، وتعرض الملفات الواردة ضمن `shareIntent.files` بالحقول: `path` و`fileName` و`mimeType` و`size`.

يجب إعداد إضافة Expo باسم `expo-share-intent` مع مرشحات Android للمشاركة الفردية والمتعددة للنوع `*/*`، واستخدام بناء تطويري أو Release؛ لا تعمل هذه الميزة من Expo Go.

المصدر: https://github.com/achorein/expo-share-intent

## معاينة PDF

تم اختيار `react-native-pdf` لمعالجة PDF محلياً في شاشة معاينة داخل التطبيق. تدعم المكتبة React Native الحديث وتوفر مكوّن `Pdf` لعرض مصدر ملف محلي.

المصدر: https://github.com/wonday/react-native-pdf

## مشاركة مجلدات

تم اختيار `react-native-zip-archive` لإنشاء ZIP من ملفات المجلد قبل إرساله عبر واجهة المشاركة الأصلية.

المصدر: https://github.com/mockingbot/react-native-zip-archive

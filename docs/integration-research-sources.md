# مراجع تصميم منصة التنزيل والإشعارات

## الموقع الحالي

- صفحة التنزيل الحالية التي راجعناها: https://irizi.unaux.com/mo7adaraty-apk/
- تعرض الصفحة إصداراً وعداد تنزيلات ورابط لوحة الإدارة في `admin/login.php`، مع تنزيل عبر `index.php?download=true`.

## استضافة APK

- مناقشة حد ملف منصة InfinityFree/Ezyro: https://forum.infinityfree.com/t/increase-max-upload-size/72851
- النتيجة التصميمية: لا يعتمد الموقع على رفع APK إلى الاستضافة المجانية؛ بل يستخدم GitHub Releases كمصدر أساسي وGoogle Drive وMediaFire كمرايا، ويوجه `download.php` المستخدم إليها بعد تسجيل النقرة.

## إشعارات Expo

- الإعداد والمتطلبات وFCM V1: https://docs.expo.dev/push-notifications/push-notifications-setup/
- إرسال الإشعارات وفحص tickets/receipts: https://docs.expo.dev/push-notifications/sending-notifications/
- القرار التصميمي: إعلان داخل التطبيق عند الفتح كمسار موثوق، وإشعارات Push اختيارية للأجهزة التي وافقت وسجلت Expo Push Token.

## مشاركة ملفات متعددة

- مكتبة react-native-share: https://github.com/react-native-share/react-native-share
- مرجع `Share.open` ودعم `urls`: https://react-native-share.github.io/react-native-share/docs/share-open
- القرار التصميمي: مشاركة عدة ملفات محلية عبر `urls` من دون ضغط؛ يضغط المجلد فقط إلى ZIP لأن نظام المشاركة لا ينقل شجرة المجلدات مباشرة.

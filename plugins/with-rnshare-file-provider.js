const { withAndroidManifest, withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const PROVIDER_AUTHORITY = "${applicationId}.rnshare.fileprovider";
const PATHS_RESOURCE = "@xml/rnshare_filepaths";

/**
 * react-native-share converts file:// URIs to content:// URIs on Android.
 * Expo prebuild does not add this FileProvider automatically, therefore it is
 * declared here so ACTION_SEND_MULTIPLE can safely grant each recipient read access.
 */
function withRnShareFileProvider(config) {
  config = withAndroidManifest(config, (mod) => {
    const application = mod.modResults.manifest.application?.[0];
    if (!application) return mod;

    application.provider = application.provider ?? [];
    const existing = application.provider.find(
      (provider) => provider.$?.["android:authorities"] === PROVIDER_AUTHORITY,
    );

    if (!existing) {
      application.provider.push({
        $: {
          "android:name": "androidx.core.content.FileProvider",
          "android:authorities": PROVIDER_AUTHORITY,
          "android:exported": "false",
          "android:grantUriPermissions": "true",
        },
        "meta-data": [
          {
            $: {
              "android:name": "android.support.FILE_PROVIDER_PATHS",
              "android:resource": PATHS_RESOURCE,
            },
          },
        ],
      });
    }
    return mod;
  });

  return withDangerousMod(config, ["android", async (mod) => {
    const xmlDirectory = path.join(mod.modRequest.platformProjectRoot, "app", "src", "main", "res", "xml");
    fs.mkdirSync(xmlDirectory, { recursive: true });
    fs.writeFileSync(
      path.join(xmlDirectory, "rnshare_filepaths.xml"),
      `<?xml version="1.0" encoding="utf-8"?>\n<paths xmlns:android="http://schemas.android.com/apk/res/android">\n  <files-path name="app_files" path="." />\n  <cache-path name="app_cache" path="." />\n  <external-files-path name="external_app_files" path="." />\n  <external-cache-path name="external_app_cache" path="." />\n</paths>\n`,
      "utf8",
    );
    return mod;
  }]);
}

module.exports = withRnShareFileProvider;

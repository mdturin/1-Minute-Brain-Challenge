const { withSettingsGradle } = require('@expo/config-plugins');

const LOCAL_REPO_ENTRY =
  '        maven { url "$rootDir/../node_modules/@react-native-async-storage/async-storage/android/local_repo" }';

/**
 * Expo config plugin that registers the async-storage local Maven repository
 * in android/settings.gradle. Required for @react-native-async-storage/async-storage v3+
 * which bundles org.asyncstorage.shared_storage:storage-android as a local AAR.
 */
const withAsyncStorageRepo = (config) => {
  return withSettingsGradle(config, (mod) => {
    if (mod.modResults.contents.includes('asyncstorage')) {
      return mod;
    }

    // Inject inside the repositories block within dependencyResolutionManagement
    const updated = mod.modResults.contents.replace(
      /(dependencyResolutionManagement[\s\S]*?repositories\s*\{)/,
      `$1\n${LOCAL_REPO_ENTRY}`
    );

    if (updated === mod.modResults.contents) {
      // Fallback: no dependencyResolutionManagement block found, append one
      mod.modResults.contents +=
        `\ndependencyResolutionManagement {\n    repositories {\n${LOCAL_REPO_ENTRY}\n    }\n}\n`;
    } else {
      mod.modResults.contents = updated;
    }

    return mod;
  });
};

module.exports = withAsyncStorageRepo;

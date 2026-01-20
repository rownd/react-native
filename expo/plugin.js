const { withMainActivity, withInfoPlist } = require('expo/config-plugins');

const withRowndMainActivity = (config) => {
  return withMainActivity(config, async (actConfig) => {
    let mainActivityString = actConfig.modResults.contents;

    if (!mainActivityString.includes('RowndPluginPackage.preInit')) {
      const regex = /super.onCreate\(\w+\);?/;
      mainActivityString = mainActivityString.replace(
        regex,
        `super.onCreate(savedInstanceState);\n    RowndPluginPackage.preInit(this);\n`
      );
    }

    if (
      !mainActivityString.includes(
        'com.reactnativerowndplugin.RowndPluginPackage'
      )
    ) {
      const regex = /import\s+\S+\n/;
      mainActivityString = mainActivityString.replace(
        regex,
        `import com.reactnativerowndplugin.RowndPluginPackage;\n$&`
      );
    }

    const newConfig = {
      ...actConfig,
      modResults: {
        ...actConfig.modResults,
        contents: mainActivityString,
      },
    };

    return newConfig;
  });
};

const withRowndPlist = (config) => {
  return withInfoPlist(config, async (actConfig) => {
    const LSApplicationQueriesSchemes =
      actConfig.modResults?.LSApplicationQueriesSchemes || [];
    const additionalSchemes = ['googlegmail', 'ms-outlook', 'ymail'];
    additionalSchemes.forEach((scheme) => {
      if (!LSApplicationQueriesSchemes.includes(scheme)) {
        LSApplicationQueriesSchemes.push(scheme);
      }
    });

    return {
      ...actConfig,
      modResults: {
        ...actConfig?.modResults,
        LSApplicationQueriesSchemes,
      },
    };
  });
};

module.exports.withRowndSDK = (config) =>
  withRowndMainActivity(withRowndPlist(config));

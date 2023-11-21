const { withMainActivity, withInfoPlist } = require('expo/config-plugins');

const withRowndMainActivity = (config) => {
  return withMainActivity(config, async (config) => {
    let mainActivityString = config.modResults.contents;

    if (!mainActivityString.includes('RowndPluginPackage.preInit')) {
      const regex = /super.onCreate\(\w+\)\s*\S/;
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
      const regex = /import\s+\S+\;/;
      mainActivityString = mainActivityString.replace(
        regex,
        `import com.reactnativerowndplugin.RowndPluginPackage;\n$&`
      );
    }

    const newConfig = {
      ...config,
      modResults: {
        ...config.modResults,
        contents: mainActivityString,
      },
    };

    return newConfig;
  });
};

const withRowndPlist = (config) => {
  return withInfoPlist(config, async (config) => {
    const LSApplicationQueriesSchemes =
      config.modResults?.LSApplicationQueriesSchemes || [];
    const additionalSchemes = ['googlegmail', 'ms-outlook', 'ymail'];
    additionalSchemes.forEach((scheme) => {
      if (!LSApplicationQueriesSchemes.includes(scheme)) {
        LSApplicationQueriesSchemes.push(scheme);
      }
    });

    return {
      ...config,
      modResults: {
        ...config?.modResults,
        LSApplicationQueriesSchemes,
      },
    };
  });
};

module.exports.withRowndSDK = (config) =>
  withRowndMainActivity(withRowndPlist(config));

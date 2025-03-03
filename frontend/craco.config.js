// craco.config.js
module.exports = {
    webpack: {
      configure: (webpackConfig) => {
        // Найдем правило для source-map-loader и добавим исключение
        webpackConfig.module.rules.forEach((rule) => {
          if (rule.use) {
            rule.use.forEach((loader) => {
              if (
                loader.loader &&
                loader.loader.includes("source-map-loader")
              ) {
                loader.options = loader.options || {};
                loader.options.exclude = loader.options.exclude || [];
                loader.options.exclude.push(/node_modules\/@mediapipe\/tasks-vision/);
              }
            });
          }
        });
        return webpackConfig;
      },
    },
  };
  
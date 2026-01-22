const { getDefaultConfig } = require('expo/metro-config');

module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts },
  } = await getDefaultConfig(__dirname);

  return {
    ...getDefaultConfig(__dirname),
    resolver: {
      sourceExts,
      assetExts,
      alias: {
        'react-native-gesture-handler': 'react-native-gesture-handler/index',
      },
    },
  };
});

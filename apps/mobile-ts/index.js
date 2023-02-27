import TrackPlayer, { IOSCategory } from 'react-native-track-player';

TrackPlayer.setupPlayer({
	autoUpdateMetadata: true,
	iosCategory: IOSCategory.Playback,
});

import 'expo-router/entry';

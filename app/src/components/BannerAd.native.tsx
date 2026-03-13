import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { BannerAd as GmaBannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { getAdUnitIds } from '../logic/adsConfig';

type Props = {
  size?: BannerAdSize | 'BANNER' | 'FULL_BANNER' | 'LARGE_BANNER' | 'LEADERBOARD' | 'MEDIUM_RECTANGLE' | 'SMART_BANNER';
};

export default function BannerAd({ size = BannerAdSize.BANNER }: Props) {
  const adUnitId =
    __DEV__ ? TestIds.BANNER : getAdUnitIds(Platform.OS === 'android' ? 'android' : 'ios').banner;

  return (
    <View style={styles.container}>
      <GmaBannerAd unitId={adUnitId} size={size} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
});


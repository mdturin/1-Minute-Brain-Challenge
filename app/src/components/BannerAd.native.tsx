import React, { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { BannerAd as GmaBannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { getAdUnitIds } from '../logic/adsConfig';

type Props = {
  size?: BannerAdSize | 'BANNER' | 'FULL_BANNER' | 'LARGE_BANNER' | 'LEADERBOARD' | 'MEDIUM_RECTANGLE' | 'SMART_BANNER';
};

export default function BannerAd({ size = BannerAdSize.BANNER }: Props) {
  const [loaded, setLoaded] = useState(false);
  const adUnitId =
    __DEV__ ? TestIds.BANNER : getAdUnitIds(Platform.OS === 'android' ? 'android' : 'ios').banner;

  return (
    <View style={[styles.container, !loaded && styles.placeholder]}>
      <GmaBannerAd
        unitId={adUnitId}
        size={size}
        onAdLoaded={() => setLoaded(true)}
        onAdFailedToLoad={() => setLoaded(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  placeholder: {
    minHeight: 66,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 4,
  },
});


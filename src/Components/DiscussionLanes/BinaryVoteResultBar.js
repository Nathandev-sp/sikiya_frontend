import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, LayoutAnimation, Platform, UIManager } from 'react-native';
import { SENTIMENT_SECONDARY_SEGMENT, SENTIMENT_TRACK_BG } from '../../theme/discussionLanePalette';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const BAR_HEIGHT = 12;
const TRACK_PAD = 2;

/**
 * Split sentiment bar: animated primary width vs secondary fill.
 */
export default function BinaryVoteResultBar({
    primaryPct,
    secondaryPct,
    primaryColor,
    secondaryColor = SENTIMENT_SECONDARY_SEGMENT,
    height = BAR_HEIGHT,
}) {
    const [innerW, setInnerW] = useState(0);
    const widthAnim = useRef(new Animated.Value(0)).current;

    const p = Math.max(0, Math.min(100, primaryPct));
    const s = Math.max(0, Math.min(100, secondaryPct));
    const hasVotes = p + s > 0;
    const ratio = hasVotes ? p / (p + s) : 0.5;
    const targetPrimary = innerW > 0 ? innerW * ratio : 0;

    useEffect(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }, [primaryPct, secondaryPct]);

    useEffect(() => {
        if (innerW <= 0) return;
        Animated.spring(widthAnim, {
            toValue: targetPrimary,
            useNativeDriver: false,
            friction: 8,
            tension: 70,
        }).start();
    }, [targetPrimary, innerW, widthAnim]);

    const r = Math.max(0, (height - TRACK_PAD * 2) / 2 - 1);

    return (
        <View
            style={[
                styles.track,
                {
                    height,
                    borderRadius: height / 2,
                    backgroundColor: SENTIMENT_TRACK_BG,
                    padding: TRACK_PAD,
                },
            ]}
            onLayout={(e) => {
                const w = e.nativeEvent.layout.width - TRACK_PAD * 2;
                if (w > 0 && w !== innerW) setInnerW(w);
            }}
        >
            <View style={[styles.row, { height: height - TRACK_PAD * 2 }]}>
                <Animated.View
                    style={[
                        styles.primary,
                        {
                            width: widthAnim,
                            backgroundColor: primaryColor,
                            borderTopLeftRadius: r,
                            borderBottomLeftRadius: r,
                            borderTopRightRadius: hasVotes && p > 0 && s > 0 ? 3 : r,
                            borderBottomRightRadius: hasVotes && p > 0 && s > 0 ? 3 : r,
                        },
                    ]}
                />
                <View
                    style={[
                        styles.secondary,
                        {
                            backgroundColor: secondaryColor,
                            borderTopRightRadius: r,
                            borderBottomRightRadius: r,
                            borderTopLeftRadius: hasVotes && p > 0 && s > 0 ? 3 : r,
                            borderBottomLeftRadius: hasVotes && p > 0 && s > 0 ? 3 : r,
                        },
                    ]}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    track: {
        width: '100%',
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        width: '100%',
    },
    primary: {
        minWidth: 0,
    },
    secondary: {
        flex: 1,
        minWidth: 4,
    },
});

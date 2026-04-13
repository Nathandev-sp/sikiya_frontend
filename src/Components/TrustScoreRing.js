import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import {
    MainBrownSecondaryColor,
    MainSecondaryBlueColor,
    generalTextColor,
    generalTextFont,
    withdrawnTitleColor,
} from '../styles/GeneralAppStyle';

const TrustScoreRing = memo(({ score, size = 46, strokeWidth = 3 }) => {
    const hasScore = score != null && !Number.isNaN(Number(score));
    const pct = hasScore ? Math.max(0, Math.min(100, Number(score))) / 100 : 0;

    const { cx, cy, r, circumference, strokeDashoffset, arcColor } = useMemo(() => {
        const cx0 = size / 2;
        const cy0 = size / 2;
        const r0 = size / 2 - strokeWidth / 2 - 1;
        const c = 2 * Math.PI * r0;
        let color = MainBrownSecondaryColor;
        if (hasScore) {
            if (pct >= 0.75) color = MainSecondaryBlueColor;
            else if (pct >= 0.45) color = MainBrownSecondaryColor;
            else color = '#C17A4A';
        }
        return {
            cx: cx0,
            cy: cy0,
            r: r0,
            circumference: c,
            strokeDashoffset: c * (1 - pct),
            arcColor: color,
        };
    }, [size, strokeWidth, pct, hasScore]);

    const label = hasScore ? `${Math.round(Number(score))}` : '—';

    return (
        <View
            style={[styles.wrap, { width: size, height: size }]}
            accessibilityRole="image"
            accessibilityLabel={
                hasScore
                    ? `Journalist trust score ${Math.round(Number(score))} percent`
                    : 'Trust score not available'
            }
        >
            <Svg width={size} height={size} style={StyleSheet.absoluteFillObject}>
                <Circle
                    cx={cx}
                    cy={cy}
                    r={r}
                    stroke="#E8E4DD"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                {hasScore ? (
                    <Circle
                        cx={cx}
                        cy={cy}
                        r={r}
                        stroke={arcColor}
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        transform={`rotate(-90 ${cx} ${cy})`}
                    />
                ) : null}
            </Svg>
            <View style={styles.labelCenter} pointerEvents="none">
                <Text style={styles.labelMain}>
                    {label}
                    {hasScore ? <Text style={styles.labelPctSuffix}>%</Text> : null}
                </Text>
            </View>
        </View>
    );
});

TrustScoreRing.displayName = 'TrustScoreRing';

const styles = StyleSheet.create({
    wrap: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    labelCenter: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 1,
    },
    labelMain: {
        fontSize: 12,
        fontWeight: '700',
        color: generalTextColor,
        fontFamily: generalTextFont,
        lineHeight: 15,
    },
    labelPctSuffix: {
        fontSize: 8,
        fontWeight: '600',
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
    },
});

export default TrustScoreRing;

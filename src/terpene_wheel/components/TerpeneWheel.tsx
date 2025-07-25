import React from 'react';
import { Dimensions, Pressable } from 'react-native';
import Svg, { Circle, Line, Text as SvgText, Path } from 'react-native-svg';
import Animated, { useSharedValue, withTiming, useAnimatedProps } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { TERPENES, TerpeneInfo } from '../data/terpenes';

const { width } = Dimensions.get('window');
const SIZE = Math.min(width - 32, 320);
const R = SIZE / 2 - 10;
const CX = SIZE / 2;
const CY = SIZE / 2;

const AnimatedPath = Animated.createAnimatedComponent(Path);

type Props = { onSelect: (t: TerpeneInfo) => void };

export const TerpeneWheel: React.FC<Props> = ({ onSelect }) => {
  const angleStep = 360 / TERPENES.length;

  return (
    <Svg width={SIZE} height={SIZE}>
      {/* Outer ring */}
      <Circle cx={CX} cy={CY} r={R} stroke="#2E5D46" strokeWidth={2} fill="none" />

      {/* Radial lines */}
      {TERPENES.map((_, i) => {
        const a = ((i * angleStep - 90) * Math.PI) / 180;
        return (
          <Line
            key={`rad-${i}`}
            x1={CX}
            y1={CY}
            x2={CX + R * Math.cos(a)}
            y2={CY + R * Math.sin(a)}
            stroke="#2E5D46"
            strokeWidth={1}
            opacity={0.25}
          />
        );
      })}

      {/* Segments */}
      {TERPENES.map((t, i) => (
        <TerpeneSegment key={t.key} index={i} info={t} angleStep={angleStep} onSelect={onSelect} />
      ))}
    </Svg>
  );
};

const TerpeneSegment: React.FC<{
  index: number;
  info: TerpeneInfo;
  angleStep: number;
  onSelect: (t: TerpeneInfo) => void;
}> = ({ index, info, angleStep, onSelect }) => {
  // Compute wedge geometry
  const startDeg = index * angleStep - 90;
  const endDeg = startDeg + angleStep;
  const valueR = R * info.percent;
  const start = polarToCartesian(CX, CY, valueR, endDeg);
  const end = polarToCartesian(CX, CY, valueR, startDeg);
  const largeArc = angleStep > 180 ? 1 : 0;

  // Path for both segment fill and wave overlay
  const pathD =
    'M ' +
    CX +
    ' ' +
    CY +
    ' L ' +
    end.x +
    ' ' +
    end.y +
    ' A ' +
    valueR +
    ' ' +
    valueR +
    ' 0 ' +
    largeArc +
    ' 0 ' +
    start.x +
    ' ' +
    start.y +
    ' Z';

  // Highlight animation
  const highlight = useSharedValue(0);
  const animatedProps = useAnimatedProps(() => ({
    opacity: withTiming(highlight.value ? 0.7 : 0.35, { duration: 150 }),
  }));

  // Aroma-wave animation values
  const waveScale = useSharedValue(0);
  const waveOpacity = useSharedValue(0);
  const waveProps = useAnimatedProps(() => ({
    transform: [{ scale: waveScale.value }],
    opacity: waveOpacity.value,
  }));

  const triggerWave = () => {
    waveScale.value = 1;
    waveOpacity.value = 0.15;
    waveScale.value = withTiming(1.4, { duration: 900 });
    waveOpacity.value = withTiming(0, { duration: 400 });
  };

  const handlePress = () => {
    highlight.value = 1;
    Haptics.selectionAsync();
    triggerWave();
    onSelect(info);
    setTimeout(() => {
      highlight.value = 0;
    }, 300);
  };

  // Label position
  const midDeg = (startDeg + endDeg) / 2;
  const labelX = CX + (R + 18) * Math.cos((midDeg * Math.PI) / 180);
  const labelY = CY + (R + 18) * Math.sin((midDeg * Math.PI) / 180);

  return (
    <Pressable onPress={handlePress}>
      {/* Wave overlay */}
      <AnimatedPath
        animatedProps={waveProps}
        d={pathD}
        stroke={info.waveColor}
        strokeWidth={4}
        fill="none"
      />

      {/* Segment fill */}
      <AnimatedPath
        animatedProps={animatedProps}
        d={pathD}
        fill="#8CD24C"
        stroke="#2E5D46"
        strokeWidth={highlight.value ? 1 : 0}
      />

      {/* Label */}
      <SvgText
        x={labelX}
        y={labelY}
        fontSize={14}
        fontFamily="Inter-Medium"
        fill="#333"
        textAnchor="middle"
      >
        {info.name}
      </SvgText>
    </Pressable>
  );
};

function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

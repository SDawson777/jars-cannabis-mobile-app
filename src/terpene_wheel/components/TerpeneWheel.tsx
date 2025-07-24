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
      <Circle cx={CX} cy={CY} r={R} stroke="#2E5D46" strokeWidth={2} fill="none" />
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
      {TERPENES.map((t, i) => (
        <TerpeneSegment key={t.key} index={i} info={t} angleStep={angleStep} onSelect={onSelect} />
      ))}
    </Svg>
  );
};
const TerpeneSegment = ({
  index,
  info,
  angleStep,
  onSelect,
}: {
  index: number;
  info: TerpeneInfo;
  angleStep: number;
  onSelect: (t: TerpeneInfo) => void;
}) => {
  const startDeg = index * angleStep - 90;
  const endDeg = startDeg + angleStep;
  const valueR = R * info.percent;
  const start = polarToCartesian(CX, CY, valueR, endDeg);
  const end = polarToCartesian(CX, CY, valueR, startDeg);
  const largeArc = angleStep > 180 ? 1 : 0;
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
  const highlight = useSharedValue(0);
  const animatedProps = useAnimatedProps(() => ({
    opacity: withTiming(highlight.value ? 0.7 : 0.35, { duration: 150 }),
  }));
  const handlePress = () => {
    highlight.value = 1;
    Haptics.selectionAsync();
    onSelect(info);
    setTimeout(() => {
      highlight.value = 0;
    }, 300);
  };
  return (
    <Pressable onPress={handlePress}>
      <AnimatedPath
        d={pathD}
        fill="#8CD24C"
        animatedProps={animatedProps}
        stroke="#2E5D46"
        strokeWidth={highlight.value ? 1 : 0}
      />
      <SvgText
        x={CX + (R + 18) * Math.cos((((startDeg + endDeg) / 2) * Math.PI) / 180)}
        y={CY + (R + 18) * Math.sin((((startDeg + endDeg) / 2) * Math.PI) / 180)}
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

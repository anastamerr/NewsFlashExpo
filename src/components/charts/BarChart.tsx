import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CartesianChart, Bar } from 'victory-native';
import { useTheme } from '@/theme';

interface DataPoint {
  x: number;
  y: number;
  label?: string;
  [key: string]: unknown;
}

interface Props {
  data: DataPoint[];
  height?: number;
  color?: string;
  xLabels?: string[];
}

export function BarChart({
  data,
  height = 200,
  color,
  xLabels,
}: Props) {
  const { colors } = useTheme();
  const barColor = color ?? colors.primary;

  return (
    <View style={[styles.container, { height }]}>
      <CartesianChart
        data={data}
        xKey="x"
        yKeys={['y']}
        axisOptions={{
          font: null,
          tickCount: { x: data.length, y: 4 },
          lineColor: colors.border,
          labelColor: colors.textTertiary,
          formatXLabel: xLabels
            ? (val: number) => xLabels[Math.round(val)] ?? ''
            : undefined,
        }}
        domainPadding={{ left: 20, right: 20, top: 10 }}
      >
        {({ points, chartBounds }) => (
          <Bar
            points={points.y}
            chartBounds={chartBounds}
            color={barColor}
            roundedCorners={{ topLeft: 4, topRight: 4 }}
            animate={{ type: 'timing', duration: 500 }}
          />
        )}
      </CartesianChart>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});

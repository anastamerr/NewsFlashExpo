import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CartesianChart, Line, useChartPressState } from 'victory-native';
import { useFont } from '@shopify/react-native-skia';
import { useTheme, spacing } from '@/theme';

interface DataPoint {
  x: number;
  y: number;
}

interface Series {
  data: DataPoint[];
  color?: string;
  label?: string;
}

interface Props {
  series: Series[];
  height?: number;
  showGrid?: boolean;
  xLabels?: string[];
}

export function LineChart({
  series,
  height = 200,
  showGrid = true,
  xLabels,
}: Props) {
  const { colors } = useTheme();

  const chartColors = [
    colors.chart1,
    colors.chart2,
    colors.chart3,
    colors.chart4,
    colors.chart5,
  ];

  // Combine all series into a single dataset with multiple y keys
  const combinedData = series[0]?.data.map((point, i) => {
    const row: Record<string, number> = { x: point.x };
    series.forEach((s, si) => {
      row[`y${si}`] = s.data[i]?.y ?? 0;
    });
    return row;
  }) ?? [];

  return (
    <View style={[styles.container, { height }]}>
      <CartesianChart
        data={combinedData}
        xKey="x"
        yKeys={series.map((_, i) => `y${i}`) as any}
        axisOptions={{
          font: null,
          tickCount: { x: xLabels?.length ?? 5, y: 4 },
          lineColor: colors.border,
          labelColor: colors.textTertiary,
          formatXLabel: xLabels
            ? (val: number) => xLabels[Math.round(val)] ?? ''
            : undefined,
        }}
        domainPadding={{ top: 10, bottom: 10 }}
      >
        {({ points, chartBounds }) =>
          series.map((s, i) => (
            <Line
              key={i}
              points={points[`y${i}` as keyof typeof points] as any}
              color={s.color ?? chartColors[i % chartColors.length]}
              strokeWidth={2.5}
              curveType="natural"
              animate={{ type: 'timing', duration: 600 }}
            />
          ))
        }
      </CartesianChart>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});

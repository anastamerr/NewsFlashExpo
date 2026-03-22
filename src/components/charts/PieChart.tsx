import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Pie, PolarChart } from 'victory-native';
import { useTheme, spacing } from '@/theme';
import { typePresets } from '@/theme/typography';

interface Slice {
  value: number;
  label: string;
  color?: string;
}

interface Props {
  data: Slice[];
  size?: number;
  innerRadius?: number;
  centerLabel?: string;
  centerValue?: string;
}

export function PieChart({
  data,
  size = 180,
  innerRadius = 60,
  centerLabel,
  centerValue,
}: Props) {
  const { colors } = useTheme();

  const chartColors = [
    colors.chart1,
    colors.chart2,
    colors.chart3,
    colors.chart4,
    colors.chart5,
  ];

  const coloredData = data.map((d, i) => ({
    ...d,
    color: d.color ?? chartColors[i % chartColors.length],
  }));

  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, { width: size, height: size }]}>
        <PolarChart
          data={coloredData}
          labelKey="label"
          valueKey="value"
          colorKey="color"
        >
          <Pie.Chart
            innerRadius={innerRadius}
          />
        </PolarChart>
        {centerLabel && (
          <View style={[styles.centerLabel, { width: size, height: size }]}>
            {centerValue && (
              <Text style={[typePresets.monoLg, { color: colors.text }]}>{centerValue}</Text>
            )}
            <Text style={[typePresets.labelXs, { color: colors.textTertiary }]}>{centerLabel}</Text>
          </View>
        )}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {coloredData.map((d) => (
          <View key={d.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: d.color }]} />
            <Text style={[typePresets.bodySm, { color: colors.textSecondary }]}>
              {d.label}
            </Text>
            <Text style={[typePresets.monoSm, { color: colors.text, marginLeft: 'auto' }]}>
              {d.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  container: {
    position: 'relative',
  },
  centerLabel: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legend: {
    marginTop: spacing.base,
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

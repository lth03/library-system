<template>
  <div class="chart-card">
    <h3>📈 近7天借阅趋势</h3>
    <v-chart v-if="option" :option="option" autoresize class="chart" />
    <div v-else class="chart-empty">暂无数据</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import VChart from 'vue-echarts';
import { useTheme } from '@/stores/theme';
import type { DailyTrend } from '@/config/Interface';

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent, LegendComponent]);

const props = defineProps<{ trend: DailyTrend[] }>();
const { isDark } = useTheme();

const textColor = computed(() => (isDark.value ? '#a8a0b0' : '#6b6375'));
const axisColor = computed(() => (isDark.value ? '#2b2830' : '#e5e4e7'));

const option = computed(() => {
  if (!props.trend || props.trend.length === 0) return null;
  const dates = props.trend.map((d) => {
    const dt = new Date(d.date);
    return `${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  });
  return {
    tooltip: { trigger: 'axis', backgroundColor: isDark.value ? '#1d1a22' : '#fff', borderColor: axisColor.value, textStyle: { color: textColor.value } },
    legend: { data: ['借出', '归还'], textStyle: { color: textColor.value } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: dates, axisLine: { lineStyle: { color: axisColor.value } }, axisLabel: { color: textColor.value } },
    yAxis: { type: 'value', minInterval: 1, axisLine: { lineStyle: { color: axisColor.value } }, axisLabel: { color: textColor.value }, splitLine: { lineStyle: { color: axisColor.value, type: 'dashed' } } },
    series: [
      { name: '借出', type: 'bar', barWidth: '30%', data: props.trend.map((d) => d.borrows), itemStyle: { color: '#5470c6', borderRadius: [4, 4, 0, 0] } },
      { name: '归还', type: 'bar', barWidth: '30%', data: props.trend.map((d) => d.returns), itemStyle: { color: '#91cc75', borderRadius: [4, 4, 0, 0] } },
    ],
  };
});
</script>

<style lang="less" scoped src="./style.less"></style>

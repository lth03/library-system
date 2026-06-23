<template>
  <div class="chart-card">
    <h3>🔥 热门图书 TOP 10</h3>
    <v-chart v-if="option" :option="option" autoresize class="chart" />
    <div v-else class="chart-empty">暂无数据</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import VChart from 'vue-echarts';
import { useTheme } from '@/stores/theme';
import type { HotBook } from '@/config/Interface';

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent]);

const props = defineProps<{ hotBooks: HotBook[] }>();
const { isDark } = useTheme();

const textColor = computed(() => (isDark.value ? '#a8a0b0' : '#6b6375'));
const axisColor = computed(() => (isDark.value ? '#2b2830' : '#e5e4e7'));

const option = computed(() => {
  const books = props.hotBooks;
  if (!books || books.length === 0) return null;
  const sorted = [...books].reverse();
  const titles = sorted.map((b) => (b.title.length > 12 ? b.title.slice(0, 12) + '…' : b.title));
  const counts = sorted.map((b) => b.borrowCount);
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, backgroundColor: isDark.value ? '#1d1a22' : '#fff', borderColor: axisColor.value, textStyle: { color: textColor.value },
      formatter: (params: any) => { const b = sorted[params[0].dataIndex]; return `${b.title}<br/>作者：${b.author}<br/>借阅次数：${b.borrowCount}`; } },
    grid: { left: '3%', right: '8%', bottom: '3%', containLabel: true },
    xAxis: { type: 'value', minInterval: 1, axisLine: { lineStyle: { color: axisColor.value } }, axisLabel: { color: textColor.value }, splitLine: { lineStyle: { color: axisColor.value, type: 'dashed' } } },
    yAxis: { type: 'category', data: titles, axisLine: { lineStyle: { color: axisColor.value } }, axisLabel: { color: textColor.value } },
    series: [{
      type: 'bar',
      data: counts.map((v) => ({ value: v, itemStyle: { color: '#fa8c16', borderRadius: [0, 4, 4, 0] } })),
      label: { show: true, position: 'right', color: textColor.value, formatter: (params: any) => `${params.value} 次` },
    }],
  };
});
</script>

<style lang="less" scoped src="./style.less"></style>

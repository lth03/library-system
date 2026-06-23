import { ref, watch } from 'vue';

/**
 * 主题切换
 *
 * 在 <html> 上添加/移除 dark class，并将偏好持久化到 localStorage
 */
const isDark = ref(localStorage.getItem('theme') === 'dark');

// 初始化：根据 localStorage 应用主题
if (isDark.value) {
  document.documentElement.classList.add('dark');
}

// 监听变化同步到 DOM 和 localStorage
watch(isDark, (val) => {
  document.documentElement.classList.toggle('dark', val);
  localStorage.setItem('theme', val ? 'dark' : 'light');
});

export function useTheme() {
  /** 切换暗色/亮色主题 */
  function toggle() {
    isDark.value = !isDark.value;
  }

  return { isDark, toggle };
}

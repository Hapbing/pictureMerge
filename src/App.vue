<template>
  <router-view></router-view>
</template>

<script setup>
// 路由容器，不需要额外逻辑
</script>

<style>
/* 全局样式 */
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
    Arial, sans-serif;
  background-color: #f6f8fa;
}
</style>

<style>
/* 全局禁用滚动条 */
::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  background: transparent !important;
}

* {
  -ms-overflow-style: none !important; /* IE and Edge */
  scrollbar-width: none !important; /* Firefox */
}
</style>

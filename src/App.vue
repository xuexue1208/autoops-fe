<template>
  <!-- 路由占位符，路由匹配到的vue文件会展示在这个位置 -->
    <router-view></router-view>
</template>

<style>
    html, body {
        /* 屏幕浏览器的最大高和宽 */
        width: 100vw;
        height: 100vh;
        /* 最小宽度 */
        min-width: 1425px;
        /* 隐藏滚轴 */
        overflow-y: hidden;
    }
    #nprogress .bar {
        /*自定义进度条颜色*/
        background: #fa0000 !important;
    }
</style>


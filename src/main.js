import { createApp } from 'vue'
// 导入：导入组件的别名
import App from './App.vue'

//引入vue-router
import router from './router'

//引入ant design和主题样式
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css';
//import 'ant-design-vue/dist/antd.dark.css';

import CButton from '@/components/CButton'

//全局引入antd图标
import * as Icons from '@ant-design/icons-vue'

//codemirror编辑器
import { GlobalCmComponent } from "codemirror-editor-vue3";

// 引入主题 可以从 codemirror/theme/ 下引入多个
import 'codemirror/theme/dracula.css'

// 引入语言模式 可以从 codemirror/mode/ 下引入多个
import 'codemirror/mode/yaml/yaml.js'


const app = createApp(App)

//引入图标, i是组件名，Icons[i]是具体的组件
for (const i in Icons) {
    app.component(i, Icons[i])
}

app.component('c-button', CButton)
app.use(GlobalCmComponent, { componentName: "codemirror" });

//引入antd组件库
app.use(Antd)

//引入router
app.use(router)

app.mount('#app')
<template>
    <div>
        <a-card :bodyStyle="{padding: '10px'}">
            <a-row>
                <a-col :span="20">
                    <div style="text-align:left;">
                        <span v-if="namespace" style="font-size:15px;">Namespace: </span>
                        <a-select v-if="namespace" @change="nsChange" show-search style="width:140px;margin-right:20px;" size="middle" v-model:value="namespaceValue" placeholder="请选择">
                            <a-select-option
                                v-for="(item, index) in namespaceList"
                                :key="index"
                                :value="item.metadata.name">
                                {{ item.metadata.name }}
                            </a-select-option>
                        </a-select>
                        <span v-if="en" style="font-size:15px;">业务环境: </span>
                        <a-select v-if="en" @change="enChange" show-search style="width:140px;margin-right:20px;" size="middle" v-model:value="enValue" placeholder="请选择">
                            <a-select-option value="">全部</a-select-option>
                            <a-select-option
                                v-for="(item) in enList"
                                :key="item.id"
                                :value="item.env">
                                {{ item.env }}
                            </a-select-option>
                        </a-select>

                        <a-input 
                            allow-clear 
                            @change="searchChange" 
                            style="width:200px;margin-right:10px;" 
                            v-model:value="searchValue"
                            size="middle"  
                            :placeholder="searchDescribe">
                        </a-input>

                        <a-button size="middle" type="primary" shape="round" @click="$emit('dataList')">
                            <template #icon><SearchOutlined /></template>
                            搜索
                        </a-button>

                    </div>
                </a-col>
                <a-col :span="4">
                    <div style="text-align:right;">
                        <a-button v-if="add" style="margin-right:10px;" size="middle" type="primary" ghost @click="$emit('addFunc')">
                            <template #icon><PlusOutlined /></template>
                            新增
                        </a-button>
                        <a-button size="middle" @click="$emit('dataList')">
                            <template #icon><UndoOutlined /></template>
                            刷新
                        </a-button>
                    </div>
                </a-col>
            </a-row>
        </a-card>
    </div>
</template>

<script>
import { onMounted, reactive, ref } from 'vue';
import common from "@/config";
import httpClient from '@/request';
import { message } from 'ant-design-vue';
export default ({
    name: 'MainHead',
    // 声明父传子属性
    props: {
        en: { type: Boolean, default: false },
        namespace: { type: Boolean, default: false },
        searchDescribe: { type: String, default: '' },
        add: { type: Boolean, default: false},
    },
    // 声明子传父事件
    emits: ['enChange', 'searchChange', 'namespaceChange', 'namespaceList', 'dataList', 'addFunc'],
    setup(props, ctx) {
        const enValue = ref('')
        const enList = ref([])
        const searchValue = ref('')
        const namespaceValue = ref('default')
        //命名空间列表
        const namespaceList = ref([])
        const namespaceTotal = ref(0)
        const namespaceListData = reactive({
            url: common.k8sNamespaceList,
            params: {
                cluster: ''
            }
        })
        //【监听】
        // watch(namespaceValue, (newVal) => {
        //     localStorage.setItem("namespace", newVal)
        //     ctx.emit('namespaceChange', newVal)
        //     ctx.emit('dataList')
        //     console.log(localStorage.getItem("namespace"), 456)
        // }, {immediate:true})
        //【方法】
        const envAllListData = reactive({
            url: common.evnList,
            params: {}
        })
        function getEnvAllList() {
            httpClient.get(envAllListData.url, {params: envAllListData.params})
            .then(res => {
                //响应成功，获取pod列表和total
                enList.value = res.data
            })
            .catch(res => {
                message.error(res.msg)
            })
        }
        const enChange = (val) => {
            enValue.value = val
            localStorage.setItem("en", val)
            ctx.emit('enChange', val)
            ctx.emit('dataList')
        }
        const nsChange = (val) => {
            namespaceValue.value = val
            localStorage.setItem("namespace", val)
            ctx.emit('namespaceChange', val)
            ctx.emit('dataList')
        }
        const searchChange = () => {
            ctx.emit('searchChange', searchValue.value)
        }
        //获取命名空间列表
        const getNamespaceList = () => {
            namespaceListData.params.cluster = localStorage.getItem('k8s_cluster')
            httpClient.get(namespaceListData.url, {params: namespaceListData.params})
            .then(res => {
                namespaceList.value = res.data.items
                namespaceTotal.value = res.data.total
                ctx.emit('namespaceList', namespaceList.value)
            })
            .catch(res => {
                message.error(res.msg)
            })
        }

        onMounted(() => {
            if (props.en) {
                if (localStorage.getItem('en') != null ) {
                    enChange(localStorage.getItem('en'))
                } else {
                    enChange(enValue.value)
                }
            }
            if (localStorage.getItem('namespace')) {
                nsChange(localStorage.getItem('namespace'))
            } else {
                nsChange(namespaceValue.value)
            }
            getNamespaceList()
            getEnvAllList()
        })
        return {
            enValue,
            enList,
            searchValue,
            namespaceValue,
            namespaceList,
            nsChange,
            searchChange,
            enChange
        }
    },
})
</script>

<style scoped>
    .ant-btn {
        border-radius: 1px;
    }
</style>
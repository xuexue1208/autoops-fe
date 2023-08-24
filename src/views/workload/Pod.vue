<template>
    <div>
        <MainHead
            searchDescribe="请输入"
            @searchChange="getSearchValue"
            namespace
            @namespaceChange="getNamespaceValue"
            @dataList="getPodList"/>
        <!-- 数据表格 -->
        <a-card :bodyStyle="{padding: '10px'}">
            <a-table
                style="font-size:12px;" 
                :loading="appLoading" 
                :columns="columns" 
                :dataSource="podList"
                :pagination="pagination"
                @change="handleTableChange">
                <!-- column为 columns的循环数据
                record为 podList的循环数据 -->
                <template #bodyCell="{ column, record }">
                    <template v-if="column.dataIndex === 'name'">
                        <span style="font-weight: bold;">{{ record.metadata.name }}</span>
                    </template>
                    <template v-if="column.dataIndex === 'node'">
                        <span style="color: rgb(84, 138, 238);">{{ record.spec.nodeName }}</span>
                    </template>
                    <template v-if="column.dataIndex === 'state'">
                        <div :class="{'succ-dot':record.status.phase == 'Running', 'warn-dot':record.status.phase == 'Pending', 'err-dot':record.status.phase != 'Running' && record.status.phase != 'Pending'}"></div>
                        <span :class="{'succ-state':record.status.phase == 'Running', 'warn-state':record.status.phase == 'Pending', 'err-status':record.status.phase != 'Running' && record.status.phase != 'Pending'}">{{ record.status.phase }} </span>
                    </template>
                    <template v-if="column.dataIndex === 'restarts'">
                         <span>{{ restartTotal(record) }} </span>
                    </template>
                    <template v-if="column.dataIndex === 'labels'">
                        <div v-for="(val, key) in record.metadata.labels" :key="key">
                            <a-popover>
                                <template #content>
                                    <span>{{ key + ":" +val }}</span>
                                </template>
                                <a-tag style="margin-bottom:5px;cursor:pointer;" color="blue">{{ ellipsis(key + ":" +val, 15) }}</a-tag>
                            </a-popover>
                        </div>
                    </template>
                    <template v-if="column.dataIndex === 'image'">
                        <div v-for="(val, key) in record.spec.containers" :key="key">
                            <a-popover>
                                <template #content>
                                    <span>{{ val.image }}</span>
                                </template>
                                <a-tag style="margin-bottom:5px;cursor:pointer;" color="geekblue">{{ ellipsis(val.image.split('/').pop() ? val.image.split('/').pop() : val.image, 15 ) }}</a-tag>
                            </a-popover>
                        </div>
                    </template>
                    <template v-if="column.dataIndex === 'creationTimestamp'">
                        <a-tag color="gray">{{ timeTrans(record.metadata.creationTimestamp) }}</a-tag>
                    </template>
                    <template v-if="column.key === 'action'">
                        <!-- <a-button type="primary" shape="round"  size="small" @click="getPodDetail(record)" > <template #icon> <form-outlined /> </template>YML</a-button>
                        <a-button type="primary" shape="round"  danger size="small" @click="showConfirm('删除', record.metadata.name, delPod)" > <template #icon> <delete-outlined /> </template>删除</a-button>
                        <a-button class="info" shape="round"  size="small"  @click="gotoLog(record)"><template #icon> <file-search-outlined /> </template>日志</a-button>
                        <a-button class="success" shape="round"  size="small"  @click="gotoTerminal(record)"><template #icon> <code-outlined /> </template>终端</a-button> -->
                        <c-button class="pod-button" type="cyan" icon="form-outlined" @click="getPodDetail(record)">YML</c-button>
                        <c-button style="margin-bottom:5px;" class="pod-button" type="warning" icon="delete-outlined" @click="showConfirm('删除', record.metadata.name, delPod)">删除</c-button>
                        <c-button class="pod-button" type="success" icon="file-search-outlined" @click="gotoLog(record)">日志</c-button>
                        <c-button class="pod-button" type="purple" icon="code-outlined" @click="gotoTerminal(record)">终端</c-button>
                    </template>
                </template>
            </a-table>
        </a-card>
        <!-- 展示YAML信息的弹框 -->
        <a-modal
            v-model:visible="yamlModal"
            title="YAML信息"
            :confirm-loading="appLoading"
            cancelText="取消"
            okText="更新"
            @ok="updatePod">
            <!-- codemirror编辑器 -->
            <!-- border 带边框 -->
            <!-- options  编辑器配置 -->
            <!-- change 编辑器中的内容变化时触发 -->
            <codemirror
                :value="contentYaml"
                border
                :options="cmOptions"
                height="500"
                style="font-size:14px;"
                @change="onChange"
            ></codemirror>
        </a-modal>
    </div>
</template>

<script>
import { createVNode, reactive, ref } from 'vue';
import { useRouter } from 'vue-router'
//子组件的局部引入
import MainHead from '@/components/MainHead';
import httpClient from '@/request';
import common from "@/config";
import { message } from 'ant-design-vue';
import yaml2obj from 'js-yaml';
import json2yaml from 'json2yaml';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { Modal } from 'ant-design-vue';
export default({
    //子组件的局部引入
    components: {
        MainHead,
    },
    setup() {
        //常用项
        const appLoading = ref(false)

        //定义列表的header 项
        const columns = ref([
            {
                title: 'Pod名',
                dataIndex: 'name'
            },
            {
                title: '节点',
                dataIndex: 'node'
            },
            {
                title: '状态',
                dataIndex: 'state',
                width: 120
            },
            {
                title: '重启数',
                dataIndex: 'restarts'
            },
            {
                title: '镜像',
                dataIndex: 'image'
            },
            {
                title: '创建时间',
                dataIndex: 'creationTimestamp'
            },
            {
                title: '操作',
                key: 'action',
                fixed: 'right',
                width: 200
            }
        ])

        //分页
        const pagination = reactive({
            showSizeChanger: true,
            showQuickJumper: true,
            total: 0,
            currentPage: 1,
            pagesize: 10,
            pageSizeOptions: ["10", "20", "50", "100"],
            showTotal: total => `共 ${total} 条`
        })

        //子传父的接受  ======================
        //声明需要接受的选项值 searchValue
        //定义一个属性searchValue接受getSearchValue的值
        const searchValue = ref('')
        function getSearchValue(val) {
            searchValue.value = val
            pagination.currentPage = 1
        }
        //子传父的接受  ======================
        //声明需要接受的选项值 namespaceValue
        //定义一个属性namespaceValue接受getNamespaceValue的值
        const namespaceValue = ref('')
        function getNamespaceValue(val) {
            namespaceValue.value = val
        }

        //列表属性,  ========================EOF
        // podList 接受后端数据
        // podListData 为定义请求的参数等
        //定义一个属性podList接受getPodList的值
        const podList = ref([])
        const podListData = reactive({
            url : common.k8sPodList,
            params: {
                filter_name: '',
                namespace: '',
                cluster: '',
                page: 1,
                limit: 10
            }
        })
        //获取pod列表 方法
        function getPodList() {
            appLoading.value = true
            podListData.params.filter_name = searchValue.value
            podListData.params.namespace = namespaceValue.value
            podListData.params.cluster = localStorage.getItem('k8s_cluster')
            podListData.params.page = pagination.currentPage
            podListData.params.limit = pagination.pagesize
            httpClient.get(podListData.url, {params: podListData.params})
            .then(res => {
                //响应成功，获取pod列表和total
                podList.value = res.data.items
                pagination.total = res.data.total
            })
            .catch(res => {
                message.error(res.msg)
            })
            .finally(() => {
                appLoading.value = false
            })
        }
        //EOF


        //详情 ====================================EOF
        const contentYaml = ref('')
        const yamlModal = ref(false)
        const cmOptions = common.cmOptions
        const podDetail =  reactive({
            metadata: {}
        })
        const podDetailData =  reactive({
            url: common.k8sPodDetail,
            params: {
                pod_name: '',
                namespace: '',
                cluster: ''
            }
        })
        //json转yaml方法
        function transYaml(content) {
            return json2yaml.stringify(content)
        }
        //详情
        function getPodDetail(e) {
            appLoading.value = true
            podDetailData.params.pod_name = e.metadata.name
            podDetailData.params.namespace = namespaceValue.value
            podDetailData.params.cluster = localStorage.getItem('k8s_cluster')
            httpClient.get(podDetailData.url, {params: podDetailData.params})
            .then(res => {
                contentYaml.value = transYaml(res.data)
                yamlModal.value = true
            })
            .catch(res => {
                message.error(res.msg)
            })
            .finally(() => {
                appLoading.value = false
            })
        }
        //EOF


        //yaml更新  =======================EOF
        const updatePodData = reactive({
            url: common.k8sPodUpdate,
            params: {
                namespace: '',
                content: '',
                cluster: ''
            }
        })
        //编辑器内容变化时触发的方式,用于将更新的内容复制到变量中
        function onChange(val) {
            contentYaml.value = val
        }
        //yaml转对象
        function transObj(content) {
            return yaml2obj.load(content)
        }        
        //更新
        function updatePod() {
            appLoading.value = true
            //将yaml格式的pod对象转为json
            let content = JSON.stringify(transObj(contentYaml.value))
            updatePodData.params.namespace = namespaceValue.value
            updatePodData.params.content = content
            updatePodData.params.cluster = localStorage.getItem('k8s_cluster')
            httpClient.put(updatePodData.url, updatePodData.params)
            .then(res => {
                message.success(res.msg)
            })
            .catch(res => {
                message.error(res.msg)
            })
            .finally(() => {
                getPodList()
                yamlModal.value = false
            })
        }
        //EOF


        //删除  =============================EOF
        const delPodData = reactive({
            url: common.k8sPodDel,
            params: {
                pod_name: '',
                namespace: '',
                cluster: ''
            }
        })
        //执行删除
        function delPod(name) {
            appLoading.value = true
            delPodData.params.pod_name = name
            delPodData.params.namespace = namespaceValue.value
            delPodData.params.cluster = localStorage.getItem('k8s_cluster')
            httpClient.delete(delPodData.url, {data: delPodData.params})
            .then(res => {
                message.success(res.msg)
            })
            .catch(res => {
                message.error(res.msg)
            })
            .finally(() => {
                getPodList()
            })
        }
        //确认框
        function showConfirm(action, res, fn) {
            Modal.confirm({
                title: '是否继续' + action + "操作? 操作对象：",
                icon: createVNode(ExclamationCircleOutlined),
                content: createVNode('div', {
                    //style: 'color:red;',
                }, res),
                cancelText: '取消',
                okText: '确认',
                onOk() {
                    fn(res)
                },
                // onCancel() {
                //     console.log('Cancel');
                // }
            })
        }
        //EOF


        //格式化时间
        function timeTrans(timestamp) {
            let date = new Date(new Date(timestamp).getTime() + 8 * 3600 * 1000)
            date = date.toJSON();
            date = date.substring(0, 19).replace('T', ' ')
            return date 
        }
        //格式化字符串
        function ellipsis(val, len) {
            return val.length > len ? val.substring(0,len) + '...' : val
        }
        //计算restart 次数
        function restartTotal(e) {
            let index, sum = 0
            let containerStatuses = e.status.containerStatuses
            for ( index in containerStatuses) {
                sum = sum + containerStatuses[index].restartCount 
            }
            return sum
        }
        //处理翻页,pagesize变化
        function handleTableChange(val) {
            pagination.currentPage = val.current
            pagination.pagesize = val.pageSize
            getPodList()
        }


        //router实例  //容器  //日志
        const router = useRouter()
        //跳转终端页
        function gotoTerminal(record) {
            let routeUrl = router.resolve({
                path: "/workload/pod/terminal",
                query: {
                    pod_name: record.metadata.name,
                    namespace: record.metadata.namespace,
                    cluster: localStorage.getItem('k8s_cluster')
                }
            })
            window.open(routeUrl.href, '_blank')
        }
        //跳转日志页
        function gotoLog(record) {
            let routeUrl = router.resolve({
                path: "/workload/pod/log",
                query: {
                    pod_name: record.metadata.name,
                    namespace: record.metadata.namespace,
                    cluster: localStorage.getItem('k8s_cluster')
                }
            })
            window.open(routeUrl.href, '_blank')
        }

        return {
            appLoading,
            pagination,
            columns,
            podList,
            podDetail,
            contentYaml,
            yamlModal,
            cmOptions,
            timeTrans,
            ellipsis,
            restartTotal,
            handleTableChange,
            getSearchValue,
            getNamespaceValue,
            getPodList,
            getPodDetail,
            onChange,
            updatePod,
            delPod,
            gotoTerminal,
            gotoLog,
            showConfirm
        }
    },
})
</script>

<style scoped>
    .pod-button {
        margin-right: 5px;
    }
    .succ-dot{
        display:inline-block;
        width: 7px;
        height:7px;
        background:#86c169;
        border-radius:50%;
        border:1px solid #88c06c;
        margin-right: 10px;
    }
    .warn-dot{
        display:inline-block;
        width: 7px;
        height:7px;
        background: rgb(233, 200, 16);
        border-radius:50%;
        border:1px solid rgb(233, 200, 16);
        margin-right: 10px;
    }
    .err-dot{
        display:inline-block;
        width: 7px;
        height:7px;
        background:rgb(199, 85, 85);
        border-radius:50%;
        border:1px solid rgb(207, 94, 94);
        margin-right: 10px;
    }
    .succ-state {
        color: rgb(27, 202, 21);
    }
    .warn-state {
        color: rgb(233, 200, 16);
    }
    .err-state {
        color: rgb(226, 23, 23);
    }

</style>
<!-- <style>
    .success{
        background: #87CEFA !important;
    }
    .info{
        background: #54FF9F !important;
    }
    .warning{
        background: #FFC125 !important;
    }
</style> -->
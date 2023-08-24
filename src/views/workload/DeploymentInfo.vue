<template>
    <div  >
        <a-card :bodyStyle="{padding: '10px'}">
            <template v-if="ok == true" >
                <span style="font-weight: bold;color:dodgerblue">当前服务信息:</span>
                <a-descriptions title="" bordered>
                    <a-descriptions-item label="服务名称">{{ deploymentInfo["metadata"]["name"] }}</a-descriptions-item>
                    <a-descriptions-item label="Namespace">{{ deploymentInfo["metadata"]["namespace"] }}</a-descriptions-item>
                    <a-descriptions-item label="运行版本号">{{ deploymentInfo["metadata"]["annotations"]["deployment.kubernetes.io/revision"] }}</a-descriptions-item>
                    <a-descriptions-item label="Labels">{{ deploymentInfo["metadata"]["labels"] }}</a-descriptions-item>
                    <a-descriptions-item label="Create Time" :span="2">{{ deploymentInfo["metadata"]["creationTimestamp"] }}</a-descriptions-item>
                    <a-descriptions-item label="Status" :span="3">
                        <template v-if=' deploymentInfo["status"]["availableReplicas"] === deploymentInfo["status"]["replicas"]  &&  deploymentInfo["status"]["availableReplicas"]  '>
                            <a-badge status="success" text="Running" />
                                (availableReplicas:
                                <span style="color:lime">
                                {{ deploymentInfo["status"]["availableReplicas"] }}</span>
                                 readyReplicas:
                                 <span style="color:lime">
                                 {{ deploymentInfo["status"]["readyReplicas"]  }} 
                                </span>
                                 replicas:
                                 <span style="color:lime">
                                 {{ deploymentInfo["status"]["replicas"] }}
                                 </span>
                                )
                        </template>
                        <template v-if='  !deploymentInfo["status"]["availableReplicas"] '>
                            <a-badge status="warning" text="Unreliable" />
                            <span style="color:tomato">
                                (availableReplicas:{{ deploymentInfo["status"]["availableReplicas"] || 0}}    
                                 readyReplicas:{{ deploymentInfo["status"]["readyReplicas"] || 0}}   
                                 replicas:{{ deploymentInfo["status"]["replicas"]|| 0 }} 
                                )
                            </span>
                        </template>
                    </a-descriptions-item>
                    <a-descriptions-item label="Strategy Type">{{ deploymentInfo["spec"]["strategy"]["type"] }}</a-descriptions-item>
                    <a-descriptions-item label="Selector">{{ deploymentInfo["spec"]["selector"]["matchLabels"] }}</a-descriptions-item>
                    <a-descriptions-item label="Replicas">{{ deploymentInfo["spec"]["replicas"] }}</a-descriptions-item>
                    <a-descriptions-item label="image">
                        {{ deploymentInfo["spec"]["template"]["spec"]["containers"][0]["image"] }}
                    </a-descriptions-item>
                </a-descriptions>
            </template>
        </a-card>

        <a-card :bodyStyle="{padding: '10px'}">
            <span style="font-weight: bold;color:dodgerblue">Pods:</span>
            <a-table
                style="font-size:12px;" 
                :columns="columns_pods" 
                :dataSource="getpodByDeploymentInfo"
                >
                <template #bodyCell="{ column, record }">
                    <template v-if="column.dataIndex === 'name'">
                        <span style="font-weight: bold;">{{ record.podname }}</span>
                    </template>

                    <template v-if="column.dataIndex === 'node'">
                        <a-tag color="#99BBFF">{{ record.node }}</a-tag>
                    </template>
                    <template v-if=" column.dataIndex === 'namespace' ">
                        <span >{{ record.namespace }}</span>
                    </template>
                    <template v-if=" column.dataIndex === 'ready' ">
                        <a-tag color="#33FF33" >{{ record.ready }} / {{ record.containers }}</a-tag>
                    </template>
                    <template v-if=" column.dataIndex === 'status' ">
                        <a-tag color="#33CCFF">{{ record.status }}</a-tag>
                    </template>
                    <template v-if="column.key === 'action'">
                        <c-button style="margin-bottom:5px;" 
                            class="configmap-button" 
                            type="warning" 
                            icon="delete-outlined" 
                            @click="showConfirm('删除', record.podname, delPod)">
                        删除
                        </c-button>
                    </template>
                </template>
            </a-table>
        </a-card>

        <a-card :bodyStyle="{padding: '10px'}" style="width: auto">
            <span style="font-weight: bold;color:dodgerblue">历史版本信息:</span>
            <a-table
                style="font-size:12px;" 
                :columns="columns" 
                :dataSource="versionHistoryList"
                >
                <template #bodyCell="{ column, record }">
                    <template v-if="column.dataIndex === 'revision'">
                        <span style="font-weight: bold;">{{ record.metadata.annotations["deployment.kubernetes.io/revision"]  }}</span>
                    </template>
                    <template v-if="column.dataIndex === 'name'">
                        <span style="font-weight: bold;">{{ record.metadata.name }}</span>
                    </template>

                    <template v-if="column.dataIndex === 'image'">
                        <div v-for="(val, key) in record.spec.template.spec.containers" :key="key">
                            <a-popover>
                                <template #content>
                                    <span>{{ val.image }}</span>
                                </template>
                                <a-tag style="margin-bottom:5px;cursor:pointer;" color="geekblue">{{ ellipsis(val.image.split(':').pop() ? val.image.split(':').pop() : val.image, 32 ) }}</a-tag>
                            </a-popover>
                        </div>
                    </template>
                    <template v-if="column.dataIndex === 'creationTimestamp'">
                        <a-tag color="gray">{{ timeTrans(record.metadata.creationTimestamp) }}</a-tag>
                    </template>
                    <template v-if="record.spec.replicas !== 0 && column.dataIndex === 'note' ">
                        <a-tag color="#9efd38">当前版本</a-tag>
                    </template>
                    <template v-if="record.spec.replicas === 0 && column.dataIndex === 'note' ">
                        <a-tag color="#fed8b1">历史版本</a-tag>
                    </template>
                    <template v-if="column.key === 'action'">
                        <c-button style="margin-bottom:5px;" 
                            class="configmap-button" 
                            type="cyan" 
                            icon="undo-outlined" 
                            @click="showConfirm('回滚', record.metadata.name , rolloutundo_deployment)">
                            回滚
                        </c-button>
                    </template>
                </template>
            </a-table>
        </a-card>

    </div>
</template>

<script>
import { onMounted, reactive, ref,onBeforeUnmount,createVNode } from 'vue';

import httpClient from '@/request';
import common from "@/config";
import { message } from 'ant-design-vue';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { Modal } from 'ant-design-vue';

export default({
    setup() {
        //表结构
        const columns = ref([
            {
                title: '',
                dataIndex: 'note'
            }, 
            {
                title: '版本ID',
                dataIndex: 'revision'
            },
            {
                title: '版本Name',
                dataIndex: 'name'
            },
            {
                title: '版本镜像',
                dataIndex: 'image',
            },
            {
                title: '创建时间',
                dataIndex: 'creationTimestamp'
            },
            {
                title: '回滚到此版本',
                key: 'action',
                fixed: 'right',
                width: 200
            }
        ])
        const appLoading = ref(false)
        //列表属性,  ========================EOF
        // versionHistoryList 接受后端数据
        // versionHistoryListData 为定义请求的参数等
        //定义一个属性versionHistoryList接受getHistoryVersionList的值
        const versionHistoryList = ref([])
        const versionHistoryListData = reactive({
            url : common.k8sDeploymentHistory,
            params: {
                namespace: '',
                cluster: '',
                label: '',
            }
        })
        //获取pod列表 方法
        function getHistoryVersionList() {
            //关闭定时器
            clearInterval(timer)
            timer = null

            versionHistoryListData.params.namespace = localStorage.getItem('namespace')
            versionHistoryListData.params.cluster = localStorage.getItem('k8s_cluster')
            versionHistoryListData.params.label = localStorage.getItem('deployment_label')
            httpClient.get(versionHistoryListData.url, {params: versionHistoryListData.params})
            .then(res => {
                //响应成功，获取pod列表和total
                versionHistoryList.value = res.data.items
            })
            .catch(res => {
                message.error(res.msg)
            })
            .finally(() => {
                appLoading.value = false
            })
        }
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
        //EOF

        //获取deploymeng info =============================
        const deploymentInfo = ref([])
        const deploymentInfoData = reactive({
            url : common.k8sDeploymentDetail,
            params: {
                namespace: '',
                cluster: '',
                deployment_name: '',
            }
        })
        //获取deploymeng 方法
        const ok=ref(false)
        function getdeploymentInfo() {
            //关闭定时器
            clearInterval(timer)
            timer = null

            deploymentInfoData.params.namespace = localStorage.getItem('namespace')
            deploymentInfoData.params.cluster = localStorage.getItem('k8s_cluster')
            deploymentInfoData.params.deployment_name = localStorage.getItem('deploymentname')
            httpClient.get(deploymentInfoData.url, {params: deploymentInfoData.params})
            .then(res => {
                //响应成功，获取pod列表和total
                deploymentInfo.value = res.data
            })
            .catch(res => {
                message.error(res.msg)
            })
            .finally(() => {
                appLoading.value = false
                ok.value= true

            })
        }


        //根据deploymeng 获取pod info =============================
        const getpodByDeploymentInfo = ref([])
        const getpodByDeploymentInfoData = reactive({
            url : common.k8sDeploymentPods,
            params: {
                namespace: '',
                cluster: '',
                labelselector: ''
            }
        })
        //根据deploymeng 获取pod info 方法
        function GetPodByDeploymentInfo() {
            getpodByDeploymentInfoData.params.namespace = localStorage.getItem('namespace')
            getpodByDeploymentInfoData.params.cluster = localStorage.getItem('k8s_cluster')
            getpodByDeploymentInfoData.params.labelselector = localStorage.getItem('deployment_label')
            httpClient.get(getpodByDeploymentInfoData.url, {params: getpodByDeploymentInfoData.params})
            .then(res => {
                //响应成功，获取pod列表和total
                getpodByDeploymentInfo.value = res.data 
            })
            .catch(res => {
                message.error(res.msg)
            })
            .finally(() => {
                appLoading.value = false
                ok.value= true

            })
        }
        const columns_pods = ref([
            {
                title: 'Name',
                dataIndex: 'name'
            }, 
            {
                title: 'Node',
                dataIndex: 'node'
            },
            {
                title: 'Namespace',
                dataIndex: 'namespace'
            },
            {
                title: 'Ready',
                dataIndex: 'ready',
            },
            {
                title: 'Status',
                dataIndex: 'status'
            },
            {
                title: '操作',
                key: 'action',
                fixed: 'right',
                width: 200
            }
        ])
        //==============================
        
        
        //删除  =============================EOF
        const delPodData = reactive({
            url: common.k8sPodDel,
            params: {
                pod_name: '',
                namespace: '',
                cluster: ''
            }
        })
        //真正执行删除
        function delPod(name) {
            delPodData.params.pod_name = name
            delPodData.params.namespace = localStorage.getItem('namespace')
            delPodData.params.cluster = localStorage.getItem('k8s_cluster')
            httpClient.delete(delPodData.url, {data: delPodData.params})
            .then(res => {
                message.success(res.msg)
            })
            .catch(res => {
                message.error(res.msg)
            })
            .finally(() => {
                //延时2s进行重新请求sleep
                setTimeout(function(){
                    GetPodByDeploymentInfo()
                },2000)
            })
        }    

        //执行回滚===================
        const deployRolloutUndoData = reactive({
            url: common.k8sDeploymentRolloutUndo,
            params: {
                deploymentname: '',
                reversion: '',
                namespace: '',
                cluster: '',
                label: '',
            }
        })
        //真正执行回滚
        function rolloutundo_deployment(record) {
            deployRolloutUndoData.params.deploymentname = localStorage.getItem('deploymentname')
            deployRolloutUndoData.params.namespace = localStorage.getItem('namespace')
            deployRolloutUndoData.params.cluster = localStorage.getItem('k8s_cluster')
            deployRolloutUndoData.params.reversion = record.metadata.annotations["deployment.kubernetes.io/revision"]
            deployRolloutUndoData.params.label = localStorage.getItem('deployment_label')
            httpClient.post(deployRolloutUndoData.url, deployRolloutUndoData.params)
            .then(res => {
                message.success(res.msg)
            })
            .catch(res => {
                message.error(res.msg)
            })
            .finally(() => {
                getdeploymentInfo()
            })
        }
        //确认框(回滚/删除共用)
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


        //声明周期钩子
        //定时器
        let timer = null
        onMounted(() => {
            timer = setInterval(() => {
                getHistoryVersionList()
                getdeploymentInfo()
                GetPodByDeploymentInfo()
            }, 500)
            })
        onBeforeUnmount(() => {
            if (timer) {
                clearInterval(timer)
                timer = null
            }
        })


        return {
            appLoading,
            columns,
            versionHistoryList,
            timeTrans,
            ellipsis,
            deploymentInfo,
            ok,
            showConfirm,
            rolloutundo_deployment,
            columns_pods,
            getpodByDeploymentInfo,
            delPod



        }
    },
})
</script>

<style scoped>
    .configmap-button {
        margin-right: 5px;
    }
    .ant-form-item {
        margin-bottom: 20px;
    }
</style>
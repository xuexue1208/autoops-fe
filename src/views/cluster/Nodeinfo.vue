<template>
    <div>
        <a-card :bodyStyle="{padding: '10px'}">
            <span style="font-weight: bold;color:dodgerblue">该主机运行的Pod列表:</span>
            <a-table
                style="font-size:12px;" 
                :columns="columns_pods" 
                :dataSource="getNodeOnPodInfo"
                >
                <template #bodyCell="{ column, record }">
                    <template v-if="column.dataIndex === 'name'">
                        <span style="font-weight: bold;">{{ record.podname }}</span>
                    </template>

                    <template v-if="column.dataIndex === 'namespace'">
                        <a-tag color="#99BBFF">{{ record.namespace }}</a-tag>
                    </template>
                    <template v-if=" column.dataIndex === 'ready' ">
                        <template v-if="record.status == 'Running'">
                            <a-tag color="#33FF33" >{{ record.ready }} / {{ record.containers }}</a-tag>
                        </template>
                        <template v-if="record.status != 'Running'">
                            <a-tag color="#FF6600" >{{ record.ready }} / {{ record.containers }}</a-tag>
                        </template>
                    </template>
                    <template v-if=" column.dataIndex === 'status' ">
                        <template v-if="record.status == 'Running'">
                            <a-tag color="#33CCFF">{{ record.status }}</a-tag>
                        </template>
                        <template v-if="record.status != 'Running'">
                            <a-tag color="#FF6600">{{ record.status }}</a-tag>
                        </template>
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
    </div>
</template>

<script>
import { onMounted, reactive, ref,onBeforeUnmount,createVNode } from 'vue';

import httpClient from '@/request';
import common from "@/config";
import { message } from 'ant-design-vue';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { Modal } from 'ant-design-vue';

export default {
    setup () {

        //获取node上pod列表
        const columns_pods = ref([
            {
                title: 'Name',
                dataIndex: 'name'
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
        const getNodeOnPodInfo = ref([])
        const getNodeOnPodInfoData = reactive({
            url : common.k8sNodeOnPods,
            params: {
                nodename: '',
                cluster: ''
            }
        })
        function GetNodeOnPods() {
            //关闭定时器
            clearInterval(timer)
            timer = null

            getNodeOnPodInfoData.params.nodename = localStorage.getItem('nodename')
            getNodeOnPodInfoData.params.cluster = localStorage.getItem('k8s_cluster')
            httpClient.get(getNodeOnPodInfoData.url, {params: getNodeOnPodInfoData.params})
            .then(res => {
                //响应成功，获取pod列表和total
                getNodeOnPodInfo.value = res.data 
            })
            .catch(res => {
                message.error(res.msg)
            })
            .finally(() => {
            })
        }

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
                    GetNodeOnPods()
                },2000)
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




        //声明周期钩子
        //定时器
        let timer = null
        onMounted(() => {
            timer = setInterval(() => {
                GetNodeOnPods()
            }, 500)
            })
        onBeforeUnmount(() => {
            if (timer) {
                clearInterval(timer)
                timer = null
            }
        })



        return {
            columns_pods,
            getNodeOnPodInfo,
            delPod,
            showConfirm

        }
    }
}
</script>

<style lang="scss" scoped>

</style>
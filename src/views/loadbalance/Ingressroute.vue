<template>
    <div>
        <MainHead
            searchDescribe="请输入"
            @searchChange="getSearchValue"
            namespace
            @namespaceChange="getNamespaceValue"
            @namespaceList="getNamespaceList"
            @dataList="getIngressList"
            add
            @addFunc="handleAdd"/>
       <a-card :bodyStyle="{padding: '10px'}">
            <a-table
                style="font-size:12px;" 
                :loading="appLoading" 
                :columns="columns" 
                :dataSource="ingressList"
                :pagination="pagination"
                @change="handleTableChange">
                <template #bodyCell="{ column, record }">
                    <template v-if="column.dataIndex === 'name'">
                        <span style="font-weight: bold;">{{ record.metadata.name }}</span>
                    </template>
                    <template v-for="v,i in record.spec.Routes">
                        <template v-if="column.dataIndex === 'match'">
                            <a-tag color="geekblue"> - {{ v.Match }} </a-tag>
                            <br>
                        </template>
                        <template v-for="s,ii in v.Services">
                            <template v-if="column.dataIndex === 'services'">
                                <a-tag color="#9966FF"> {{ s.Name }}  </a-tag>
                                <br>
                            </template>
                        </template>
                    </template>

                    <template v-if="column.key === 'action'">
                        <c-button style="margin-bottom:5px;" class="ingress-button" type="cyan" icon="form-outlined" @click="getIngressDetail(record)">更新</c-button>
                        <c-button class="ingress-button" type="purple" icon="delete-outlined" @click="showConfirm('删除', record.metadata.name, delIngress)">删除</c-button>
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
            width="1000px"
            @ok="updateIngress">
            <!-- codemirror编辑器 -->
            <!-- border 带边框 -->
            <!-- options  编辑器配置 -->
            <!-- change 编辑器中的内容变化时触发 -->
            <!-- :options="cmOptions" -->
            <codemirror
                :value="contentYaml"
                border
                :options="cmOptions"
                height="500"
                style="font-size:14px;"
                @change="onChange"
            ></codemirror>
        </a-modal>
        <!-- 创建ingress的抽屉弹框 -->
        <a-drawer
            v-model:visible="createDrawer"
            title="创建Ingress"
            :width="720"
            :footer-style="{ textAlign: 'right' }"
            @close="onClose">
            <br>
            <codemirror
                :value="createcontentYaml"
                border
                :options="cmOptions"
                height="500"
                style="font-size:14px;"
                @change="createonChange"
            ></codemirror>

            <template #footer>
                <a-button style="margin-right: 8px" @click="onClose()">取消</a-button>
                <a-button type="primary"  @click="createIngressFunc()"  >创建</a-button>
            </template>
        </a-drawer>
    </div>
</template>

<script>
import { createVNode, reactive, ref } from 'vue';
import MainHead from '@/components/MainHead';
import httpClient from '@/request';
import common from "@/config";
import { message } from 'ant-design-vue';
// import yaml2obj from 'js-yaml';
import  yaml  from 'js-yaml';
// import json2yaml from 'json2yaml';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { Modal } from 'ant-design-vue';
export default({
    components: {
        MainHead,
    },
    setup() {
        //表结构
        const columns = ref([
            {
                title: 'IR名称',
                dataIndex: 'name',
                width: 300
            },
            {
                title: 'Host&Path',
                dataIndex: 'match',
                width: 700
            },      
            {
                title: 'services',
                dataIndex: 'services',
                width: 400
            },                   
            {
                title: '操作',
                key: 'action',
                fixed: 'right',
                width: 200
            }
        ])
        //常用项
        const appLoading = ref(false)
        const searchValue = ref('')
        const namespaceValue = ref('')
        const namespaceList = ref([])
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
        //列表  =================================
        const ingressList = ref([])
        const ingressListData = reactive({
            url : common.k8sIngressRouteList,
            params: {
                filter_name: '',
                namespace: '',
                cluster: '',
                page: 1,
                limit: 10
            }
        })
        //列表
        function getIngressList() {
            appLoading.value = true
            ingressListData.params.filter_name = searchValue.value
            ingressListData.params.namespace = namespaceValue.value
            ingressListData.params.cluster = localStorage.getItem('k8s_cluster')
            ingressListData.params.page = pagination.currentPage
            ingressListData.params.limit = pagination.pagesize
            httpClient.get(ingressListData.url, {params: ingressListData.params})
            .then(res => {
                //响应成功，获取ingress列表和total
                ingressList.value = res.data.items
                pagination.total = res.data.total
            })
            .catch(res => {
                message.error(res.msg)
            })
            .finally(() => {
                appLoading.value = false
            })
        }
        //详情  =====================================
        const contentYaml = ref('')
        const yamlModal = ref(false)
        const cmOptions = common.cmOptions
        const ingressDetail =  reactive({
            metadata: {}
        })
        const ingressDetailData =  reactive({
            url: common.k8sIngressRouteInfo,
            params: {
                ingress_name: '',
                namespace: '',
                cluster: ''
            }
        })
        //json转yaml方法
        function transYaml(content) {
            //return json2yaml.stringify(content)
            return yaml.dump(content)
        }
        //详情
        function getIngressDetail(e) {
            appLoading.value = true
            ingressDetailData.params.ingress_name = e.metadata.name
            ingressDetailData.params.namespace = namespaceValue.value
            ingressDetailData.params.cluster = localStorage.getItem('k8s_cluster')
            httpClient.get(ingressDetailData.url, {params: ingressDetailData.params})
            .then(res => {
                contentYaml.value = transYaml(res.data)
                //contentYaml.value = JSON.stringify(res.data,null,'\t') 显示格式化后的json格式
                yamlModal.value = true

            })
            .catch(res => {
                message.error(res.msg)
            })
            .finally(() => {
                appLoading.value = false
            })
        }
        //yaml更新===============================================    
        //编辑器内容变化时触发的方式,用于将更新的内容复制到变量中
        function onChange(val) {
            contentYaml.value = val
        }
        const updateIngressData = reactive({
            url: common.k8sIngressRouteUpdate,
            params: {
                namespace: '',
                cluster: '',
                yamldata: ''
            }
        })
        //更新ingress
        function updateIngress() {
            appLoading.value = true
            updateIngressData.params.namespace = namespaceValue.value
            updateIngressData.params.cluster = localStorage.getItem('k8s_cluster')
            updateIngressData.params.yamldata = contentYaml.value
            httpClient.put(updateIngressData.url, updateIngressData.params)
            .then(res => {
                message.success(res.msg)
            })
            .catch(res => {
                message.error(res.msg)
            })
            .finally(() => {
                getIngressList()
                yamlModal.value = false
            })
        }

        //删除 ==============================================  
        //
        const delIngressData = reactive({
            url: common.k8sIngressRouteDel,
            params: {
                ingress_name: '',
                namespace: '',
                cluster: ''
            }
        })
        //删除ingress
        function delIngress(name) {
            appLoading.value = true
            delIngressData.params.ingress_name = name
            delIngressData.params.namespace = namespaceValue.value
            delIngressData.params.cluster = localStorage.getItem('k8s_cluster')
            httpClient.delete(delIngressData.url, {data: delIngressData.params})
            .then(res => {
                message.success(res.msg)
            })
            .catch(res => {
                message.error(res.msg)
            })
            .finally(() => {
                getIngressList()
            })
        }
        
        //创建===============================================   
        //处理新增
        function handleAdd() {
            createDrawer.value = true
        }        
        
        const createDrawer = ref(false)
        const createcontentYaml = ref('')
        function createonChange(val) {
            createcontentYaml.value = val
        }
        const createIngressData = reactive({
            url: common.k8sIngressRouteCreate,
            params: {
                namespace: '',
                cluster: '',
                yamlData: '',
            }
        })
        //创建ingress
        function createIngressFunc() {
            //加载loading动画
            appLoading.value = true
            createIngressData.params.namespace = namespaceValue.value
            createIngressData.params.cluster = localStorage.getItem('k8s_cluster')
            createIngressData.params.yamlData = createcontentYaml.value
            httpClient.post(createIngressData.url, createIngressData.params)
            .then(res => {
                message.success(res.msg)
            })
            .catch(res => {
                message.error(res.msg)
            })
            .finally(() => {
                getIngressList()
                //关闭抽屉
                createDrawer.value = false
                //重置
                createcontentYaml.value =""
            })
        }
        //关闭抽屉
        function onClose () {
            Modal.confirm({
                title: "是否确认关闭操作? ",
                icon: createVNode(ExclamationCircleOutlined),
                content: createVNode('div', {
                    //style: 'color:red;',
                }),
                cancelText: '取消',
                okText: '确认',
                onOk() {
                    createDrawer.value = false
                    //resetForm()
                },
                onCancel() {
                    createDrawer.value = true
                    //重置
                    createcontentYaml.value =""
                }
            })
        }
        //===============================================  


        //public  ================== EOF
        function handleTableChange(val) {
            pagination.currentPage = val.current
            pagination.pagesize = val.pageSize
            getIngressList()
        }
        function getSearchValue(val) {
            searchValue.value = val
            pagination.currentPage = 1
        }
        function getNamespaceValue(val) {
            namespaceValue.value = val
        }
        function getNamespaceList(val) {
            namespaceList.value = val
        }
        //public  ==================EOF 





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



        return {
            appLoading,
            namespaceList,
            pagination,
            columns,
            ingressList,
            ingressDetail,
            contentYaml,
            yamlModal,
            cmOptions,
            createDrawer,
            handleTableChange,
            getSearchValue,
            getNamespaceValue,
            getNamespaceList,
            getIngressList,
            getIngressDetail,
            onChange,
            updateIngress,
            showConfirm,
            delIngress,
            handleAdd,
            onClose,
            createonChange,
            createcontentYaml,
            createIngressFunc
        }
    },
})
</script>

<style scoped>
    .ingress-button {
        margin-right: 5px;
    }
    .ant-form-item {
        margin-bottom: 20px;
    }
</style>
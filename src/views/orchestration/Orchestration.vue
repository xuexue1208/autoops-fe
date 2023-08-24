<template>
    <div>
        <!-- main部分的header -->
        <MainHead
            searchDescribe="请输入"
            @searchChange="getSearchValue"
            @dataList="getOrchList"
            en
            @enChange="getEnvValue"
            @enList="getEnvList"
            add
            @addFunc="handleOpenForm('create')"/>
        <!-- 数据表格 -->
        <a-card :bodyStyle="{padding: '10px'}">
            <a-table
                style="font-size:12px;" 
                :loading="appLoading" 
                :columns="columns" 
                :dataSource="orchList"
                :pagination="pagination"
                @change="handleTableChange">
                <template #bodyCell="{ column, record }">
                    <template v-if="column.dataIndex === 'app_name'">
                        <span style="font-weight: bold;">{{ record.app_name }}</span>
                    </template>
                    <template v-if="column.dataIndex === 'replicas'">
                        <span style="color: rgb(84, 138, 238);">{{ record.replicas }}</span>
                    </template>
                    <template v-if="column.dataIndex === 'mem'">
                        <span>{{ record.request_mem }} / {{ record.limit_mem }}</span>
                    </template>
                    <template v-if="column.dataIndex === 'cpu'">
                        <span>{{ record.request_cpu }} / {{ record.limit_cpu }} 核</span>
                    </template>
                    <template v-if="column.dataIndex === 'command'">
                        <span>{{ record.command }}</span>

                    </template>
                    <template v-if="column.key === 'action'">
                        <a-button size="small" type="link" @click="handleOpenForm('update', record)">编辑</a-button>
                        <a-button size="small" type="link" @click="showConfirm('删除', record, delOrchFunc)">删除</a-button>
                    </template>
                </template>
            </a-table>
        </a-card>
        <!-- 创建编排的表单 -->
        <a-drawer
            v-model:visible="createDrawer"
            title="新增编排"
            :footer-style="{ textAlign: 'right' }"
            @close="onClose('create')">
            <br>
            <a-form ref="createRef" :model="createOrch" :labelCol="{style: {width: '40%'}}">
                <a-form-item
                    label="应用"
                    name="app_id"
                    :rules="[{ required: true, message: '请选择应用' }]">
                    <a-select show-search style="width:140px;margin-right:20px;" size="small" v-model:value="createOrch.app_id" placeholder="请选择">
                        <a-select-option
                            v-for="(item, index) in appAllList"
                            :key="index"
                            :value="item.id">
                            {{ item.app_name }}
                        </a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item
                    label="环境"
                    name="en"
                    :rules="[{ required: true, message: '请选择环境' }]">
                    <a-select style="width:140px;margin-right:20px;" size="small" v-model:value="createOrch.en" placeholder="请选择">
                        <a-select-option
                            v-for="(item) in enList"
                            :key="item.id"
                            :value="item.env">
                            {{ item.env }}
                        </a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item
                    label="副本数"
                    name="replicas"
                    :rules="[{ required: true, message: '请输入副本数' }]">
                    <a-input-number v-model:value="createOrch.replicas" size="small" :min="1" :max="30" />
                </a-form-item>
                <a-form-item
                    label="Request 内存"
                    name="request_mem"
                    :rules="[{ required: true, message: '请输入Request 内存' }]">
                    <a-input style="width:100px;" v-model:value="createOrch.request_mem" size="small" />
                </a-form-item>
                <a-form-item
                    label="Limit 内存"
                    name="limit_mem"
                    :rules="[{ required: true, message: '请输入Limit 内存' }]">
                    <a-input style="width:100px;" v-model:value="createOrch.limit_mem" size="small" />
                </a-form-item>
                <a-form-item
                    label="Request CPU"
                    name="request_cpu"
                    :rules="[{ required: true, message: '请输入Request CPU' }]">
                    <a-input-number v-model:value="createOrch.request_cpu" size="small"  :step="0.1" :min="0.1" :max="10" /> 核
                </a-form-item>
                <a-form-item
                    label="Limit CPU"
                    name="limit_cpu"
                    :rules="[{ required: true, message: '请输入Limit CPU' }]">
                    <a-input-number v-model:value="createOrch.limit_cpu" size="small"  :step="0.1" :min="0.1" :max="10" /> 核
                </a-form-item>
                <a-form-item
                    label="启动命令"
                    name="command"
                    :rules="[{ required: true, message: '请输入owner' }]">
                    <a-input v-model:value="createOrch.command" size="small" />
                </a-form-item>
            </a-form>
            <template #footer>
                <a-button style="margin-right: 8px" @click="onClose('create')">取消</a-button>
                <a-button type="primary" @click="formSubmit('create')">新增</a-button>
            </template>
        </a-drawer>
        <!-- 编辑编排的表单 -->
        <a-drawer
            v-model:visible="updateDrawer"
            title="编辑编排"
            :footer-style="{ textAlign: 'right' }"
            @close="onClose('update')">
            <br>
            <a-form ref="updateRef" :model="updateOrch" :labelCol="{style: {width: '40%'}}">
                <a-form-item
                    label="应用"
                    name="app_id"
                    :rules="[{ required: true, message: '请选择应用' }]">
                    <a-select show-search style="width:140px;margin-right:20px;" size="small" v-model:value="updateOrch.app_id" placeholder="请选择">
                        <a-select-option
                            v-for="(item, index) in appAllList"
                            :key="index"
                            :value="item.id">
                            {{ item.app_name }}
                        </a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item
                    label="环境"
                    name="en"
                    :rules="[{ required: true, message: '请选择环境' }]">
                    <a-select style="width:140px;margin-right:20px;" size="small" v-model:value="updateOrch.en" placeholder="请选择">
                        <a-select-option
                            v-for="(item) in enList"
                            :key="item.id"
                            :value="item.env">
                            {{ item.env }}
                        </a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item
                    label="副本数"
                    name="replicas"
                    :rules="[{ required: true, message: '请输入副本数' }]">
                    <a-input-number v-model:value="updateOrch.replicas" size="small" :min="1" :max="30" />
                </a-form-item>
                <a-form-item
                    label="Request 内存"
                    name="request_mem"
                    :rules="[{ required: true, message: '请输入Request 内存' }]">
                    <a-input style="width:100px;" v-model:value="updateOrch.request_mem" size="small" />
                </a-form-item>
                <a-form-item
                    label="Limit 内存"
                    name="limit_mem"
                    :rules="[{ required: true, message: '请输入Limit 内存' }]">
                    <a-input style="width:100px;" v-model:value="updateOrch.limit_mem" size="small" />
                </a-form-item>
                <a-form-item
                    label="Request CPU"
                    name="request_cpu"
                    :rules="[{ required: true, message: '请输入Request CPU' }]">
                    <a-input-number v-model:value="updateOrch.request_cpu" size="small" :step="0.1" :min="0.1" :max="10" /> 核
                </a-form-item>
                <a-form-item
                    label="Limit CPU"
                    name="limit_cpu"
                    :rules="[{ required: true, message: '请输入Limit CPU' }]">
                    <a-input-number v-model:value="updateOrch.limit_cpu" size="small" :step="0.1" :min="0.1" :max="10" /> 核
                </a-form-item>
                <a-form-item
                    label="启动命令"
                    name="command"
                    :rules="[{ required: true, message: '请输入owner' }]">
                    <a-input v-model:value="updateOrch.command" size="small" />
                </a-form-item>
            </a-form>
            <template #footer>
                <a-button style="margin-right: 8px" @click="onClose('update')">取消</a-button>
                <a-button type="primary" @click="formSubmit('update')">更新</a-button>
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
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { Modal } from 'ant-design-vue';
export default ({
    components: {
        MainHead,
    },
    setup() {
        //表格列
        const columns = ref([
            {
                title: 'ID',
                dataIndex: 'id'
            },
            {
                title: '应用名',
                dataIndex: 'app_name'
            },
            {
                title: '环境',
                dataIndex: 'en',
            },
            {
                title: '副本数',
                dataIndex: 'replicas',
            },
            {
                title: '内存 (req/limit)',
                dataIndex: 'mem',
            },
            {
                title: 'CPU (requ/limit)',
                dataIndex: 'cpu',
            },
            {
                title: '启动命令',
                dataIndex: 'command'
            },
            {
                title: '操作',
                key: 'action',
                fixed: 'right',
                align: 'center',
                width: 150
            }
        ])
        //常用项
        const appLoading = ref(false)
        const searchValue = ref('')

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
        //筛选框环境列表
        const enList = ref([])
        function getEnvList(val) {
            enList.value = val
        }
        
        const enValue = ref('')
        function getEnvValue(val) {
            enValue.value = val
        }
        //新增/更新 环境列表
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
        //应用
        const appAllList = ref([])
        const appAllListData = reactive({
            url: common.appAllRes,
            params: {}
        })
        //编排列表
        const orchList = ref([])
        const orchListData = reactive({
            url: common.orchList,
            params: {
                en: '',
                app_name: '',
                page: 1,
                limit: 10
            }
        })
        //新增
        const createRef = ref()
        const createDrawer = ref(false)
        const createOrch = reactive({
            app_id: '',
            en: '',
            replicas: 1,
            request_mem: '',
            limit_mem: '',
            request_cpu: '',
            limit_cpu:'',
            command: ''
        })
        const createOrchData = reactive({
            url: common.orchAdd,
            params: {}
        })
        //编辑
        const updateRef = ref()
        const updateDrawer = ref(false)
        const updateOrch = reactive({
            id: 0,
            app_id: '',
            en: '',
            replicas: 1,
            request_mem: '',
            limit_mem: '',
            request_cpu: '',
            limit_cpu:'',
            command: ''
        })
        const updateOrchData = reactive({
            url: common.orchUpdate,
            params: {}
        })
        //删除
        const delOrchData = reactive({
            url: common.orchDel,
            params: {
                id: 0,
            }
        })
        //【方法】

        function getSearchValue(val) {
            searchValue.value = val
            pagination.currentPage = 1
        }
        function handleTableChange(val) {
            pagination.currentPage = val.current
            pagination.pagesize = val.pageSize
            getOrchList()
        }
        async function formSubmit(val) {
            try {
                switch (val) {
                case "create":
                    await createRef.value.validateFields();
                    createOrchFunc()
                    break
                case "update":
                    await updateRef.value.validateFields();
                    updateOrchFunc()
                    break
                }
                
            } catch (errorInfo) {
                console.log('Failed:', errorInfo);
            }
        }
        function resetForm(val) {
            switch (val) {
            case "create":
                createRef.value.resetFields()
                break
            case "update":
                updateRef.value.resetFields()
                break
            }
        }
        //关闭抽屉
        function onClose(val) {
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
                    updateDrawer.value = false
                    resetForm(val)
                },
                onCancel() {
                    createDrawer.value = true
                    updateDrawer.value = true
                }
            })
        }
        //应用列表
        function getAppAllList() {
            httpClient.get(appAllListData.url, {params: appAllListData.params})
            .then(res => {
                //响应成功，获取pod列表和total
                appAllList.value = res.data
            })
            .catch(res => {
                message.error(res.msg)
            })
        }
        //列表
        function getOrchList() {
            appLoading.value = true
            orchListData.params.app_name = searchValue.value
            orchListData.params.en = enValue.value
            orchListData.params.page = pagination.currentPage
            orchListData.params.limit = pagination.pagesize
            httpClient.get(orchListData.url, {params: orchListData.params})
            .then(res => {
                //响应成功，获取pod列表和total
                orchList.value = res.data.items
                pagination.total = res.data.total
            })
            .catch(res => {
                message.error(res.msg)
            })
            .finally(() => {
                appLoading.value = false
            })
        }
        function handleOpenForm(val, row) {
            switch (val) {
            case "create":
                createDrawer.value = true
                break
            case "update":
                updateOrch.id = row.id
                updateOrch.app_id = row.app_id
                updateOrch.en = row.en
                updateOrch.replicas = row.replicas
                updateOrch.request_mem = row.request_mem
                updateOrch.limit_mem = row.limit_mem
                updateOrch.request_cpu = row.request_cpu
                updateOrch.limit_cpu = row.limit_cpu
                updateOrch.command = row.command
                updateDrawer.value = true
                break
            }
            getAppAllList()
            getEnvAllList()
        }
        //新增
        function createOrchFunc() {
            appLoading.value = true
            createOrchData.params = createOrch
            httpClient.post(createOrchData.url, createOrchData.params)
            .then(res => {
                message.success(res.msg)
            })
            .catch(res => {
                message.error(res.msg)
            })
            .finally(() => {
                //重置表单
                resetForm('create')
                getOrchList()
                //关闭抽屉
                createDrawer.value = false
            })
        }
        //编辑
        function updateOrchFunc() {
            appLoading.value = true
            updateOrchData.params = updateOrch
            httpClient.put(updateOrchData.url, updateOrchData.params)
            .then(res => {
                message.success(res.msg)
            })
            .catch(res => {
                message.error(res.msg)
            })
            .finally(() => {
                //重置表单
                resetForm('update')
                getOrchList()
                //关闭抽屉
                updateDrawer.value = false
            })
        }
        //删除
        function delOrchFunc(row) {
            appLoading.value = true
            delOrchData.params.id = row.id
            httpClient.delete(delOrchData.url, {data: delOrchData.params})
            .then(res => {
                message.success(res.msg)
            })
            .catch(res => {
                message.error(res.msg)
            })
            .finally(() => {
                getOrchList()
            })
        }
        //确认框
        function showConfirm(action, res, fn) {
            Modal.confirm({
                title: '是否继续' + action + "操作? 操作对象：",
                icon: createVNode(ExclamationCircleOutlined),
                content: createVNode('div', {
                    //style: 'color:red;',
                }, res.app_name),
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
            searchValue,
            appAllList,
            enList,
            orchList,
            columns,
            pagination,
            createRef,
            updateRef,
            createDrawer,
            updateDrawer,
            createOrch,
            updateOrch,
            getSearchValue,
            getEnvValue,
            getOrchList,
            handleTableChange,
            handleOpenForm,
            onClose,
            formSubmit,
            delOrchFunc,
            showConfirm,
            getEnvList,
        }
    },
})
</script>

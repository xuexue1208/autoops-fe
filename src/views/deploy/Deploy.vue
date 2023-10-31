<template>
    <div>
        <!-- main部分的header -->
        <MainHead
            searchDescribe="请输入"
            @searchChange="getSearchValue"
            @dataList="getDeployList"
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
                :dataSource="deployList"
                :pagination="pagination"
                @change="handleTableChange">
                <template #bodyCell="{ column, record }">
                    <template v-if="column.dataIndex === 'app_name'">
                        <span style="font-weight: bold;">{{ record.app_name }}</span>
                    </template>
                    <template v-if="column.dataIndex === 'env'">
                        <span style="font-weight: bold;">{{ record.env }}</span>
                    </template>
                    <template v-if="column.dataIndex === 'tag'">
                        <span style="color: rgb(84, 138, 238);">{{ record.tag }}</span>
                    </template>
                    <template v-if="column.dataIndex === 'status'">
                        <a-progress v-if="record.status == 2" :percent="100" :steps="5" status="exception" size="small" stroke-color="#a61d24"/>
                        <a-progress v-else-if="record.status == 1" :percent="100" :steps="5" size="small" stroke-color="#52c41a"/>
                        <a-progress v-else-if="record.status == 0" :percent="0" size="small" :steps="5"/>
                        <a-progress v-else :percent="50" size="small" :steps="5"/>
                    </template>
                    <template v-if="column.dataIndex === 'duration'">
                        <a-tag v-if="record.duration">{{ record.duration }}s</a-tag>
                    </template>
                    <template v-if="column.dataIndex === 'start_time'">
                        <a-tag v-if="record.start_time.startsWith('0001') || !record.start_time" color="gray">-</a-tag>
                        <a-tag v-else color="gray">{{ timeTrans(record.start_time) }}</a-tag>
                    </template>
                    <template v-if="column.key === 'action'">
                        <a-button :disabled="record.status != 0" size="small" type="link" @click="appDeploy(record)">部署</a-button>
                        <a-button :disabled="record.status == 0" size="small" type="link" @click="handleDeployLog(record)">日志</a-button>
                        <a-button :disabled="record.status != 0" size="small" type="link" @click="handleOpenForm('update', record)">编辑</a-button>
                        <a-button :disabled="record.status != 0" size="small" type="link" @click="showConfirm('删除', record, delDeployFunc)">删除</a-button>
                    </template>
                </template>
            </a-table>
        </a-card>
        <!-- 创建发布的表单 -->
        <a-modal
            v-model:visible="createModal"
            title="新增部署"
            :confirm-loading="appLoading">
            <br>
            <a-form ref="createRef" :model="createDeploy" :labelCol="{style: {width: '40%'}}">
                <a-form-item
                    label="应用"
                    name="app_id"
                    :rules="[{ required: true, message: '请选择应用' }]">
                    <a-select @change="getTagList" show-search style="width:140px;margin-right:20px;" size="small" v-model:value="createDeploy.app_id" placeholder="请选择">
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
                    <a-select style="width:140px;margin-right:20px;" size="small" v-model:value="createDeploy.en" placeholder="请选择">
                        <a-select-option
                            v-for="(item) in enList"
                            :key="item.id"
                            :value="item.env">
                            {{ item.env }}
                        </a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item
                    label="Tag"
                    name="tag"
                    :rules="[{ required: true, message: '请选择Tag' }]">
                    <a-select style="width:140px;margin-right:20px;" size="small" v-model:value="createDeploy.tag" placeholder="请选择">
                        <a-select-option
                            v-for="(item, index) in tagList"
                            :key="index"
                            :value="item">
                            {{ item }}
                        </a-select-option>
                    </a-select>
                </a-form-item>
            </a-form>
            <template #footer>
                <a-button style="margin-right: 8px" @click="createModal = false">取消</a-button>
                <a-button type="primary" @click="formSubmit('create')">新增</a-button>
            </template>
        </a-modal>
        <!-- 编辑发布的表单 -->
        <a-modal
            v-model:visible="updateModal"
            title="编辑部署"
            :confirm-loading="appLoading">
            <br>
            <a-form ref="updateRef" :model="updateDeploy" :labelCol="{style: {width: '40%'}}">
                <a-form-item
                    label="应用"
                    name="app_id"
                    :rules="[{ required: true, message: '请选择应用' }]">
                    <a-select @change="getTagList" show-search style="width:140px;margin-right:20px;" size="small" v-model:value="updateDeploy.app_id" placeholder="请选择">
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
                    name="env"
                    :rules="[{ required: true, message: '请选择环境' }]">
                    <a-select style="width:140px;margin-right:20px;" size="small" v-model:value="updateDeploy.en" placeholder="请选择">
                        <a-select-option
                            v-for="(item) in enList"
                            :key="item.id"
                            :value="item.env">
                            {{ item.env }}
                        </a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item
                    label="Tag"
                    name="tag"
                    :rules="[{ required: true, message: '请选择Tag' }]">
                    <a-select style="width:140px;margin-right:20px;" size="small" v-model:value="updateDeploy.tag" placeholder="请选择">
                        <a-select-option
                            v-for="(item, index) in tagList"
                            :key="index"
                            :value="item">
                            {{ item }}
                        </a-select-option>
                    </a-select>
                </a-form-item>
            </a-form>
            <template #footer>
                <a-button style="margin-right: 8px" @click="updateModal = false">取消</a-button>
                <a-button type="primary" @click="formSubmit('update')">更新</a-button>
            </template>
        </a-modal>
        <a-modal
            class="log-modal"
            v-model:visible="deployLogModal"
            :body-style="{ height: '70vh' }"
            width='50vw'
            title="部署日志">
            <a-card 
                class="log-card"
                :loading="logLoading"
                :bodyStyle="{padding: '10px'}">
                {{ logContent }}
            </a-card>
            <template #footer>
                <!-- 自定义按钮布局 -->
                <a-button @click="deployLogModal = false">取消</a-button>
            </template>
        </a-modal>
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
                dataIndex: 'env'
            },
            {
                title: 'Tag',
                dataIndex: 'tag',
            },
            {
                title: '发布时长',
                dataIndex: 'duration'
            },
            {
                title: '状态',
                dataIndex: 'status',
            },
            {
                title: '发布者',
                dataIndex: 'deployer',
            },
            {
                title: '开始时间',
                dataIndex: 'start_time'
            },
            {
                title: '操作',
                key: 'action',
                fixed: 'right',
                align: 'center',
                width: 220
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
        //应用列表
        const appAllList = ref([])
        const appAllListData = reactive({
            url: common.appAllRes,
            params: {}
        })
        //tag列表
        const tagList = ref([])
        const tagListData = reactive({
            url: common.appAllTags,
            params: {
                app_id: ''
            }
        })
        //列表
        const deployList = ref([])
        const deployListData = reactive({
            url: common.deployList,
            params: {
                en: '',
                app_name: '',
                page: 1,
                limit: 10
            }
        })
        //新增
        const createRef = ref()
        const createModal = ref(false)
        const createDeploy = reactive({
            app_id: '',
            en: '',
            tag: '',
            deployer: '',
        })
        const createDeployData = reactive({
            url: common.deployAdd,
            params: {}
        })
        //编辑
        const updateRef = ref()
        const updateModal = ref(false)
        const updateDeploy = reactive({
            app_id: '',
            en: '',
            tag: '',
        })
        const updateDeployData = reactive({
            url: common.deployUpdate,
            params: {}
        })
        //删除
        const delDeployData = reactive({
            url: common.deployDel,
            params: {
                id: ''
            }
        })
        //部署
        const cicdDeployData = reactive({
            url: common.cicdDeploy,
            params: {
                id: '',
                start_time: '',
                deployer: ''
            }
        })
        //日志
        const logLoading = ref(false)
        const deployLogModal = ref(false)
        const logContent = ref()
        const getDeployLogData = reactive({
            url: common.deployLog,
            params: {
                id: ''
            }
        })
        //【方法】
        function timeTrans(timestamp) {
            let date = new Date(new Date(timestamp).getTime() + 8 * 3600 * 1000)
            date = date.toJSON();
            date = date.substring(0, 19).replace('T', ' ')
            return date 
        }

        //环境
        const enList = ref([])
        function getEnvList(val) {
            enList.value = val
        }
        const enValue = ref('')
        function getEnvValue(val) {
            enValue.value = val
        }
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
        //
        


        function getSearchValue(val) {
            searchValue.value = val
            pagination.currentPage = 1
        }
        function handleTableChange(val) {
            pagination.currentPage = val.current
            pagination.pagesize = val.pageSize
            getDeployList()
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
        function getTagList(val) {
            tagListData.params.app_id = val
            httpClient.get(tagListData.url, {params: tagListData.params})
            .then(res => {
                //响应成功，获取pod列表和total
                tagList.value = res.data
            })
            .catch(res => {
                console.log(res)
                message.error(res.msg)
            })
        }
        //列表
        function getDeployList() {
            appLoading.value = true
            deployListData.params.app_name = searchValue.value
            deployListData.params.en = enValue.value
            deployListData.params.page = pagination.currentPage
            deployListData.params.limit = pagination.pagesize
            httpClient.get(deployListData.url, {params: deployListData.params})
            .then(res => {
                //响应成功，获取pod列表和total
                deployList.value = res.data.items
                pagination.total = res.data.total
            })
            .catch(res => {
                message.error(res.msg)
            })
            .finally(() => {
                appLoading.value = false
            })
        }
        //新增
        function handleOpenForm(val, row) {
            switch (val) {
            case "create":
                createModal.value = true
                break
            case "update":
                updateDeploy.id = row.id
                updateDeploy.app_id = row.app_id
                updateDeploy.en = row.en
                updateDeploy.tag = row.tag
                updateModal.value = true
                getTagList(row.app_id)
                break
            }
            getAppAllList()
            getEnvAllList()
        }
        async function formSubmit(val) {
            try {
                switch (val) {
                case "create":
                    await createRef.value.validateFields();
                    createDeployFunc()
                    break
                case "update":
                    await updateRef.value.validateFields();
                    updateDeployFunc()
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
        function createDeployFunc() {
            appLoading.value = true
            createDeployData.params = createDeploy
            httpClient.post(createDeployData.url, createDeployData.params)
            .then(res => {
                message.success(res.msg)
            })
            .catch(res => {
                message.error(res.msg)
            })
            .finally(() => {
                //重置表单
                resetForm('create')
                getDeployList()
                //关闭抽屉
                createModal.value = false
            })
        }
        function updateDeployFunc() {
            appLoading.value = true
            updateDeployData.params = updateDeploy
            httpClient.put(updateDeployData.url, updateDeployData.params)
            .then(res => {
                message.success(res.msg)
            })
            .catch(res => {
                message.error(res.msg)
            })
            .finally(() => {
                //重置表单
                resetForm('update')
                getDeployList()
                //关闭抽屉
                updateModal.value = false
            })
        }
        //删除
        function delDeployFunc(row) {
            appLoading.value = true
            delDeployData.params.id = row.id
            httpClient.delete(delDeployData.url, {data: delDeployData.params})
            .then(res => {
                message.success(res.msg)
            })
            .catch(res => {
                message.error(res.msg)
            })
            .finally(() => {
                getDeployList()
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
        //部署
        function appDeploy(row) {
            const datetimeStr = timeTrans(new Date())
            cicdDeployData.params.id = row.id
            cicdDeployData.params.start_time = datetimeStr
            cicdDeployData.params.deployer = localStorage.getItem('username')
            httpClient.post(cicdDeployData.url, cicdDeployData.params)
            .then(res => {
                message.success(res.msg)
            })
            .catch(res => {
                message.error(res.msg)
            })
            getDeployList()
        }
        //
        function handleDeployLog(row) {
            getDeployLog(row)
            deployLogModal.value = true
        }
        //日志
        function getDeployLog(row) {
            logLoading.value = true
            getDeployLogData.params.id = row.id
            httpClient.get(getDeployLogData.url, {params: getDeployLogData.params})
            .then(res => {
                logContent.value = res.data.log
            })
            .catch(res => {
                message.error(res.msg)
            })
            .finally(()=> {
                logLoading.value = false
            })
        }


        return {
            appLoading,
            enList,
            columns,
            pagination,
            appAllList,
            deployList,
            createRef,
            createModal,
            createDeploy,
            tagList,
            updateRef,
            updateModal,
            updateDeploy,
            deployLogModal,
            logContent,
            logLoading,
            getEnvValue,
            getSearchValue,
            handleTableChange,
            getDeployList,
            timeTrans,
            handleOpenForm,
            getTagList,
            formSubmit,
            delDeployFunc,
            showConfirm,
            appDeploy,
            handleDeployLog,
            getEnvList
        }
    },
})
</script>

<style scoped>
    .log-card {
        width: 100%;
        height: 100%;
        white-space: pre-wrap;
        overflow-y: auto;
    }
</style>

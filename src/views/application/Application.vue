<template>
    <div>
        <!-- main部分的header -->
        <MainHead
            searchDescribe="请输入"
            @searchChange="getSearchValue"
            @dataList="getAppList"
            add
            @addFunc="handleOpenForm('create')"/>
        <!-- 数据表格 -->
        <a-card :bodyStyle="{padding: '10px'}">
            <a-table
                style="font-size:12px;" 
                :loading="appLoading" 
                :columns="columns" 
                :dataSource="appList"
                :pagination="pagination"
                @change="handleTableChange">
                <template #bodyCell="{ column, record }">
                    <template v-if="column.dataIndex === 'app_name'">
                        <span style="font-weight: bold;">{{ record.app_name }}</span>
                    </template>
                    <template v-if="column.dataIndex === 'repo_name'">
                        <a @click="codeInfo(record)"  style="font-weight: bold;">
                            <span style="color: rgb(84, 138, 238);">{{ record.repo_name }}</span>
                        </a>
                        
                    </template>
                    <template v-if="column.dataIndex === 'type'">
                        <a-tag v-if="record.type == 'Api'" color="blue">{{ record.type }}</a-tag>
                        <a-tag v-else-if="record.type == 'Admin'" color="cyan">{{ record.type }}</a-tag>
                        <a-tag v-else color="orange">{{ record.type }}</a-tag>
                    </template>
                    <template v-if="column.dataIndex === 'CreatedAt'">
                        <a-tag color="gray">{{ timeTrans(record.CreatedAt) }}</a-tag>
                    </template>
                    <template v-if="column.key === 'action'">
                        <a-button size="small" type="link" @click="handleOpenForm('update', record)">编辑</a-button>
                        <a-button size="small" type="link" @click="showConfirm('删除', record, delAppFunc)">删除</a-button>
                    </template>
                </template>
            </a-table>
        </a-card>
        <!-- 创建应用的表单 -->
        <a-drawer
            v-model:visible="createDrawer"
            title="新增应用"
            :footer-style="{ textAlign: 'right' }"
            @close="onClose('create')">
            <br>
            <a-form ref="createRef" :model="createApp" :labelCol="{style: {width: '30%'}}">
                <a-form-item
                    label="应用名"
                    name="app_name"
                    :rules="[{ required: true, message: '请输入应用名' }]">
                    <a-input v-model:value="createApp.app_name" />
                </a-form-item>
                <a-form-item
                    label="仓库"
                    name="repo_name"
                    :rules="[{ required: true, message: '请输入仓库' }]">
                    <a-input v-model:value="createApp.repo_name" />
                </a-form-item>
                <a-form-item
                    label="开发语言"
                    name="lang"
                    :rules="[{ required: true, message: '请选择开发语言' }]">
                    <a-select show-search style="width:140px;" v-model:value="createApp.lang" placeholder="请选择">
                        <a-select-option
                            v-for="(item, index) in appLangList"
                            :key="index"
                            :value="item">
                            {{ item }}
                        </a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item
                    label="类型"
                    name="type"
                    :rules="[{ required: true, message: '请选择应用类型' }]">
                    <a-select show-search style="width:140px;" v-model:value="createApp.type" placeholder="请选择">
                        <a-select-option
                            v-for="(item, index) in appTypeList"
                            :key="index"
                            :value="item">
                            {{ item }}
                        </a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item
                    label="Owner"
                    name="owner"
                    :rules="[{ required: true, message: '请输入owner' }]">
                    <a-input v-model:value="createApp.owner" />
                </a-form-item>
                <a-form-item
                    label="描述"
                    name="description"
                    :rules="[{ required: true, message: '请输入应用描述' }]">
                    <a-textarea show-count :maxlength="20" v-model:value="createApp.description" />
                </a-form-item>
            </a-form>
            <template #footer>
                <a-button style="margin-right: 8px" @click="onClose('create')">取消</a-button>
                <a-button type="primary" @click="formSubmit('create')">新增</a-button>
            </template>
        </a-drawer>
        <!-- 编辑应用的表单 -->
        <a-drawer
            v-model:visible="updateDrawer"
            title="编辑应用"
            :footer-style="{ textAlign: 'right' }"
            @close="onClose('update')">
            <br>
            <a-form ref="updateRef" :model="updateApp" :labelCol="{style: {width: '30%'}}">
                <a-form-item
                    label="应用名"
                    name="app_name"
                    :rules="[{ required: true, message: '请输入应用名' }]">
                    <a-input v-model:value="updateApp.app_name" />
                </a-form-item>
                <a-form-item
                    label="仓库"
                    name="repo_name"
                    :rules="[{ required: true, message: '请输入仓库' }]">
                    <a-input v-model:value="updateApp.repo_name" />
                </a-form-item>
                <a-form-item
                    label="开发语言"
                    name="lang"
                    :rules="[{ required: true, message: '请选择开发语言' }]">
                    <a-select show-search style="width:140px;" v-model:value="updateApp.lang" placeholder="请选择">
                        <a-select-option
                            v-for="(item, index) in appLangList"
                            :key="index"
                            :value="item">
                            {{ item }}
                        </a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item
                    label="类型"
                    name="type"
                    :rules="[{ required: true, message: '请选择应用类型' }]">
                    <a-select show-search style="width:140px;" v-model:value="updateApp.type" placeholder="请选择">
                        <a-select-option
                            v-for="(item, index) in appTypeList"
                            :key="index"
                            :value="item">
                            {{ item }}
                        </a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item
                    label="Owner"
                    name="owner"
                    :rules="[{ required: true, message: '请输入owner' }]">
                    <a-input v-model:value="updateApp.owner" />
                </a-form-item>
                <a-form-item
                    label="描述"
                    name="description"
                    :rules="[{ required: true, message: '请输入应用描述' }]">
                    <a-textarea show-count :maxlength="20" v-model:value="updateApp.description" />
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
                title: '仓库',
                dataIndex: 'repo_name',
            },
            {
                title: '语言',
                dataIndex: 'lang',
            },
            {
                title: '类型',
                dataIndex: 'type'
            },
            {
                title: 'Owner',
                dataIndex: 'owner'
            },
            {
                title: '创建时间',
                dataIndex: 'CreatedAt'
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
        //列表
        const appList = ref([])
        const appListData = reactive({
            url : common.appList,
            params: {
                app_name: '',
                page: 1,
                limit: 10
            }
        })
        //新增
        const appLangList = common.appLangList
        const appTypeList = common.appTypeList
        const createRef = ref()
        const createDrawer = ref(false)
        const createApp = reactive({
            app_name: '',
            repo_name: '',
            lang: '',
            type: '',
            owner: '',
            description: ''
        })
        const createAppData = reactive({
            url: common.appAdd,
            params: {}
        })
        //编辑
        const updateRef = ref()
        const updateDrawer = ref(false)
        const updateApp = reactive({
            id: 0,
            app_name: '',
            repo_name: '',
            lang: '',
            type: '',
            owner: '',
            description: ''
        })
        const updateAppData = reactive({
            url: common.appUpdate,
            params: {}
        })
        //删除
        const delAppData = reactive({
            url: common.appDel,
            params: {
                id: 0,
            }
        })
        //【方法】
        function timeTrans(timestamp) {
            let date = new Date(new Date(timestamp).getTime() + 8 * 3600 * 1000)
            date = date.toJSON();
            date = date.substring(0, 19).replace('T', ' ')
            return date 
        }
        function getSearchValue(val) {
            searchValue.value = val
            pagination.currentPage = 1
        }
        function handleTableChange(val) {
            pagination.currentPage = val.current
            pagination.pagesize = val.pageSize
            getAppList()
        }
        //列表
        function getAppList() {
            appLoading.value = true
            appListData.params.app_name = searchValue.value
            appListData.params.page = pagination.currentPage
            appListData.params.limit = pagination.pagesize
            httpClient.get(appListData.url, {params: appListData.params})
            .then(res => {
                //响应成功，获取pod列表和total
                appList.value = res.data.items
                pagination.total = res.data.total
            })
            .catch(res => {
                message.error(res.msg)
            })
            .finally(() => {
                appLoading.value = false
            })
        }
        //跳转到代码地址
        function codeInfo(e) {
            window.location.href=e.repo_name;
        }
        //新增
        function createAppFunc() {
            appLoading.value = true
            createAppData.params = createApp
            httpClient.post(createAppData.url, createAppData.params)
            .then(res => {
                message.success(res.msg)
            })
            .catch(res => {
                message.error(res.msg)
            })
            .finally(() => {
                //重置表单
                resetForm('create')
                getAppList()
                //关闭抽屉
                createDrawer.value = false
            })
        }
        function handleOpenForm(val, row) {
            switch (val) {
            case "create":
                createDrawer.value = true
                break
            case "update":
                updateApp.id = row.id
                updateApp.app_name = row.app_name
                updateApp.repo_name = row.repo_name
                updateApp.lang = row.lang
                updateApp.type = row.type
                updateApp.owner = row.owner
                updateApp.description = row.description
                updateDrawer.value = true
                break
            }
        }
        async function formSubmit(val) {
            try {
                switch (val) {
                case "create":
                    await createRef.value.validateFields();
                    createAppFunc()
                    break
                case "update":
                    await updateRef.value.validateFields();
                    updateAppFunc()
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
        //编辑
        function updateAppFunc() {
            appLoading.value = true
            updateAppData.params = updateApp
            httpClient.put(updateAppData.url, updateAppData.params)
            .then(res => {
                message.success(res.msg)
            })
            .catch(res => {
                message.error(res.msg)
            })
            .finally(() => {
                //重置表单
                resetForm('update')
                getAppList()
                //关闭抽屉
                updateDrawer.value = false
            })
        }
        //删除
        function delAppFunc(row) {
            appLoading.value = true
            delAppData.params.id = row.id
            httpClient.delete(delAppData.url, {data: delAppData.params})
            .then(res => {
                message.success(res.msg)
            })
            .catch(res => {
                message.error(res.msg)
            })
            .finally(() => {
                getAppList()
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
            pagination,
            columns,
            appList,
            createRef,
            createDrawer,
            createApp,
            appLangList,
            appTypeList,
            updateRef,
            updateDrawer,
            updateApp,
            getSearchValue,
            handleTableChange,
            getAppList,
            timeTrans,
            onClose,
            handleOpenForm,
            formSubmit,
            showConfirm,
            delAppFunc,
            codeInfo
        }
    },
})
</script>

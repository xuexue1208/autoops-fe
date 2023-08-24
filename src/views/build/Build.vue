<template>
    <div>
        <!-- main部分的header -->
        <MainHead
            searchDescribe="请输入"
            @searchChange="getSearchValue"
            @dataList="getBuildList"/>
        <!-- 数据表格 -->
        <a-card :bodyStyle="{padding: '10px'}">
            <a-table
                style="font-size:12px;" 
                :loading="appLoading" 
                :columns="columns" 
                :dataSource="buildList"
                :pagination="pagination"
                @change="handleTableChange">
                <template #bodyCell="{ column, record }">
                    <template v-if="column.dataIndex === 'app_name'">
                        <span style="font-weight: bold;">{{ record.app_name }}</span>
                    </template>
                    <template v-if="column.dataIndex === 'repo_name'">
                        <span style="font-weight: bold;">{{ record.repo_name }}</span>
                    </template>
                    <template v-if="column.dataIndex === 'replicas'">
                        <span style="color: rgb(84, 138, 238);">{{ record.tag }}</span>
                    </template>
                    <template v-if="column.dataIndex === 'CreatedAt'">
                        <a-tag color="gray">{{ timeTrans(record.CreatedAt) }}</a-tag>
                    </template>
                    <template v-if="column.key === 'action'">
                        <a-button size="small" type="link" @click="gotoTikton(record)">详情</a-button>
                    </template>
                </template>
            </a-table>
        </a-card>
    </div>
</template>

<script>
import { reactive, ref } from 'vue';
import MainHead from '@/components/MainHead';
import httpClient from '@/request';
import common from "@/config";
import { message } from 'ant-design-vue';
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
                dataIndex: 'repo_name'
            },
            {
                title: 'Tag',
                dataIndex: 'tag',
            },
            {
                title: '构建者',
                dataIndex: 'builder',
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
                width: 60
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
        const buildList = ref([])
        const buildListData = reactive({
            url: common.buildList,
            params: {
                repo_name: '',
                page: 1,
                limit: 10
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
            getBuildList()
        }
        //列表
        function getBuildList() {
            appLoading.value = true
            buildListData.params.repo_name = searchValue.value
            buildListData.params.page = pagination.currentPage
            buildListData.params.limit = pagination.pagesize
            httpClient.get(buildListData.url, {params: buildListData.params})
            .then(res => {
                //响应成功，获取pod列表和total
                buildList.value = res.data.items
                pagination.total = res.data.total
            })
            .catch(res => {
                message.error(res.msg)
            })
            .finally(() => {
                appLoading.value = false
            })
        }
        //跳转详情
        //跳转终端页
        function gotoTikton(record) {
            window.open(record.build_url, '_blanik')
        }
        return {
            appLoading,
            columns,
            pagination,
            buildList,
            getSearchValue,
            handleTableChange,
            getBuildList,
            gotoTikton,
            timeTrans
        }
    },
})
</script>

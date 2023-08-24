<template>
    <div>
        <!-- a-spin是一个加载组件,里面的内容都会触发loading -->
        <a-spin :spinning="appLoading">
            <!-- a-collapse是扩展收缩组件 -->
            <a-collapse v-model:activeKey="activeKey" ghost>
                <a-collapse-panel style="font-size:18px;" key="1" header="概览">
                    <a-row class="home-row1">
                        <a-col :span="11">
                            <div style="font-size:13px;">平台名称</div>
                            <div style="text-align:center;font-size:30px;font-weight:bold;">AutoOps</div>
                        </a-col>
                        <a-divider type="vertical" style="height: 70px; background-color: rgb(89, 104, 173)" />
                        <a-col :span="11">
                            <div style="font-size:13px;">k8s集群数</div>
                            <div style="text-align:center;font-size:30px;font-weight:bold;">{{ clusterNum }}</div>
                        </a-col>

                    </a-row>
                    <a-row>
                        <a-col :span="7">
                                <div  >               
                                    <div id="cpu_chart" :style="{ width: '400px', height: '350px' }"   ></div>
                                </div>
                        </a-col>
                        <a-col :span="7">
                                <div  >
                                    <div id="mem_chart" :style="{ width: '400px', height: '350px' }"   ></div>
                                </div>
                        </a-col>
                        <a-col :span="7">
                                <div  >
                                    <div id="pod_chart" :style="{ width: '400px', height: '350px' }"   ></div>
                                </div>
                        </a-col>
                    </a-row>
                    <a-row :gutter="10"> 
                        <template v-for="item,key in resourceList" :key="key">
                            <a-col :span="4" style="margin-bottom:10px;">
                                <a-card :bordered="false" style="background-color:rgb(255, 255, 255)" :bodyStyle="{padding: '10px'}">
                                    <div style="float:left;margin:15px 10px 0px">
                                        <a-progress
                                        :width="40"
                                        :strokeWidth="25"
                                        :stroke-color="color"  
                                        :percent="100"
                                        :showInfo="false"
                                        type="circle"
                                        />
                                    </div>
                                    <div style="text-align:center;">
                                        <a :href=" item.link ">
                                            <span style="font-size:14px;">{{ key }}</span>
                                            <br/>
                                            <span  style="font-size:30px;font-weight:bold;">{{ item["num"] }}</span>
                                        </a>
                                    </div>
                                </a-card>
                            </a-col>
                        </template>
                    </a-row>
                </a-collapse-panel>
                <a-collapse-panel style="font-size:18px;" key="2" header="事件">
                    <div style="text-align:right;margin-bottom:10px;">
                        <a-input-search
                        allow-clear
                        v-model:value="searchValue"
                        placeholder="请输入资源名"
                        style="width: 260px"
                        @search="getEventList"
                        />
                    </div>
                    <!-- 表格 -->
                    <a-card :bodyStyle="{padding: '10px'}">
                        <a-table 
                            style="font-size:12px;" 
                            :loading="appLoading" 
                            :columns="columns" 
                            :data-source="eventList"
                            :pagination="pagination"
                            @change="handleTableChange">
                            <!--自定义表格内容的样式,列的维度 -->
                            <!-- column 取的是自定义的表格样式内容columns
                            record 取的是当前列的数据 -->
                            <template #bodyCell="{ column, record }">
                                <template v-if="column.dataIndex === 'name'">
                                    <a style="color: rgb(84, 138, 238);font-weight: bold;">{{ record.name }}</a>
                                </template>
                                <template v-if="column.dataIndex === 'event_time'">
                                    <span>{{ timeTrans(record.event_time) }}</span>
                                </template>
                            </template>
                        </a-table>
                    </a-card>
                </a-collapse-panel>
            </a-collapse>
        </a-spin>
    </div>
</template>

<script>
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import httpClient from '@/request';
import common from "@/config";
import { message } from 'ant-design-vue';
import * as echarts from 'echarts';


export default ({
    setup() {
        const appLoading = ref(false)
        const searchValue = ref()
        const activeKey = ref(['1', '2'])
        const columns = ref([
            {
                title: '资源名',
                dataIndex: 'name',
            },
            {
                title: '资源类型',
                dataIndex: 'kind',
                width: 150,
            },
            {
                title: '命名空间',
                dataIndex: 'namespace',
            },
            {
                title: '状态',
                dataIndex: 'rtype',
            },
            {
                title: '原因',
                dataIndex: 'reason',
            },
            {
                title: '描述',
                dataIndex: 'message',
                width: 450,
            },
            {
                title: '事件时间',
                dataIndex: 'event_time',
                width: 150,
            },
            {
                title: '集群',
                dataIndex: 'cluster',
            },
        ])
        const color = reactive({
            '0%': '#73b9bc',
            '100%': '#109ee9',
        })
        const clusterNum = ref()
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
        //定时器
        let timer = null
        //事件列表
        const eventList = ref([])
        const eventListData = reactive({
            url : common.k8sEventList,
            params: {
                name: '',
                cluster: '',
                page: 1,
                limit: 10
            }
        })
        //资源数据
        const resourceList = ref()
        const resourceListData = reactive({
            url: common.k8sAllRes,
            params: {
                cluster: ''
            }
        })
        
        //【方法】
        function handleTableChange(val) {
            pagination.currentPage = val.current
            pagination.pagesize = val.pageSize
            getEventList()
        }
        function timeTrans(date) {
            date = date.substring(0, 19).replace('T', ' ')
            date = date.substring(0, 19).replace('+08:00', '')
            return date 
        }
        function getEventList () {
            //关闭定时器
            clearInterval(timer)
            timer = null

            // console.log(searchValue.value)
            // console.log(  pagination.currentPage )
            //当搜索框有值时 , 发起请求拿第一页数据
            // if (searchValue.value &&  !pagination.currentPage != 1)  {
            //     pagination.currentPage = 1
            // }

            eventListData.params.name = searchValue.value
            eventListData.params.cluster = localStorage.getItem('k8s_cluster')
            eventListData.params.page = pagination.currentPage
            eventListData.params.limit = pagination.pagesize
            httpClient.get(eventListData.url, {params: eventListData.params})
            .then(res => {
                eventList.value = res.data.items
                pagination.total = res.data.total
            })
            .catch(res => {
                message.error(res.msg)
            })
        }
        function getAllRes() {
            appLoading.value = true
            resourceListData.params.cluster = localStorage.getItem('k8s_cluster')
            httpClient.get(resourceListData.url, {params: resourceListData.params})
            .then(res => {
                resourceList.value = res.data
            })
            .catch(res => {
                message.error(res.msg)
            })
            .finally (() => {
                appLoading.value = false
            })
        }
        //声明周期钩子
        onMounted(() => {

            timer = setInterval(() => {
                if (localStorage.getItem('cluster_num') && localStorage.getItem('k8s_cluster')) {
                    clusterNum.value = localStorage.getItem('cluster_num')
                    getEventList()
                    getAllRes()
                    options()
                }
            }, 500)



        })
        onBeforeUnmount(() => {
            if (timer) {
                clearInterval(timer)
                timer = null
            }
        })

        //渲染echart 
        const options = () => {
            const metricsData = reactive({
                url: common.metricRes,
                params: {
                    cluster: ''
                }
            })
            metricsData.params.cluster = localStorage.getItem('k8s_cluster')
            httpClient.get(metricsData.url, {params: resourceListData.params})
                .then(res => {
                    const use_cpu=res.use_cpu
                    const allocatable_cpu=res.allocatable_cpu
                    const capacity_cpu=res.capacity_cpu
                    const use_mem=res.use_mem
                    const allocatable_mem= res.allocatable_mem
                    const capacity_mem=res.capacity_mem
                    const pod_max=res.pods
                    const pod_use=res.pod_use

                    var cpu_chart =echarts.init(document.getElementById('cpu_chart'))
                    var mem_chart =echarts.init(document.getElementById('mem_chart'))
                    var pod_chart =echarts.init(document.getElementById('pod_chart'))
                                                    
                    var cpu_chart_option = {
                        color: ['#FF0000', '#4ebefd','#30ed9d'],
                        legend: {
                            orient: 'vertical',
                            x: '15%',
                            top:'70%',
                            itemHeight: 15,//图例的高度
                            itemGap:5,//图例之间的间距
                            data:['capacity: '+capacity_cpu +"m",'use: '+use_cpu+"m","allocatable: "+ allocatable_cpu+"m"]
                            //图例的名字需要和饼图的name一致，才会显示图例
                        },
                        series: [
                            {
                                name: "capacity: "+capacity_cpu  +"m",
                                type:'pie',
                                radius: ['40%', '45%'],
                                label: {
                                show: false,
                                position: 'center',
                                },
                                labelLine: {
                                    normal: {
                                        show: false
                                    }
                                },
                                emphasis: {
                                    label: {
                                        show: true,
                                        fontSize: '20',
                                        fontWeight: 'bold'
                                    }
                                },
                                data:[
                                    {   name:'capacity: '+capacity_cpu +"m" ,
                                        value:capacity_cpu,
                                        itemStyle: {
                                            normal: {
                                            color: '#FF0000'
                                            }
                                        }
                                    },
                                {
                                        value:allocatable_cpu-capacity_cpu,
                                        itemStyle: {
                                            normal: {
                                                color: 'transparent'
                                            }
                                        }
                                }
                                ]
                            },
                            {
                                name:'use: '+use_cpu+"m",
                                type:'pie',
                                radius: ['20%', '25%'],
                                label: {
                                show: false,
                                position: 'center',
                                },
                                labelLine: {
                                    normal: {
                                        show: false
                                    }
                                },
                                emphasis: {
                                    label: {
                                        show: true,
                                        fontSize: '20',
                                        fontWeight: 'bold'
                                    }
                                },
                                data:[
                                    {   name:'use: '+use_cpu+"m",
                                        value:use_cpu,
                                        itemStyle: {
                                            normal: {
                                            color: '#4ebefd'
                                            }
                                        }
                                    },
                                {
                                        value:allocatable_cpu-use_cpu,
                                        itemStyle: {
                                            normal: {
                                                color: 'transparent'
                                            }
                                        }
                                }
                                ]
                            },
                            {
                                name:'allocatable: '+allocatable_cpu+"m",
                                type:'pie',
                                radius: ['30%', '35%'],
                                label: {
                                show: false,
                                position: 'center',
                
                                },
                                labelLine: {
                                    normal: {
                                        show: false
                                    }
                                },
                                emphasis: {
                                    label: {
                                        show: true,
                                        fontSize: '20',
                                        fontWeight: 'bold'
                                    }
                                },
                                data:[
                                    {   name:'allocatable: '+allocatable_cpu+"m",
                                        value:allocatable_cpu,
                                        itemStyle: {
                                            normal: {
                                            color: '#30ed9d'
                                            }
                                        }
                                    },
                                {
                                        value:allocatable_cpu-allocatable_cpu,
                                        itemStyle: {
                                            normal: {
                                                color: 'transparent'
                                            }
                                        }
                                }
                                ]
                            }
                        ]
                    };
                    var mem_chart_option = {
                        color: ['#FF0000', '#4ebefd','#30ed9d'],
                        legend: {
                            orient: 'vertical',
                            x: '15%',
                            top:'70%',
                            itemHeight: 15,//图例的高度
                            itemGap:5,//图例之间的间距
                            data:['capacity: '+capacity_mem +"Mi",'use: '+use_mem+"Mi","allocatable: "+ allocatable_mem+"Mi"]
                            //图例的名字需要和饼图的name一致，才会显示图例
                        },
                        series: [
                            {
                                name: "capacity: "+capacity_mem  +"Mi",
                                type:'pie',
                                radius: ['40%', '45%'],
                                label: {
                                show: false,
                                position: 'center',
                                },
                                labelLine: {
                                    normal: {
                                        show: false
                                    }
                                },
                                emphasis: {
                                    label: {
                                        show: true,
                                        fontSize: '20',
                                        fontWeight: 'bold'
                                    }
                                },
                                data:[
                                    {   name:'capacity: '+capacity_mem +"Mi" ,
                                        value:capacity_mem,
                                        itemStyle: {
                                            normal: {
                                            color: '#FF0000'
                                            }
                                        }
                                    },
                                {
                                        value:capacity_mem-capacity_mem,
                                        itemStyle: {
                                            normal: {
                                                color: 'transparent'
                                            }
                                        }
                                }
                                ]
                            },
                            {
                                name:'use: '+use_mem+"Mi",
                                type:'pie',
                                radius: ['20%', '25%'],
                                label: {
                                show: false,
                                position: 'center',
                                },
                                labelLine: {
                                    normal: {
                                        show: false
                                    }
                                },
                                emphasis: {
                                    label: {
                                        show: true,
                                        fontSize: '20',
                                        fontWeight: 'bold'
                                    }
                                },
                                data:[
                                    {   name:'use: '+use_mem+"Mi",
                                        value:use_mem,
                                        itemStyle: {
                                            normal: {
                                            color: '#4ebefd'
                                            }
                                        }
                                    },
                                {
                                        value:capacity_mem-use_mem,
                                        itemStyle: {
                                            normal: {
                                                color: 'transparent'
                                            }
                                        }
                                }
                                ]
                            },
                            {
                                name:'allocatable: '+allocatable_mem+"Mi",
                                type:'pie',
                                radius: ['30%', '35%'],
                                label: {
                                show: false,
                                position: 'center',
                
                                },
                                labelLine: {
                                    normal: {
                                        show: false
                                    }
                                },
                                emphasis: {
                                    label: {
                                        show: true,
                                        fontSize: '20',
                                        fontWeight: 'bold'
                                    }
                                },
                                data:[
                                    {   name:'allocatable: '+allocatable_mem+"Mi",
                                        value:allocatable_mem,
                                        itemStyle: {
                                            normal: {
                                            color: '#30ed9d'
                                            }
                                        }
                                    },
                                {
                                        value:capacity_mem-allocatable_mem,
                                        itemStyle: {
                                            normal: {
                                                color: 'transparent'
                                            }
                                        }
                                }
                                ]
                            }
                        ]
                    };
                    var pod_chart_option = {
                        color: ['#FF0000', '#66ff00'],
                        legend: {
                            orient: 'vertical',
                            x: '15%',
                            top:'70%',
                            itemHeight: 15,//图例的高度
                            itemGap:5,//图例之间的间距
                            data:['pod_max: '+pod_max ,'pod_use: '+pod_use]
                            //图例的名字需要和饼图的name一致，才会显示图例
                        },
                        series: [
                            {
                                name: "pod_max: "+pod_max ,
                                type:'pie',
                                radius: ['40%', '45%'],
                                label: {
                                show: false,
                                position: 'center',
                                },
                                labelLine: {
                                    normal: {
                                        show: false
                                    }
                                },
                                emphasis: {
                                    label: {
                                        show: true,
                                        fontSize: '20',
                                        fontWeight: 'bold'
                                    }
                                },
                                data:[
                                    {   name:'pod_max: '+pod_max ,
                                        value:pod_max,
                                        itemStyle: {
                                            normal: {
                                            color: '#FF0000'
                                            }
                                        }
                                    },
                                {
                                        value:pod_max-pod_max,
                                        itemStyle: {
                                            normal: {
                                                color: 'transparent'
                                            }
                                        }
                                }
                                ]
                            },
                            {
                                name:'pod_use: '+pod_use,
                                type:'pie',
                                radius: ['30%', '35%'],
                                label: {
                                show: false,
                                position: 'center',
                                },
                                labelLine: {
                                    normal: {
                                        show: false
                                    }
                                },
                                emphasis: {
                                    label: {
                                        show: true,
                                        fontSize: '20',
                                        fontWeight: 'bold'
                                    }
                                },
                                data:[
                                    {   name:'pod_use: '+pod_use,
                                        value:pod_use,
                                        itemStyle: {
                                            normal: {
                                            color: '#66ff00'
                                            }
                                        }
                                    },
                                {
                                        value:pod_max-pod_use,
                                        itemStyle: {
                                            normal: {
                                                color: 'transparent'
                                            }
                                        }
                                }
                                ]
                            },
                        ]
                    };
                                            
                    cpu_chart.setOption(cpu_chart_option)
                    mem_chart.setOption(mem_chart_option)
                    pod_chart.setOption(pod_chart_option)
                })
                .catch(res => {
                    message.error(res.msg)
                })
                .finally (() => {
                    appLoading.value = false
                })
        }

        return {
            appLoading,
            searchValue,
            activeKey,
            eventList,
            clusterNum,
            columns,
            pagination,
            color,
            resourceList,
            handleTableChange,
            timeTrans,
            getEventList
        }
    },
})
</script>

<style scoped>
    .home-row1 {
        background-color: rgb(255, 255, 255) !important;
        padding: 20px;
        margin-bottom: 15px;
    }

</style>

<template>
    <a-layout>
        <a-affix>
            <!-- 布局头部 -->
            <a-layout-header> 
                <!-- 平台名 -->
                <div style="float:left;">
                    <a href="/home">
                        <img style="height:40px;margin-bottom:10px;" :src="kubeLogo" />
                        <span  href="/home" style="padding:0 50px 0 20px;font-size:25px;font-weight:bold;color:#002140">AutoOps</span>
                    </a>
                </div>
                <!-- 集群 -->
                <a-menu
                style="float:left;width:250px;"
                v-model:selectedKeys="selectedKeys1"
                theme="light"
                mode="horizontal"
                :style="{ lineHeight: '64px',background: '#ffffff',fontSize: '13px' }">
                    <a-menu-item v-for="(item) in clusterList" :key="item" @click="clusterChange(item)">{{ item }}</a-menu-item>
                </a-menu>
                <!-- 用户信息 -->
                <div style="float:right;">
                    <img style="height:40px;border-radius:50%;margin-right:10px;" :src="avator"/>
                    <a-dropdown style="margin-top: 10px;" :overlayStyle="{paddingTop: '20px'}">
                        <a class="ant-dropdown-link" @click.prevent>
                            {{ LoginUserName }}
                            <down-outlined />
                        </a>
                        <template #overlay>
                            <a-menu>
                                <a-menu-item>
                                <a @click="logout()">退出登录</a>
                                </a-menu-item>
                                <a-menu-item>
                                <a @click="handlePasswd()">修改密码</a>
                                </a-menu-item>
                            </a-menu>
                        </template>
                    </a-dropdown>
                </div>
            </a-layout-header>
        </a-affix>
        <a-layout style="height:calc(100vh - 68px);">
            <!-- 侧边栏，核心 -->
            <!-- collapsed处理展开和收缩  -->
            <a-layout-sider width="240" style="background: #fff" v-model:collapsed="collapsed" collapsible>
                <!-- selectedKeys表示点击选中的栏目,用于a-menu-item -->
                <!-- openKeys表示展开的栏目，用于a-sub-menu -->
                <!-- openChange事件监听 SubMenu 展开/关闭的回调 -->
                <a-menu
                :selectedKeys="selectedKeys2"
                :openKeys="openKeys"
                @openChange="onOpenChange"
                mode="inline"
                theme="light"
                :style="{ height: '100%', borderRight: 0 }">
                    <!-- routers是router/index.js中的路由信息 -->
                    <template v-for="menu in routers" :key="menu">
                        <!-- 处理无子路由的情况，也就是单个栏目 -->
                        <!-- routeChange用于路由跳转 -->
                        <a-menu-item 
                            v-if="menu.children && menu.children.length == 1 && menu.hide == false" 
                            :index="menu.children[0].path" 
                            :key="menu.children[0].path"
                            @click="routeChange('item', menu.children[0].path)">
                            <template #icon>
                                <component :is="menu.children[0].icon" />
                            </template>
                            <span>{{ menu.children[0].name }}</span>
                        </a-menu-item>
                        <!-- 处理有子路由的情况，也就是父栏目 -->
                        <a-sub-menu
                            v-else-if="menu.children && menu.children.length > 1"
                            :index="menu.path"
                            :key="menu.path">
                            <template #icon>
                                <component :is="menu.icon" />
                            </template>
                            <template #title>
                                <span>
                                    <span :class="[collapsed ? 'is-collapse' : '']">{{ menu.name }}</span>
                                </span>
                            </template>
                            <!-- 子栏目（子路由）的处理 -->
                            <template v-for="child in menu.children" >
                                <template v-if="child.hide== false">
                                    <a-menu-item
                                        :key="child.path" 
                                        :index="child.path"
                                        @click="routeChange('sub', child.path)">
                                        <span>{{ child.name }}</span>
                                    </a-menu-item>
                                </template>
                            </template>
                        </a-sub-menu>
                    </template>
                </a-menu>
            </a-layout-sider>
            <a-layout style="padding: 0 1px">
                <!-- 面包屑 -->
                <a-breadcrumb style="margin: 8px 10px">
                    <a-breadcrumb-item>
                        <a href="/home" style="color:darkturquoise;">
                            <home-outlined />
                        </a>
                    </a-breadcrumb-item>
                    <!-- router.currentRoute.value.matched表示路由的match信息，能拿到父路由和子路由的信息 -->
                    <template v-for="(matched,index) in router.currentRoute.value.matched" :key="index">
                        <a-breadcrumb-item v-if="matched.name" style="color:darkturquoise;">
                            {{ matched.name }}
                        </a-breadcrumb-item>
                    </template>
                </a-breadcrumb>
                <!-- main的部分 -->
                <a-layout-content
                :style="{
                    // background: 'rgb(31, 30, 30)',
                    padding: '5px', 
                    margin: 0, 
                    minHeight: '280px', 
                    overflowY: 'auto'}">
                    <!-- 路由占位符 -->
                    <router-view></router-view>
                </a-layout-content>
                <!-- footer部分 -->
                <a-layout-footer style="text-align: center;color:#00CCFF">
                    ©2022 Created by xuezm AutoOps
                </a-layout-footer>
            </a-layout>
        </a-layout>
    </a-layout>

    <a-modal
            v-model:visible="passwdModal"
            title="修改密码"
            :confirm-loading="appLoading"
            cancelText="取消"
            okText="确认"
            :afterClose="handleClose"
            @ok="passwdChartFunc">
            <a-form ref="passwdRef" :model="passwdChart"   :labelCol="{style: {width: '30%'}}">
                <a-input  hidden v-model:value="passwdChart.id" style="width: 200px"/>
                <a-form-item
                    label="旧密码"
                    name="oldpasswd"
                    :rules="[{ required: true, message:'请输入旧密码'}]">
                    <a-input type="password" v-model:value="passwdChart.oldpasswd" style="width: 200px"/>
                </a-form-item>
                <a-form-item
                    label="新密码"
                    name="newpasswd"
                    :rules="[{ required: true, message: '请输入新密码'}]">
                    <a-input type="password" v-model:value="passwdChart.newpasswd" style="width: 200px"  />
                </a-form-item>
                <a-form-item
                    label="确认密码"
                    name="newpasswd1"
                    :rules="[{ required: true, message: '请输入确认密码'  }]">
                    <a-input type="password" v-model:value="passwdChart.newpasswd1" style="width: 200px"  />
                </a-form-item>
            </a-form>

    </a-modal>        

</template>
<script>
import { onBeforeMount, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router'
import kubeLogo from '@/assets/k8s-metrics.png';
import avator from '@/assets/098.jpg';
import httpClient from '@/request';
import common from "@/config";
import { message } from 'ant-design-vue';
export default ({
    setup() {
        //修改密码
        const appLoading = ref(false)
        const passwdModal = ref(false)
        const passwdRef = ref()
        const passwdChart = reactive({
            id: localStorage.getItem("userid"),
            oldpasswd: '',
            newpasswd: '',
            newpasswd1: '',
        })
        const passwdChartData = reactive({
            url: common.changePasswd,
            params: {
                id:  localStorage.getItem("userid"),
                oldpasswd: '',
                newpasswd: '',
                newpasswd1: '',
            }
        })
        //新增
        function handlePasswd() {
            passwdModal.value = true
        }
        function passwdChartFunc() {
            appLoading.value = true
            passwdChartData.params = passwdChart
            httpClient.post(passwdChartData.url, passwdChartData.params)
            .then(res => {
                message.success(res.msg)
            })
            .catch(res => {
                message.error(res.msg)
            })
            .finally(() => {
                //重置表单
                passwdRef.value.resetFields()
                //关闭抽屉
                passwdModal.value = false
                appLoading.value = false
            })
        }
        // const appLoading = ref(false)
        const LoginUserName = localStorage.getItem("name")
        const routers = ref([])
        const openKeys = ref([])
        const collapsed = ref(false)
        const selectedKeys1 = ref([])
        const selectedKeys2 = ref([])

        //集群列表
        const clusterList = ref([])
        //发起请求用的变量以Data结尾
        const clusterListData = reactive({
            url: common.k8sClusterList,
        })
        //使用useRouter方法获取路由配置以及当前路由信息
        const router = useRouter()
        //【方法】
        //列表
        const getClusterList = () => {
            // appLoading.value = true
            httpClient.get(clusterListData.url)
            .then(res => {
                //响应成功，获取deployment列表和total
                clusterList.value = res.data
                //集群数量放到localstorage中,方便其他地方使用
                localStorage.setItem('cluster_num', clusterList.value.length)
                //如果selectedKeys1为空, 将clusterList的第一个值赋值为selectedKeys1的value , 做初始化选择
                if (!selectedKeys1.value.length) {
                    selectedKeys1.value[0] = clusterList.value[0]
                    localStorage.setItem('k8s_cluster', clusterList.value[0])
                }
            })
            .catch(res => {
                message.error(res.msg)
            })
            // .finally(() => {
            //     appLoading.value = false
            // })
        }

        function clusterChange(val)  {
            if (selectedKeys1.value[0] == val) {
                return
            } else {
                //处理集群的切换
                selectedKeys1.value[0] = val
                localStorage.setItem('k8s_cluster', val)
                //router.push(router.currentRoute.value.path)
                //刷新当前页面
                location.replace(router.currentRoute.value.path)
            }
        }
        //导航栏点击切换页面
        const routeChange =  (type, path) => {
            //判断点击的栏目是否为父栏目，如果不是，则关闭其他父栏目
            if (type !== 'sub') {
                openKeys.value = []
            }
            //表示选中当前path对应的栏目
            selectedKeys2.value = [path]
            if(router.currentRoute.value.path !== path){
                //获取路由对象并切换
                router.push(path)
            }
        }
        //根据url自动导航栏目高亮
        const getRouter = (val) => {
            selectedKeys2.value = [val[1].path]
            openKeys.value = [val[0].path]
        }
        //处理菜单栏展开与关闭
        const onOpenChange = (val) => {
            const latestOpenKey = val.find(key => openKeys.value.indexOf(key) === -1);
            openKeys.value = latestOpenKey ? [latestOpenKey] : [];
        }
        //退出登录
        const logout = () => {
            //移除用户名
            localStorage.removeItem('name');
            //移除token
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('userid');
            //跳转至/login页面
            router.push('/login');
        }
        //生命周期钩子
        onBeforeMount(() => {
            getClusterList()
            if (localStorage.getItem('k8s_cluster')) {
                selectedKeys1.value[0] = localStorage.getItem('k8s_cluster')
            }

        })
        onMounted(() => {
            routers.value = router.options.routes
            getRouter(router.currentRoute.value.matched)
        })
        //将变量和方法返回出去才能使用
        return {
            kubeLogo,
            avator,
            collapsed,
            selectedKeys1,
            selectedKeys2,
            openKeys,
            router,
            routers,
            clusterList,
            routeChange,
            onOpenChange,
            logout,
            clusterChange,
            LoginUserName,
            handlePasswd,
            appLoading,
            passwdChartFunc,
            passwdModal,
            passwdRef,
            passwdChart,
        };
    },
});
</script>
<style >
    .ant-layout-sider-trigger{
        background: #fff !important;
        color: #002140 !important;
    }

</style>
<style scoped>
    .ant-layout-header {
        padding: 0 30px !important;
        background: #ffffff;
    }
    .ant-layout-content::-webkit-scrollbar {
        width:6px;
    }
    .ant-layout-content::-webkit-scrollbar-track {
        background-color:rgb(164, 162, 162);
    }
    .ant-layout-content::-webkit-scrollbar-thumb {
        background-color:#666;
    }
    .ant-layout-footer {
        padding: 5px 50px !important;
        color: rgb(239, 239, 239);
    }
    .is-collapse {
        display: none;
    }
    .ant-layout-sider {
        /* background: #141414 !important; */
        background: #fff !important;
        overflow-y: auto;
    }


    .ant-layout-sider::-webkit-scrollbar {
        display: none;
    }
    .ant-menu-item {
        margin: 0 !important;
    }
</style>
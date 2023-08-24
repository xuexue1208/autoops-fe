//导入router的路由模式
import {createRouter, createWebHistory} from 'vue-router'
//导入进度条组件
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
//导入整体布局Layout
import Layout from "@/layout/Layout"
// //导入jwt token组件
// import jwt from 'jsonwebtoken'

//路由规则
const routes = [
    {
        path: '/',
        redirect: '/home' //重定向
    },
    {
        path: '/login',  //url路径
        component: () => import('@/views/common/Login.vue'),  //视图组件
        meta: {title: "登录", requireAuth: false},  //meta元信息
    },
    // {
    //     path: '/echart',  //url路径
    //     component: () => import('@/views/common/Echart.vue'),  //视图组件
    //     meta: {title: "Echart", requireAuth: true},  //meta元信息
    // },
    {   
        path: "/home",
        //引入布局组件
        component: Layout,
        hide: false,
        children: [
            {
                path: "/home",
                name: "概览",
                icon: "dashboard-two-tone",
                meta: {title: "概览", requireAuth: true},
                //真正的页面内容,会显示在布局的main 部分
                component: () => import('@/views/home/Home.vue'),
            }
        ]
    },
    {
        path: "/cluster",
        name: "K8S集群",
        component: Layout,
        icon: "CloudTwoTone",
        children: [
            {
                path: "/cluster/node/info",
                name: "Node详情",
                hide: true,
                meta: {title: "Node详情", requireAuth: true},
                component: () => import('@/views/cluster/Nodeinfo.vue'),
            },
            {
                path: "/cluster/node",
                name: "Node",
                hide: false,
                meta: {title: "Node", requireAuth: true},
                component: () => import('@/views/cluster/Node.vue'),
            },
            {
                path: "/cluster/namespace",
                name: "Namespace",
                hide: false,
                meta: {title: "Namespace", requireAuth: true},
                component: () => import('@/views/cluster/Namespace.vue'),
            },
            {
                path: "/cluster/pv",
                name: "PV",
                hide: false,
                meta: {title: "PV", requireAuth: true},
                component: () => import('@/views/cluster/PV.vue'),
            },
    //     ]
    // },
    // {
    //     path: "/workload",
    //     name: "工作负载",
    //     component: Layout,
    //     icon: "block-outlined",
    //     children: [
            {
                path: "/workload/deployment/info",
                name: "deployment详情",
                hide: true,
                meta: {title: "deployment详情", requireAuth: true},
                component: () => import('@/views/workload/DeploymentInfo.vue'),
            },
            {
                path: "/workload/pod",
                name: "Pod",
                hide: false,
                meta: {title: "Pod", requireAuth: true},
                component: () => import('@/views/workload/Pod.vue'),
            },
            {
                path: "/workload/deployment",
                name: "Deployment",
                hide: false,
                meta: {title: "Deployment", requireAuth: true},
                component: () => import('@/views/workload/Deployment.vue'),
            },
            {
                path: "/workload/daemonset",
                name: "DaemonSet",
                hide: false,
                meta: {title: "DaemonSet", requireAuth: true},
                component: () => import('@/views/workload/DaemonSet.vue'),
            },
            {
                path: "/workload/statefulset",
                name: "StatefulSet",
                hide: false,
                meta: {title: "StatefulSet", requireAuth: true},
                component: () => import('@/views/workload/StatefulSet.vue'),
            },
    //     ]
    // },
    // {
    //     path: "/loadbalance",
    //     name: "负载均衡",
    //     component: Layout,
    //     icon: "partition-outlined",
    //     children: [
            {
                path: "/loadbalance/ingress",
                name: "Ingress",
                hide: false,
                meta: {title: "Ingress", requireAuth: true},
                component: () => import('@/views/loadbalance/Ingress.vue'),
            },
            {
                path: "/loadbalance/ingressroute",
                name: "IngressRoute",
                hide: false,
                meta: {title: "Ingress", requireAuth: true},
                component: () => import('@/views/loadbalance/Ingressroute.vue'),
            },
            {
                path: "/loadbalance/service",
                name: "Service",
                hide: false,
                meta: {title: "Service", requireAuth: true},
                component: () => import('@/views/loadbalance/Service.vue'),
            },
    //     ]
    // },
    // {
    //     path: "/storage",
    //     name: "存储配置",
    //     component: Layout,
    //     icon: "book-outlined",
    //     children: [
            {
                path: "/storage/configmap",
                name: "Configmap",
                hide: false,
                meta: {title: "Configmap", requireAuth: true},
                component: () => import('@/views/storage/Configmap.vue'),
            },
            {
                path: "/storage/secret",
                name: "Secret",
                hide: false,
                meta: {title: "Secret", requireAuth: true},
                component: () => import('@/views/storage/Secret.vue'),
            },
            {
                path: "/storage/pvc",
                name: "PVC",
                hide: false,
                meta: {title: "PVC", requireAuth: true},
                component: () => import('@/views/storage/PVC.vue'),
            }
        ]
    },
    {
        path: '/workload/pod/terminal',  //url路径
        component: () => import('@/views/workload/PodTerminal.vue'),  //视图组件
        meta: {title: "终端", requireAuth: false},  //meta元信息
    },
    {
        path: '/workload/pod/log',  //url路径
        component: () => import('@/views/workload/PodLog.vue'),  //视图组件
        meta: {title: "日志", requireAuth: false},  //meta元信息
    },

    {
        path: '/helmstore',
        name: "Helm应用",
        component: Layout,
        icon: "AppstoreTwoTone",
        children: [
            {
                path: "/helmstore/release",
                name: "Release",
                hide: false,
                meta: {title: "Release", requireAuth: true},
                component: () => import('@/views/helmstore/Release.vue'),
            },
            {
                path: "/helmstore/chartrepo",
                name: "Chart仓库",
                hide: false,
                meta: {title: "Chart仓库", requireAuth: true},
                component: () => import('@/views/helmstore/ChartRepo.vue'),
            }
        ]
    },
    {
        path: '/application',
        name: "容器应用",
        component: Layout,
        icon: "SettingTwoTone",
        children: [
            {
                path: "/application",
                name: "应用管理",
                hide: false,
                meta: {title: "应用管理", requireAuth: true},
                component: () => import('@/views/application/Application.vue'),
            },
            {
                path: "/orchestration",
                name: "容器编排",
                hide: false,
                meta: {title: "容器编排", requireAuth: true},
                component: () => import('@/views/orchestration/Orchestration.vue'),
            }
        ]
    },
    {
        path: '/cicd',
        name: "CICD",
        component: Layout,
        icon: "CiTwoTone",
        children: [
            {
                path: "/build",
                name: "编译记录",
                hide: false,
                meta: {title: "编译记录", requireAuth: true},
                component: () => import('@/views/build/Build.vue'),
            },
            {
                path: "/deploy",
                name: "容器部署",
                hide: false,
                meta: {title: "容器部署", requireAuth: true},
                component: () => import('@/views/deploy/Deploy.vue'),
            }
        ]
    },
]

// createRouter 创建路由实例
const router = createRouter({
    /**
     * hash模式：createWebHashHistory，
     * history模式：createWebHistory
     */
    history: createWebHistory(),
    routes
})

//递增进度条，这将获取当前状态值并添加0.2直到状态为0.994
NProgress.inc(100)
//easing 动画字符串
//speed 动画速度
//showSpinner 进度环显示隐藏
NProgress.configure({ easing: 'ease', speed: 600, showSpinner: false })

//router.beforeEach（）一般用来做一些进入页面的限制。比如没有登录，就不能进入某些
//页面，只有登录了之后才有权限查看某些页面。。。说白了就是路由拦截。
//to 要去到某个页面的属性
//from 从哪个页面来的属性
//next 处理路由跳转及放行
router.beforeEach((to, from, next) => {
    // 启动进度条
    NProgress.start()


    // 设置头部
    if (to.meta.title) {
        document.title = to.meta.title
    } else {
        document.title = "AutoOps"
    }
    //放行
    next()
})

//使用钩子函数对路由进行权限跳转
router.beforeEach((to, from, next) => {
    var token = sessionStorage.getItem('token')
    if (token == null) {
        if (to.path === '/login') {
            next();
        } else {
            next('/login');
        }
    } else {
        next();
    }
});


//页面加载完成后动作
router.afterEach(() => {
    // 关闭进度条
    NProgress.done()
})

// 抛出路由实例, 在 main.js 中引用
export default router
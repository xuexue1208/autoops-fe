<template>
    <div class="login">
        <a-card class="login-card" :headStyle="{padding:'0px'}" :bodyStyle="{padding:'20px'}">
            <template #title>
                <div class="login-card-header">
                    <img style="height:25px;margin:0 8px 5px 0;" :src="kubeLogo" />
                    <span>AutoOps</span>
                </div>
            </template>

            <!-- ref="formRef" 做校验使用 -->
            <a-form ref="formRef" :model="loginData" :label-col="{ span: 5 }">
                <a-form-item
                label="用户"
                name="name"
                :rules="[{ required: true, message: '请输入账号' }]">
                    <a-input v-model:value="loginData.name" />
                </a-form-item>
                <a-form-item
                label="密码"
                name="password"
                :rules="[{ required: true, message: '请输入密码' }]">
                    <a-input-password v-model:value="loginData.password" />
                </a-form-item>
                <a-form-item style="text-align:center;margin-bottom:10px;">
                    <!-- <c-button style="width:100%;" type="primary" size="normal" icon="user-outlined" @click="onCheck()">登录</c-button> -->
                    <a-button style="width:100%;" type="primary" shape="round" size="large" @click="onCheck()">登录</a-button>
                </a-form-item>
            </a-form>
        </a-card>
    </div>
</template>

<script>
import kubeLogo from '@/assets/k8s-metrics.png';
import { reactive, ref } from 'vue';
import { message } from 'ant-design-vue';
import { useRouter } from 'vue-router'
import httpClient from '@/request';
import common from "@/config";
// import jwt from 'jsonwebtoken';
import moment from 'moment';
export default({
    setup() {
        const formRef = ref()
        const loginData = reactive({
            name: '',
            password: ''
        })
        const loginUrl = common.loginAuth

        const router = useRouter()

        //登录方法 ,同步执行
        const onCheck = async () => {
            try {
                //具体同步执行的内容
                await formRef.value.validateFields();
                //console.log('Success:', values);
                handleLogin()
            } catch (errorInfo) {
                console.log('Failed:', errorInfo);
            }
        }
        function handleLogin()  {
            // console.log("登录信息:",loginData)
            httpClient.post(loginUrl, loginData)
            .then(res => {
                localStorage.setItem('name', loginData.name);
                localStorage.setItem('loginDate', moment().format('YYYY-MM-DD HH:mm:ss'));
                sessionStorage.setItem('token',res.token)
                router.push('/');
                message.success(res.msg)
            })
            .catch(res => {
                message.error(res.msg)
            })
        }
        return {
            kubeLogo,
            loginData,
            formRef,
            handleLogin,
            onCheck
        }
    },
})
</script>


<style scoped>
/* 添加scoped , 表示页面之间的css互不干扰 */

/* 调整背景及布局 */
    .login {
        height: 100vh;
        background-image: url(../../assets/login.jpeg);
        background-size: 90%;
        display: grid;
        place-items: center;
    }
    .login-card {
        width: 350px;
    }
    .login-card-header {
        font-size: 18px;
        font-weight: bold;
        text-align: center;
    }
</style>
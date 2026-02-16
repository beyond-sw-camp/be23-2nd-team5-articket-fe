<template>
    <div>
        구글 로그인 진행중...
    </div>
</template>

<script>
import axios from 'axios';

export default {
    created() {
        //인가코드를 가져와서
        const code = new URL(window.location.href).searchParams.get("code");
        this.sendCodeToServer(code);
        console.log(code);
    },
    methods: {
        //서버로 인가코드를 보낸다 인가코드는 url-encoded방식
        async sendCodeToServer(code) {
            try {
                const response = await axios.post("http://localhost:8082/member/google/doLogin", { code });
                console.log("data : ", response.data)
                const access_token = response.data.access_token;
                localStorage.setItem("accessToken", access_token);
                const refresh_token = response.data.refresh_token;
                localStorage.setItem("refreshToken", refresh_token);
                await axios.get('http://localhost:8082/member/isVerified', {
                    headers: {
                        Authorization: `Bearer ${access_token}`
                    }
                });
                localStorage.setItem("isVerified", true);
            } catch (e) {
                console.log(e)
            }
            window.location.href = "/";
        }
    }
}
</script>
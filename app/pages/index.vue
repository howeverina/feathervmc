<template>
  <div id="app-wrapper">
        <div class="part-wrapper">
            <h2>VMC 신호 믹서</h2>
            <div class="description">
                <p>웹캠 기반 VMC 신호와 트래커 기반 VMC 신호를 선택적으로 전송하는 기능입니다.</p>
            </div>
            <div class="form">
                <div class="form-layout">
                    <div class="form-title">웹캠 포트</div>
                    <input v-model="port1" type="number" placeholder="기본 신호를 받아올 포트 입력" />
                </div>
                <div class="form-layout">
                    <div class="form-title">트래커 포트</div>
                    <input v-model="port2" type="number" placeholder="트래커 신호를 받아올 포트 입력" />
                </div>
                <div class="form-layout">
                    <div class="form-title">전송할 아이피</div>
                    <input v-model="sendIp" placeholder="목적지의 아이피 입력" />
                </div>
                <div class="form-layout">
                    <div class="form-title">전송할 포트</div>
                    <input v-model="sendPort" type="number" placeholder="최종 신호를 전송할 포트 입력" />
                </div>
            </div>
            
            <div class="description">
                <p>현재 트래커에서 받아오는 신호: 'chest', 'upperChest', 'leftShoulder', 'leftUpperArm', 'leftLowerArm', 'rightShoulder', 'rightUpperArm', 'rightLowerArm' 입니다.</p>
            </div>
            <div class="button-wrapper">
                <button id="startbt" @click="vmcmix" :disabled="isRunning">신호 합치기!</button>
                <button id="stopbt" @click="stop" :disabled="!isRunning" >포트 닫기</button>
            </div>
        </div>
        <div class="part-wrapper">
            <h2>VMC 신호 스플리터</h2>
            <div class="description">
                <p>한 신호를 2개의 다른 포트에 보내 주는 기능입니다.</p>
            </div>

            <div class="form">
                <div class="form-layout">
                    <div class="form-title">전송받을 포트</div>
                    <input v-model="port3" type="number" placeholder="기본 신호를 받아올 포트 입력" />
                </div>
                <div class="form-layout">
                    <div class="form-title">전송할 아이피(1)</div>
                    <input v-model="sendIp1" placeholder="목적지의 아이피 입력" />
                </div>
                <div class="form-layout">
                    <div class="form-title">전송할 포트(1)</div>
                    <input v-model="sendPort1" type="number" placeholder="트래커 신호를 받아올 포트 입력" />
                </div>
                <div class="form-layout">
                    <div class="form-title">전송할 아이피(2)</div>
                    <input v-model="sendIp2" placeholder="목적지의 아이피 입력" />
                </div>
                <div class="form-layout">
                    <div class="form-title">전송할 포트(2)</div>
                    <input v-model="sendPort2" type="number" placeholder="트래커 신호를 받아올 포트 입력" />
                </div>
            </div>
        </div>
        <div class="part-wrapper">
            <h2>VMC 본 커넥터</h2>
            <div class="description">
                <p>빈 vrm 아마튜어의 Hips 본에 장착되어있는 물체의 양끝을 기존 vrm 아마튜어의 본에 고정합니다. 기타나 베이스 같은 악기를 고정할 때 유용합니다.</p>
            </div>

            <div class="form">
                <div class="form-layout">
                    <div class="form-title">전송받을 포트</div>
                    <input v-model="port4" type="number" placeholder="기본 신호를 받아올 포트 입력" />
                </div>
                <div class="form-layout">
                    <div class="form-title">전송할 아이피</div>
                    <input v-model="sendIp4" placeholder="목적지의 아이피 입력" />
                </div>
                <div class="form-layout">
                    <div class="form-title">전송할 포트</div>
                    <input v-model="sendPort4" type="number" placeholder="트래커 신호를 받아올 포트 입력" />
                </div>
                <div class="form-layout">
                    <div class="form-title">고정 본</div>
                    <input v-model="bone1" placeholder="본 명칭 입력" />
                </div>
                <div class="form-layout">
                    <div class="form-title">유동 본</div>
                    <input v-model="bone2" placeholder="본 명칭 입력" />
                </div>
                <div class="button-wrapper">
                    <button id="startbt3" @click="vmcboneconnect" :disabled="isRunning3">본 연결하기!</button>
                    <button id="stopbt3" @click="stop3" :disabled="!isRunning3" >포트 닫기</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref } from 'vue'
    const port1 = ref(39541)
    const port2 = ref(39542)
    const sendPort = ref(39539)
    const sendIp = ref('127.0.0.1')
    const isRunning = ref(false)

    const port3 = ref(39539)
    const sendPort1 = ref(39543)
    const sendPort2 = ref(39544)
    const sendIp1 = ref('127.0.0.1')
    const sendIp2 = ref('127.0.0.1')

    const port4 = ref(39544)
    const sendPort4 = ref(39545)
    const sendIp4 = ref('127.0.0.1')
    const bone1 = ref('Spine')
    const bone2 = ref('LeftHand')
    const isRunning3 = ref(false)

    const vmcmix = async () => {
        const { data } = await useFetch('/api/vmcmixer', {
            method: 'POST',
            body: { 
                use2ndData: ['Chest', 'UpperChest', 'LeftShoulder', 'LeftUpperArm', 'LeftLowerArm', 'RightShoulder', 'RightUpperArm', 'RightLowerArm'], 
                port1: port1.value, 
                port2: port2.value, 
                sendIp: sendIp.value, 
                sendPort: sendPort.value
            }
        })
        if (data.value?.success) isRunning.value = true
    }
    
    const vmcboneconnect = async () => {
        const { data } = await useFetch('/api/vmcboneconnecter', {
            method: 'POST',
            body: {
                port4: port4.value,
                sendIp4: sendIp4.value,
                sendPort4: sendPort4.value,
                bone1: bone1.value,
                bone2: bone2.value
            }
        })
        if (data.value?.success) isRunning3.value = true
    }

    const stop = async () => {
    
        const { data } = await useFetch('/api/vmcstop', {
            method: 'POST'
        });
        if (data.value?.success) isRunning.value = false
    };
    const stop3 = async () => {
    
        const { data } = await useFetch('/api/vmcstop3', {
            method: 'POST'
        });
        if (data.value?.success) isRunning3.value = false
    };
</script>

<style>

    #app-wrapper {
        margin: 3rem auto;
        width: 100%;
        max-width: 1000px;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .part-wrapper {
        padding: 20px;
        background-color: white;
        border-radius: 10px;
    }

    .description {
        font-size: 0.9rem;
        color: #ccc;
    }

    .form {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .form-layout {
        display: grid;
        grid-template-columns: 200px 1fr;
    }

    .form-title {
        font-weight: 700;
    }

    input {
        padding: 4px;
        border-radius: 10px;
        border: 1px solid #eee;
        width: 100%;
    }

    .button-wrapper {
        display: flex;
        gap: 10px;
        align-items: center;
        justify-content: center;
    }

    button {
        width: 100px;
        min-width: 100px;
        text-align: center;
        padding: 7px;
        background-color: #86D7FF;
        color: white;
        border-radius: 10px;
        text-decoration-line: none;
        font-weight: 700;
        border: 0;
    }

    button:disabled {
        background-color: #86D7FF88;
    }

</style>
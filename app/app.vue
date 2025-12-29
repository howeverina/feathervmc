<template>
  <div>
    웹캠 포트 <input v-model="port1" type="number" placeholder="기본 신호를 받아올 포트 입력" />
    트래커 포트 <input v-model="port2" type="number" placeholder="트래커 신호를 받아올 포트 입력" />
    <div>
      현재 트래커에서 받아오는 신호: 'chest', 'upperChest', 'leftShoulder', 'leftUpperArm', 'leftLowerArm', 'rightShoulder', 'rightUpperArm', 'rightLowerArm' 입니다.
    </div>
    전송할 포트 <input v-model="sendPort" type="number" placeholder="최종 신호를 전송할 포트 입력" />
    <button id="startbt" @click="vmcmix" :disabled="isRunning">신호 합치기!</button>
    <button id="stopbt" @click="stop" :disabled="!isRunning" >포트 닫기</button>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  const port1 = ref(39541)
  const port2 = ref(39542)
  const sendPort = ref(39539)
  const isRunning = ref(false);

  const vmcmix = async () => {
    const { data } = await useFetch('/api/vmcmixer', {
      method: 'POST',
      body: { 
        use2ndData: ['chest', 'upperChest', 'leftShoulder', 'leftUpperArm', 'leftLowerArm', 'rightShoulder', 'rightUpperArm', 'rightLowerArm'], 
        port1: port1.value, 
        port2: port2.value, 
        sendIp: '127.0.0.1', 
        sendPort: sendPort.value
      }
    })
    if (data.value?.success) isRunning.value = true
  }

  const stop = async () => {
  const { data } = await useFetch('/api/vmcstop', {
    method: 'POST'
  });
  if (data.value?.success) isRunning.value = false
};
</script>
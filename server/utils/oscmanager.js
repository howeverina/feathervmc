import osc from 'osc'
import * as THREE from 'three';

// 전역 변수로 포트 객체들 저장
let firstPort, secondPort, sendPort, bonePort
let use2ndDataArray = []
let startBone, endBone
let boneInterval

export const initOSC = (config) => {
    // 이미 포트가 열려 있다면 닫고 새로 열거나, 혹은 무시하는 로직 필요
    if (firstPort || secondPort || sendPort) {
        console.log("포트가 이미 열려 있습니다. 설정을 업데이트합니다.")
        use2ndDataArray = config.use2ndData
        return
    }

    use2ndDataArray = config.use2ndData;

    firstPort = new osc.UDPPort({
        localAddress: "0.0.0.0",
        localPort: config.port1
    })

    secondPort = new osc.UDPPort({
        localAddress: "0.0.0.0",
        localPort: config.port2
    })

    sendPort = new osc.UDPPort({
        localAddress: "127.0.0.1",
        remoteAddress: config.sendIP,
        remotePort: config.sendPort
    })

    const forwardMessage = (oscMessage, isSecond) => {
        const boneName = oscMessage.args[0]
        const isRoot = oscMessage.address === '/VMC/Ext/Root/Pos'
        const isBone = oscMessage.address === '/VMC/Ext/Bone/Pos'

        let shouldSend = false
        
        if (isBone) {
            shouldSend = isSecond ? use2ndDataArray.includes(boneName) : !use2ndDataArray.includes(boneName)
        } else if (isRoot) {
            shouldSend = isSecond ? use2ndDataArray.includes('root') : !use2ndDataArray.includes('root')
        } else {
            shouldSend = isSecond ? use2ndDataArray.includes('others') : !use2ndDataArray.includes('others')
        }

        if (shouldSend) {
            sendPort.send(oscMessage)
        }
    }

    firstPort.on("message", (msg) => forwardMessage(msg, false))
    secondPort.on("message", (msg) => forwardMessage(msg, true))

    firstPort.open()
    secondPort.open()
    sendPort.open()

    console.log("OSC Ports Opened!")
}
// 포트 닫기 함수 추가
export const stopOSC = () => {
    console.log("Closing OSC Ports...")

    if (firstPort) {
        firstPort.close()
    }
    if (secondPort) {
        secondPort.close()
    }
    if (sendPort) {
        sendPort.close()
    }

    console.log("VMC Bridge Stopped");
}

export const startCompoundBoneOSC = (config) => {

    function multiplyQuaternions(a, b) {
        return {
            x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
            y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
            z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
            w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z
        };
    }

    function rotateVector(q, v) {
        const { x: qx, y: qy, z: qz, w: qw } = q;
        const { x: vx, y: vy, z: vz } = v;
        const ix = qw * vx + qy * vz - qz * vy;
        const iy = qw * vy + qz * vx - qx * vz;
        const iz = qw * vz + qx * vy - qy * vx;
        const iw = -qx * vx - qy * vy - qz * vz;
        return {
            x: ix * qw + iw * -qx + iy * -qz - iz * -qy,
            y: iy * qw + iw * -qy + iz * -qx - ix * -qz,
            z: iz * qw + iw * -qz + ix * -qy - iy * -qx
        };
    }

    function calculateWorldTransform(chainNames, boneMap) {
        let currentPos = { x: 0, y: 0, z: 0 };
        let currentRot = { x: 0, y: 0, z: 0, w: 1 };

        for (const name of chainNames) {
            const local = boneMap.get(name);
            if (!local) continue;

            const rotatedPos = rotateVector(currentRot, local.pos);
            currentPos = {
                x: currentPos.x + rotatedPos.x,
                y: currentPos.y + rotatedPos.y,
                z: currentPos.z + rotatedPos.z
            };
            currentRot = multiplyQuaternions(currentRot, local.rot);
        }
        return { position: currentPos, rotation: currentRot };
    }

    function getConnectingBone(trans1, trans2) {
        const p1 = new THREE.Vector3(trans1.position.x, trans1.position.y, trans1.position.z);
        const p2 = new THREE.Vector3(trans2.position.x, trans2.position.y, trans2.position.z);

        const position = p1.clone();
        const direction = new THREE.Vector3().subVectors(p2, p1).normalize();
        const quaternion = new THREE.Quaternion();
        const up = new THREE.Vector3(0, 1, 0); 
        quaternion.setFromUnitVectors(up, direction);

        // 사용자의 의도대로 'Hips'로 반환 (다른 포트의 가짜 모델 제어용)
        return ['Hips', position.x, position.y, position.z, quaternion.x, quaternion.y, quaternion.z, quaternion.w];
    }

    const leftHandChain = [
        "Hips", "Spine", "Chest", "UpperChest", 
        "LeftShoulder", "LeftUpperArm", "LeftLowerArm", "LeftHand"
    ];

    if (bonePort) {
        stopOSC(); // 기존 실행 중인 프로세스 정리
    }

    bonePort = new osc.UDPPort({
        localAddress: "0.0.0.0",
        localPort: config.port4,
        remoteAddress: config.sendIp4,
        remotePort: config.sendPort4,
    });

    startBone = config.bone1 || 'Spine';
    endBone = config.bone2 || 'LeftHand';

    let boneChain1 = leftHandChain.slice(0, leftHandChain.indexOf(startBone) + 1);
    let boneChain2 = leftHandChain.slice(0, leftHandChain.indexOf(endBone) + 1);

    let rawVmcMessages = new Map();
    leftHandChain.forEach(name => {
        rawVmcMessages.set(name, [name, 0, 0, 0, 0, 0, 0, 1]);
    });

    bonePort.on("message", (msg) => {
        if (msg.address === "/VMC/Ext/Bone/Pos") {
            const boneName = msg.args[0];
            if (leftHandChain.includes(boneName)) {
                rawVmcMessages.set(boneName, msg.args);
            }
        }
    });

    bonePort.open();

    boneInterval = setInterval(() => {
        let boneMap = new Map();
        rawVmcMessages.forEach((message) => {
            const [name, x, y, z, qx, qy, qz, qw] = message;
            boneMap.set(name, {
                pos: { x, y, z },
                rot: { x: qx, y: qy, z: qz, w: qw }
            });
        });

        const finalBoneTransform1 = calculateWorldTransform(boneChain1, boneMap);
        const finalBoneTransform2 = calculateWorldTransform(boneChain2, boneMap);

        if (bonePort) {
            bonePort.send({
                address: '/VMC/Ext/Bone/Pos',
                args: getConnectingBone(finalBoneTransform1, finalBoneTransform2)
            });
        }
    }, 50);

    console.log("OSC Ports Opened!");
}

export const stopOSC3 = () => {
    console.log("Closing OSC Ports...")

    if (boneInterval) clearInterval(boneInterval)
    if (bonePort) bonePort.close()

    console.log("VMC Bridge Stopped")
}
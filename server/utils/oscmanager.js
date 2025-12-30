import osc from 'osc';

// 전역 변수로 포트 객체들 저장
let firstPort, secondPort, sendPort;
let use2ndDataArray = [];

export const initOSC = (config) => {
    // 이미 포트가 열려 있다면 닫고 새로 열거나, 혹은 무시하는 로직 필요
    if (firstPort || secondPort || sendPort) {
        console.log("포트가 이미 열려 있습니다. 설정을 업데이트합니다.");
        use2ndDataArray = config.use2ndData;
        return;
    }

    use2ndDataArray = config.use2ndData;

    firstPort = new osc.UDPPort({
        localAddress: "0.0.0.0",
        localPort: config.port1
    });

    secondPort = new osc.UDPPort({
        localAddress: "0.0.0.0",
        localPort: config.port2
    });

    sendPort = new osc.UDPPort({
        localAddress: "127.0.0.1",
        remoteAddress: config.sendIP,
        remotePort: config.sendPort
    });

    // 공통 전송 로직 함수화
    const forwardMessage = (oscMessage, isSecond) => {
        const boneName = oscMessage.args[0];
        const isRoot = oscMessage.address === '/VMC/Ext/Root/Pos';
        const isBone = oscMessage.address === '/VMC/Ext/Bone/Pos';

        let shouldSend = false;
        
        if (isBone) {
            shouldSend = isSecond ? use2ndDataArray.includes(boneName) : !use2ndDataArray.includes(boneName);
        } else if (isRoot) {
            shouldSend = isSecond ? use2ndDataArray.includes('root') : !use2ndDataArray.includes('root');
        } else {
            shouldSend = isSecond ? use2ndDataArray.includes('others') : !use2ndDataArray.includes('others');
        }

        if (shouldSend) {
            sendPort.send(oscMessage);
        }
    };

    firstPort.on("message", (msg) => forwardMessage(msg, false));
    secondPort.on("message", (msg) => forwardMessage(msg, true));

    firstPort.open();
    secondPort.open();
    sendPort.open();

    console.log("OSC Ports Opened!");
}
// 포트 닫기 함수 추가
export const stopOSC = () => {
    console.log("Closing OSC Ports...");

    if (firstPort) {
        firstPort.close();
    }
    if (secondPort) {
        secondPort.close();
    }
    if (sendPort) {
        sendPort.close();
    }

    console.log("VMC Bridge Stopped");
};

// worker.js
const { parentPort } = require('worker_threads');

// 계산 함수들
const calculations = {
    sum: (numbers) => numbers.reduce((acc, curr) => acc + curr, 0),
    multiply: (numbers) => numbers.reduce((acc, curr) => acc * curr, 1),
    average: (numbers) => numbers.reduce((acc, curr) => acc + curr, 0) / numbers.length
};

// 메인 스레드로부터 메시지 수신
parentPort.on('message', (data) => {
    console.log('메인 스레드로부터 받은 데이터:', data);
    
    const { numbers, operation } = data;
    let result;

    // CPU 집약적인 작업 시뮬레이션
    if (calculations[operation]) {
        result = calculations[operation](numbers);
        
        // 작업 지연 시뮬레이션
        for(let i = 0; i < 1000000; i++) {
            result = result + 0;
        }
    } else {
        throw new Error('지원하지 않는 연산입니다.');
    }

    // 결과를 메인 스레드로 전송
    parentPort.postMessage({ 
        operation,
        result,
        processedAt: new Date().toISOString()
    });
});
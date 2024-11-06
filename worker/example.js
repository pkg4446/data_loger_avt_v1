const worker = require("./worker");

async function main(){
    const response = await worker.working("example_worker",{ 
        numbers: [1, 2, 3, 4, 5],
        operation: 'sum'
    });
    console.log(response);
}

main();
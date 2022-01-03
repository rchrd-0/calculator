const container = document.querySelector('.container');
const working = container.querySelector('#working');
const running = container.querySelector('#running');
const buttons = container.querySelector('.buttons');

const clear = container.querySelector('#clear');
let memory = {value: [], operation: '', result: 0,};
let input = [];
let pasta = [];
const reset = () => {
    memory = {value: [], operation: '', result: 0,};
    // memory.value.splice(0, memory.value.length);
    // memory.operation.splice(0, memory.operation.length);
    // memory.result = 0
    input.splice(0, input.length);
    pasta.splice(0, pasta.length);
    working.textContent = 0;
    running.textContent = null;
}
clear.addEventListener('click', event => reset())

// const displayOperation = document.createElement('div');
// displayOperation.setAttribute('id', 'display-Operation');

const evaluate = (operator, a, b) => {
    switch (operator) {
        case 'add':
            return a + b;
        case 'subtract':
            return a - b;
        case 'multiply':
            return a * b;
        case 'divide':
            return a / b;
    }
};

const storeValue = (memoryObj, inputArr) => {
    if (inputArr.length) {
        memoryObj.value.push(
            inputArr.reduce((a, b) => {
                a += b;
                return +a;
            }, 0)
        )
        inputArr.splice(0, input.length);
    } else return
}



buttons.addEventListener('click', event => {
    const target = event.target;
    
    if (target.getAttribute('class') === 'number') {
        if (working.textContent === '0' && target.textContent === '0') return
        else if (working.textContent === '0') {
            working.textContent = target.textContent;
        } else {
            working.textContent += target.textContent;
        }

        input.push(target.textContent);

        // if (memory.value.length === 1) {
        //     pasta.splice(0, pasta.length, +input.join(''));
        //     input.splice(0, input.length)
        //     memory.result = evaluate(...memory.operation, memory.value[0], pasta[0])
        //     running.textContent = memory.result;

        // }
        
    }

    if (target.getAttribute('class') === 'operator') {
        const displayOperator = target.textContent;
        storeValue(memory, input);

        memory.operation = `${target.getAttribute('id')}`
        working.textContent = `${memory.value[0]} ${displayOperator} `
    }

    if (target.getAttribute('class') === 'equals') {
        if (memory.value.length <= 1 && !input.length) return
        storeValue(memory, input);
        
        memory.result = evaluate(memory.operation, ...memory.value)
        running.textContent = memory.result;
        } else return
})


        // if (!input.length && !!memory.result) {
        //     running.textContent = null;
        //     working.textContent = `${memory.result} ${target.textContent}`;
        //     memory.value.push(memory.result);
        //     memory.result = 0;
        // }
        // if (input.length) {
        //     memory.value.push(
        //         input.reduce((start, next) => {
        //             start += next
        //             return +start
        //         }, 0)
        //     );
        //     input.splice(0, input.length);
        // } else return



        // if (!memory.value.length && !!memory.result) {
        //     memory.value.push(memory.result)
        // }

        // working.textContent += `${input[0]}`;



    // if (target.getAttribute('class') === 'equals') {
    //     if (!input.length && !!memory.result) return
    //     storeValue(memory, input);
    //     memory.result = operate(memory.operation, ...memory.value);
    //     memory.value.splice(0, 2);
    //     working.textContent += ' ='
    //     running.textContent = memory.result;

        // if (input.length) {
        //     memory.value.push(
        //         input.reduce((start, next) => {
        //             start += next
        //             return +start
        //         })
        //     );
        //     input.splice(0, input.length);
        // }

    // };



// let x = (a, b) => {
//     console.log(a);
//     console.log(b);
// }

        // input.outgoing.push(input.value.join(''))
        // memory.value.push(+input.outgoing.splice(0, input.outgoing.length));
        // console.table(input);
        // console.table(memory);


    // if (target.getAttribute('class') === 'calclulate') {
    //     memory.value.push(+working.textContent);
    //     console.table(memory);
        
    // }

let add = (a, b) => a + b;
let subtract = (a, b) => a - b;
let multiply = (a, b) => a * b;
let divide = (a, b) => a / b;

function operate(operator, a, b) {
    switch (operator) {
        case 'add':
            return add(a, b)
        case 'subtract':
            return subtract(a, b)
        case 'multiply':
            return multiply(a, b)
        case 'divide':
            return divide(a, b)
    }
}

const container = document.querySelector('.container');
const workingDisplay = container.querySelector('.display.working');
const runningDisplay = container.querySelector('.display.running')
const buttons = container.querySelector('.buttons');

const input = [];
buttons.addEventListener('click', event => {
    const target = event.target;

    if (target.getAttribute('class') === 'number') {
        workingDisplay.textContent += target.textContent;
    }

    if (target.getAttribute('class') === 'operator') {
        if (input[1]) return
        if (!input[0]) {
            input.push(+workingDisplay.textContent, target.getAttribute('id'))
        } else if (input[0]) {
            input.push(target.getAttribute('id'))
        }
        runningDisplay.textContent = `${workingDisplay.textContent} ${target.textContent}`
        workingDisplay.textContent = null;        
    }

    if (target.getAttribute('id') === 'equals') {
        if (!input[0] || !input[1]) return;
        input.push(+workingDisplay.textContent);
        let result = operate(input[1], input[0], input[2]);
        runningDisplay.textContent += ` ${workingDisplay.textContent}`
        workingDisplay.textContent = result;
        input.splice(0, input.length);
        input.push(result);
    }

    if (target.getAttribute('id') === 'clear') {
        result = null;
        workingDisplay.textContent = null;
        runningDisplay.textContent = null;
        input.splice(0, input.length);
    }

});
    
    // if (target.getAttribute('class') === 'operator') {
    //     store(input, "value", inputValue);
    //     runningDisplay.textContent += `${inputValue} `

    //     switch (inputOperation) {
    //         case 'add':
    //             runningDisplay.textContent += '+ '
    //             break;
    //         case 'subtract':
    //             runningDisplay.textContent += '- '
    //             break;
    //         case 'multiply':
    //             runningDisplay.textContent += 'x '
    //             break;
    //         case 'divide':
    //             runningDisplay.textContent += '÷ '
    //     }

    //     if (!input.operation) input.operation = inputOperation;

    //     currentDisplay.textContent = null;
    // }

    // if (target.getAttribute('id') === 'equals') {        
    //     store(input, "value", inputValue);
    //     runningDisplay.textContent += `${inputValue}`
    //     console.table(input);
    //     console.log(input);
    //     currentDisplay.textContent = operate(input.operation, input.value[0], input.value[1])
    // }
    //     .reduce(output, next) {


    // }

    // if (target.getAttribute('id') === 'clear') display.textContent = null;


// let store = (obj, key, value) => {
//     if (obj[key]) obj[key].push(value)
//     else if (!obj[key]) obj[key] = [value];
//     return obj;
// }

// function store(n, o) {
    
//     const testObj = {};
//     if (!testObj.value) {
//         testObj.value = [n]
//     }

//     if (testObj.value) {
//         testObj.value.push(o);
//     }

//     testObj
// }
// console.log(store(3, 2))
const container = document.querySelector('.container');
const workingDisplay = container.querySelector('#working');
const runningDisplay = container.querySelector('#running');
const buttons = container.querySelector('.buttons');

const input = [];
buttons.addEventListener('click', event => {
    const target = event.target;

    if (target.getAttribute('class') === 'number') {
        if (workingDisplay.textContent == '0' ) workingDisplay.textContent = 
            target.textContent;
        else workingDisplay.textContent += target.textContent;
        console.log(`Number Input:`) 
        console.table(input)
    }

    if (target.getAttribute('class') === 'operator') {
        //Change operator instead of adding another operator to array
        if (input.operation && (!workingDisplay.textContent || input.result)) input.operation.pop();


        if (input.value && !!workingDisplay.textContent) {
            store(input, 'value', +workingDisplay.textContent);
            let result = operate(...[input.operation.pop()], ...input.value);
            store(input, 'result', result);
        }
        
        if (input.result && input.result.length) {
            input.value.splice(0, input.value.length, input.result.pop()) 
        }   else {
                store(input, 'value', +workingDisplay.textContent);
        }

        // store(input, 'value', +workingDisplay.textContent);

        runningDisplay.textContent = `${input.value} ${target.textContent}`
        workingDisplay.textContent = null;
        console.log(`Operator Input:`) 
        console.table(input);

    }

    if (target.getAttribute('class') === 'calculate') {
        
        // // if (input.value.length < 2 && !workingDisplay.textContent) return
        store(input, 'value', +workingDisplay.textContent);
        let result = operate(...input.operation, ...input.value);
        // runningDisplay.textContent = `${}`
        runningDisplay.textContent = `${[...runningDisplay.textContent].join('')} ${workingDisplay.textContent} ${target.textContent}`;
        // // runningDisplay.textContent += ` ${[...input.value]} ${target.textContent}`
        workingDisplay.textContent = result;
        // store(input, 'result', result);
        // console.table(input);
    }

    // if (target.getAttribute('id') === 'clear') {
    //     result = null;
    //     workingDisplay.textContent = null;
    //     runningDisplay.textContent = null;
    //     input.splice(0, input.length);
    // }

});

// function calculate() {
//     if (workingDisplay.textContent && store.value.length < 2) {
//         store(input, 'value', +workingDisplay.textContent);
//         store(input, 'operation', target.getAttribute('id'));
//         let result = operate(...input.operation, ...input.value);
//         runningDisplay.textContent += ` ${input.value[1]} ${target.textContent}`
//         workingDisplay.textContent = result;
//         console.table(input);
//     } else return
// }

const operate = (operator, a, b) => {
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

const store = (array, key, value) => { 
    if (!value) return
    if (!array[key]) array[key] = [value];
    else array[key].push(value);
};
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
const container = document.querySelector('.container');
const working = container.querySelector('#working');
const running = container.querySelector('#running');
const buttons = container.querySelector('.buttons');

const clear = container.querySelector('#clear');
let workingMemory = {value: [], operation: '', result: null,};
let input = [];
let pasta = [];
const reset = () => {
    workingMemory = {value: [], operation: '', result: null,};
    input.splice(0, input.length);
    pasta.splice(0, pasta.length);
    working.textContent = 0;
    running.textContent = null;
}
clear.addEventListener('click', event => reset())

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

let number = (button) => {
    //Won't concatenate zeros on leading 0 in working display
    if ((working.textContent === '0' && button.textContent === '0') ||
    //Won't accept further inputs without an operator after a calculation has been completed
        (workingMemory.result != null)) return
    //Replaces leading 0 with input number
    else if (working.textContent === '0') {
        working.textContent = button.textContent;
    } else {
        working.textContent += button.textContent;
    }
    input.push(button.textContent);
}
const equals = () => {
    if (workingMemory.value.length <= 1 && (!input.length || !workingMemory.operation)) return
    storeValue(workingMemory, input);
    workingMemory.result = evaluate(workingMemory.operation, ...workingMemory.value)
    running.textContent = `= ${workingMemory.result}`
    workingMemory.value.splice(0, 2);
}
const operator = (button) => {
    if (workingMemory.value.length === 1 && input.length > 0) equals();
    //If display value left on default 0 (ie. user inputs no numbers), assume first operand to be 0, store 0 in memory
    if (!input.length && !workingMemory.value.length) workingMemory.value[0] = 0;
    const displayOperator = button.textContent;
    //Store result from previous calculation in workingMemory. If no such result exists, store user input as normal
    if (workingMemory.result != null) {
        workingMemory.value.splice(0, 2, workingMemory.result);
        workingMemory.result = null;
    } else storeValue(workingMemory, input);
    workingMemory.operation = `${button.getAttribute('id')}`
    working.textContent = `${workingMemory.value[0]} ${displayOperator} `
}

buttons.addEventListener('click', event => {
    const target = event.target;

    if (target.getAttribute('class') === 'number') number(target);
    if (target.getAttribute('class') === 'operator') operator(target);
    if (target.getAttribute('class') === 'equals') equals();
});

document.addEventListener('keydown', event => {
    switch (event.key) {
        case '1':
            buttons.querySelector('#number-1').click();
            break;
        case '2':
            buttons.querySelector('#number-2').click();
            break;
        case '3':
            buttons.querySelector('#number-3').click();
            break;
        case '4':
            buttons.querySelector('#number-4').click();
            break;
        case '5':
            buttons.querySelector('#number-5').click();
            break;
        case '6':
            buttons.querySelector('#number-6').click();
            break;
        case '7':
            buttons.querySelector('#number-7').click();
            break;
        case '8':
            buttons.querySelector('#number-8').click();
            break;
        case '9':
            buttons.querySelector('#number-9').click();
            break;
        case '0':
            buttons.querySelector('#number-0').click();
            break;
        case '+':
            buttons.querySelector('#add').click();
            break;
        case '-':
            buttons.querySelector('#subtract').click();
            break;
        case '*':
            buttons.querySelector('#multiply').click();
            break;
        case '/':
            buttons.querySelector('#divide').click();
            break;
        case 'Enter':
            buttons.querySelector('.equals').click();
            break;
    }
});
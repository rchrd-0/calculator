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
    // workingMemory.value.splice(0, workingMemory.value.length);
    // workingMemory.operation.splice(0, workingMemory.operation.length);
    // workingMemory.result = 0
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
        //Won't concatenate zeros on leading 0 in working display
        if (working.textContent === '0' && target.textContent === '0') return
        //Replaces leading 0 with input number
        else if (working.textContent === '0') {
            working.textContent = target.textContent;
        } else {
            working.textContent += target.textContent;
        }

        input.push(target.textContent);

        // if (workingMemory.value.length === 1) {
        //     pasta.splice(0, pasta.length, +input.join(''));
        //     input.splice(0, input.length)
        //     workingMemory.result = evaluate(...workingMemory.operation, workingMemory.value[0], pasta[0])
        //     running.textContent = workingMemory.result;

        // }
        
    }

    if (target.getAttribute('class') === 'operator') {
        if (workingMemory.value.length === 1 && input.length > 0) {
            storeValue(workingMemory, input);
        workingMemory.result = evaluate(workingMemory.operation, ...workingMemory.value)
        workingMemory.value.splice(0, 2);
        running.textContent = `= ${workingMemory.result}`
        }
        //If display value left on default 0 (ie. user inputs no numbers), assume first operand to be 0, store 0 in memoryr
        if (!input.length && !workingMemory.value.length) workingMemory.value[0] = 0;
        const displayOperator = target.textContent;
        //Store result from previous calculation in workingMemory. If no such result exists, store user input as normal
        if (workingMemory.result != null) {
            workingMemory.value.splice(0, 2, workingMemory.result);
            workingMemory.result = null;
        } else storeValue(workingMemory, input);

        workingMemory.operation = `${target.getAttribute('id')}`
        working.textContent = `${workingMemory.value[0]} ${displayOperator} `
    }

    if (target.getAttribute('class') === 'equals') {
        //Won't allow calculation unless 2 operands and an operator has been entered
        if (workingMemory.value.length <= 1 && (!input.length || !workingMemory.operation)) return
        storeValue(workingMemory, input);
        workingMemory.result = evaluate(workingMemory.operation, ...workingMemory.value)
        workingMemory.value.splice(0, 2);
        running.textContent = `= ${workingMemory.result}`
        } 
})


        // if (!input.length && !!workingMemory.result) {
        //     running.textContent = null;
        //     working.textContent = `${workingMemory.result} ${target.textContent}`;
        //     workingMemory.value.push(workingMemory.result);
        //     workingMemory.result = 0;
        // }
        // if (input.length) {
        //     workingMemory.value.push(
        //         input.reduce((start, next) => {
        //             start += next
        //             return +start
        //         }, 0)
        //     );
        //     input.splice(0, input.length);
        // } else return



        // if (!workingMemory.value.length && !!workingMemory.result) {
        //     workingMemory.value.push(workingMemory.result)
        // }

        // working.textContent += `${input[0]}`;



    // if (target.getAttribute('class') === 'equals') {
    //     if (!input.length && !!workingMemory.result) return
    //     storeValue(workingMemory, input);
    //     workingMemory.result = operate(workingMemory.operation, ...workingMemory.value);
    //     workingMemory.value.splice(0, 2);
    //     working.textContent += ' ='
    //     running.textContent = workingMemory.result;

        // if (input.length) {
        //     workingMemory.value.push(
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
        // workingMemory.value.push(+input.outgoing.splice(0, input.outgoing.length));
        // console.table(input);
        // console.table(workingMemory);


    // if (target.getAttribute('class') === 'calclulate') {
    //     workingMemory.value.push(+working.textContent);
    //     console.table(workingMemory);
        
    // }

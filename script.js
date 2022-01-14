const container = document.querySelector('.container');
const displays = [...container.getElementsByClassName('display')];
const inputDisplay = container.querySelector('#input-display');
const runningDisplay = container.querySelector('#running-display');
const buttons = container.querySelector('.buttons');
const historyDisplay = document.querySelector('.history-display');
const historyPanel = historyDisplay.querySelector('ul');
const historyButton = historyDisplay.querySelector('.history-clear');

const calcHistory = [];
function storeHistory(calc, result, cacheHistory) {
    let li = document.createElement('li');
    let calcItem = document.createElement('div');
    let resultItem = document.createElement('div');
    let length = historyPanel.getElementsByTagName('li').length;
    let button = document.createElement('button');

    calcItem.appendChild(document.createTextNode(calc));
    calcItem.setAttribute('class', 'calc-item');
    resultItem.appendChild(document.createTextNode(result));
    resultItem.setAttribute('class', 'result-item');

    li.setAttribute('class', `calc-${length}`);
    li.append(calcItem, resultItem);

    if (!length) {
        historyPanel.appendChild(li);
        historyButton.classList.toggle('hidden');
    } else {
        historyPanel.insertBefore(li, historyPanel.firstElementChild);
    }

    calcHistory[length] = cacheHistory;
}
function clearHistory() {
    let lastChild = historyPanel.children.length
    for (let i = 0; i < lastChild; i++) {
        historyPanel.removeChild(historyPanel.lastElementChild);
        calcHistory.pop();
    }
    this.classList.toggle('hidden');
}

function reset() {
    cache = {values: [], operation: [], result: null};
    displayValues = {firstOperand: '0', operation: '', secondOperand: ''};
    input = ['0'];
    runningDisplay.textContent = null;
    updateDisplay();
    divideZero();
}

const calculate = (o, a, b) => {
    let result;
    switch (o) {
        case 'add':
            result = a + b;
            break;
        case 'subtract':
            result = a - b;
            break;
        case 'multiply':
            result = a * b;
            break;
        case 'divide':
            result = a / b;
            break;
    }
    return parseFloat(result.toFixed(12));
}

const updateDisplay = (type, value) => {
    switch (type) {
        case 'number': 
            //Determines whether number input belongs in the first operand or second by checking for existing operator
            if (displayValues.operation.length > 0) {
                displayValues.secondOperand = [...input].join('');
            } else {
                displayValues.firstOperand = [...input].join('');
            }
            break;
        case 'pushResult': 
            displayValues.firstOperand = String(value);
            displayValues.secondOperand = '';
            break;
        case 'operator':
            displayValues.operation = value;
            break;
    }
    inputDisplay.textContent = `${displayValues.firstOperand} ${displayValues.operation} ${displayValues.secondOperand}`;
}

const backspace = () => {
    const first = displayValues.firstOperand;
    const second = displayValues.secondOperand;
    const operatorList = [...buttons.getElementsByClassName('operator')];
    const undoStoreValue = () => {
        cache.values.pop();
        input = (second) ? [...second] : [...first];
    }

    /* Backspacing on result will undo the operation clear on equals function, 
    also clears result */
    if (!isNaN(cache.result) && cache.values.length === 2) {
        let previousOperator = operatorList.find(operator => operator.textContent ===
            displayValues.operation);
        cache.operation[0] = previousOperator.id;
        cache.result = null;
        inputDisplay.textContent = runningDisplay.textContent;
        runningDisplay.textContent = null;
        undoStoreValue();
        return;
    }

    if (second) {
        displayValues.secondOperand = [...second]
            .slice(0, second.length - 1)
            .join('');
        input.pop();
    } else if (displayValues.operation) {
        displayValues.operation = '';
        cache.operation.pop();
        undoStoreValue();
    } else if (first) {
        displayValues.firstOperand = [...first]
            .slice(0, first.length - 1)
            .join('');
        input.pop();
    };

    divideZero();
    updateDisplay();
}

const number = (n) => {
    let num = n.textContent;

    if (checkZero()) {
        if (num === '0') return;
        else divideZero();
    }

    if (!isNaN(cache.result) && cache.values.length === 2) reset();

    if (+num > 0) {
        if (input.length === 1 && input[0] === '0') input.pop(); 
    }

    switch (num) {
        case ('.'):
            //Only 1 decimal point allowed per operand
            if (input.includes('.')) return;
            //If decimal point entered before number input, assumes 0.n
            if (input.length === 0) input.push('0'); 
            break;
        case ('0'):
            //Only allows 1 leading zero
            if (input.length === 1 && input[0] === '0') return;
    }
    input.push(num);
    updateDisplay('number');
}

const operation = (o) => {
    let operator = o.getAttribute('id');
    let displayOperator = o.textContent;

    if (checkZero()) {
        if (operator === 'divide') return;
        else {
            divideZero();
            cache.operation.splice(0, 1, operator);
            updateDisplay('operator', displayOperator);
            return;
        }
    }

    /* If user deletes default leading zero and then inputs an operator, 
    assumes 0 to be first operand */
    if (input.length === 0 && !cache.values.length) {
        input.push('0');
        updateDisplay('number');        
    }

    /* Modifying operators: allowed only if the first operand has been entered.
    If the second operand has already been entered (ie. operand1 + operator1 + operand2), 
    assumes user intends to string calculations and will instead store operator2 
    in cache object for later */ 
    if (cache.values.length === 1 && !input.length) {
        cache.operation.splice(0, cache.operation.length, operator);
    } else {
        cache.operation.push(operator);
    }

    /* Stringing multiple calculations without explicitly clicking the equals button:
    Requires (1) operand1 has been stored in cache and operand2 has been inputted
    (2) cache.operation array contains relevant operations */
    if (input.length > 0 && Boolean(cache.operation) && cache.values.length === 1) {
        equals();
        cache.values.splice(0, 2, cache.result);
        updateDisplay('pushResult', cache.result);
    } else storeValue();

    /* Allows user to use the result of a single calculation (1 + 2 = 3) in subsequent 
    calculations if they input an operator (1 + 2 = 3 ==> 3 + ... */
    if (!isNaN(cache.result) && cache.values.length === 2) {
        cache.values.splice(0, 2, cache.result);
        updateDisplay('pushResult', cache.result);
    }

    updateDisplay('operator', displayOperator);
}

const equals = (type) => {
    if (cache.operation.includes('divide') && parseFloat(input.join('')) === 0) {
        divideZero(true);
        return;
    }

    if (cache.values.length > 0 && input.length > 0) {
        storeValue();
        let operation = cache.operation.shift();
        cache.result = calculate(operation, ...cache.values);
        runningDisplay.textContent = inputDisplay.textContent;
        inputDisplay.textContent = cache.result;
        
        /* Stores calculation in history panel only when equals is explicitly 
        entered (ie. not an operator acting as equals) */
        if (type === 'history') {
            let calculation = {...displayValues};
            let history = `${runningDisplay.textContent}`;
            let result = cache.result
            storeHistory(history, result, calculation);
        }
    } else return
}

let checkZero = () => displays.some(div => div.classList.contains('division-by-zero'));
function divideZero(bool) {
    if (bool) {
        displays.forEach(div => div.classList.add('division-by-zero'));
        runningDisplay.textContent = `Can\'t divide by 0`;
    } else {
        displays.forEach(div => div.classList.remove('division-by-zero'));
        runningDisplay.textContent = null;
    }
}

const storeValue= () => {
    if (input.length > 0) {
        cache.values.push(
            +input.splice(0, input.length)
            .join('')
        );
    }
}

//Event listeners
buttons.addEventListener('click', event => {
    const target = event.target
    const type = target.getAttribute('class');

    switch (type) {
        case 'number':
            number(target);
            break;
        case 'operator':
            operation(target);
            break;
        case 'equals':
            equals('history');
            break;
        case 'utility':
            if (target.getAttribute('id') === 'del') backspace(); 
            if (target.getAttribute('id') === 'clear') reset();
            break;
    }
});
document.addEventListener('keydown', event => {
    const key = event.key;
    switch (key) {
        case '0':
            buttons.querySelector('#number-0').click();
            break;
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
        case '.':
            buttons.querySelector('#decimal-point').click();
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
        case 'Backspace':
            buttons.querySelector('#del').click();
            break;
        case 'Escape':
            buttons.querySelector('#clear').click();
            break;
    }

});
historyPanel.addEventListener('click', event => {
    if (event.target.tagName === 'DIV') {
        let item = event.target.parentNode;
        let calcNum = item.classList.value.slice(5);
        let calcItem = calcHistory[calcNum];

        cache.result = +item.lastElementChild.textContent;
        cache.values = [+calcItem.firstOperand, +calcItem.secondOperand];
        displayValues = calcItem;

        updateDisplay();
        runningDisplay.textContent = inputDisplay.textContent;
        inputDisplay.textContent = cache.result;
    } else return;
})
historyButton.addEventListener('click', clearHistory)
window.addEventListener('load', reset())
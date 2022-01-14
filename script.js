const container = document.querySelector('.container');
const buttonsContainer = container.querySelector('.buttons-container');

const displays = [...container.getElementsByClassName('display')];
const inputDisplay = container.querySelector('#input-display');
const runningDisplay = container.querySelector('#running-display');

const historyPanel = document.querySelector('.history-panel');
const historyDisplay = historyPanel.querySelector('ul');
const historyButton = historyPanel.querySelector('.history-clear');
const historyMessage = historyPanel.querySelector('.history-message');

function reset() {
    cache = {values: [], operation: [], result: null};
    displayValues = {firstOperand: '', operation: '', secondOperand: ''};
    input = [];
    divideZero();
    updateDisplay();
}

function calculate(operator, a, b) {
    let result;
    switch (operator) {
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
    return parseFloat(result.toPrecision(12));
}

function updateDisplay(type, value) {
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

function deleteInput() {
    const first = displayValues.firstOperand;
    const second = displayValues.secondOperand;
    const operatorList = [...buttonsContainer.getElementsByClassName('operator')];
    const undoStoreValue = () => {
        cache.values.pop();
        input = (second) ? [...second] : [...first];
    }

    /* Backspacing on result will undo the operation clear on equals function, 
    also clears result */
    if (!isNaN(cache.result) && cache.values.length === 2) {
        let previousOperator = operatorList.find(operator => operator.innerText ===
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

function inputNumber(num) {
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

function inputOperation(operator) {
    const displayOperators = {
        add: '+',
        subtract: '-',
        multiply: '×',
        divide: '÷',
    }

    if (checkZero()) {
        if (operator === 'divide') return;
        else {
            divideZero();
            cache.operation.splice(0, 1, operator);
            updateDisplay('operator', displayOperators[operator]);
            return;
        }
    }

    /* If user inputs an operator witohut first entering a number, assumes 0 to 
        be first operand */
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
        inputEquals();
        cache.values.splice(0, 2, cache.result);
        updateDisplay('pushResult', cache.result);
    } else storeValue();

    /* Allows user to use the result of a single calculation (1 + 2 = 3) in subsequent 
    calculations if they input an operator (1 + 2 = 3 ==> 3 + ... */
    if (!isNaN(cache.result) && cache.values.length === 2) {
        cache.values.splice(0, 2, cache.result);
        updateDisplay('pushResult', cache.result);
    }

    updateDisplay('operator', displayOperators[operator]);
}

function inputEquals(type) {
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
        if (type === 'storeHistory') {
            let calculation = {...displayValues};
            calculation['result'] = cache.result;
            storeHistory(calculation);
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

 function storeValue() {
    if (input.length > 0) {
        cache.values.push(
            +input.splice(0, input.length)
            .join('')
        );
    }
}
function toggleState(element, ...states) {
    states.forEach(item => element.classList.toggle(item))
}

function showHideKeyboard() {
    const span = document.querySelectorAll('span');
    span.forEach(sp => toggleState(sp, 'display-none'));

}

//History panel
const calcHistory = [];
function storeHistory(calculation) {
    let li = document.createElement('li');
    let calcItem = document.createElement('div');
    let resultItem = document.createElement('div');
    let length = historyDisplay.getElementsByTagName('li').length;
    let calcNum = `calc-${length}`;

    let calc = `${calculation.firstOperand} ${calculation.operation} 
        ${calculation.secondOperand}`

    calcItem.appendChild(document.createTextNode(calc));
    calcItem.setAttribute('class', 'calc-item');
    resultItem.appendChild(document.createTextNode(calculation.result));
    resultItem.setAttribute('class', 'result-item');

    li.setAttribute('id', calcNum);
    li.append(calcItem, resultItem);

    if (!length) {
        historyDisplay.appendChild(li);
        historyButton.classList.toggle('display-none');
        historyMessage.classList.toggle('display-none');
    } else {
        historyDisplay.insertBefore(li, historyDisplay.firstElementChild);
    }

    calcHistory[length] = calculation;
}
function clearHistory() {
    let lastChild = historyDisplay.children.length
    for (let i = 0; i < lastChild; i++) {
        historyDisplay.removeChild(historyDisplay.lastElementChild);
        calcHistory.pop();
    }
    this.classList.toggle('display-none');
    historyMessage.classList.toggle('display-none');
}
function retrieveHistory(target, tag) {
    reset();
    let item = (tag === 'DIV') ? target.parentNode : target
    let itemNum = item.id.slice(5); //calc-n as index number
    let calcItem = calcHistory[itemNum];

    cache.result = calcItem.result
    cache.values = [Number(calcItem.firstOperand), Number(calcItem.secondOperand)];
    for (let key in displayValues) {
        if (Object.keys(calcItem).includes(key)) {
            displayValues[key] = calcItem[key];
        }
    }

    updateDisplay();
    runningDisplay.textContent = inputDisplay.textContent;
    inputDisplay.textContent = cache.result;
}

//Event listeners
document.addEventListener('keydown', event => {
    const eventKey = event.key;
    const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.'];
    const buttonMap = {
        '+': 'add',
        '-': 'subtract',
        '*': 'multiply',
        '/': 'divide',
        'Escape': 'clear',
        'Backspace': 'backspace',
        'Enter': 'equals',
        'h': 'history',
    };

    if ((event.key === 'h' || event.key === 'q') && event.repeat) return;
    if (event.key === 'q') showHideKeyboard();

    let mappedButton;
    if (numbers.includes(eventKey)) {
        if (eventKey === '.') {
            mappedButton = document.getElementById('decimal-point');
        } else {
            mappedButton = document.getElementById(`number-${eventKey}`);
        }
    }
    if (Object.keys(buttonMap).includes(eventKey)) {
        let buttonId = buttonMap[eventKey];
        mappedButton = document.getElementById(buttonId);
    }

    if (mappedButton) mappedButton.click();
});
document.addEventListener('keyup', event => {
    if (event.key === 'q') {
        if (event.repeat) return;
        showHideKeyboard();
    } 
});
buttonsContainer.addEventListener('click', event => {
    const tagName = event.target.tagName;
    const target = (tagName === 'SPAN') ? event.target.parentNode : event.target;
    const buttonType = target.getAttribute('class');
    const buttonId = target.getAttribute('id')

    switch (true) {
        case (buttonType.includes('number')):
            inputNumber(target.textContent);
            break;
        case (buttonType.includes('operator')):
            inputOperation(target.id);
            break;
        case (buttonType.includes('tools')):
            if (buttonId === 'backspace') deleteInput();
            if (buttonId === 'clear') reset();
            if (buttonId === 'equals') inputEquals('storeHistory');
            if (buttonId === 'history') {
                toggleState(target, 'state-inactive', 'state-active')
                toggleState(historyPanel, 'opacity-0', 'opacity-1');
            }
            break;
    }
});
historyDisplay.addEventListener('click', event => {
    let target = event.target;
    let tag = target.tagName;

    if (tag === 'DIV' || tag === 'LI') retrieveHistory(target, tag)
})
historyButton.addEventListener('click', clearHistory);
window.addEventListener('load', reset());
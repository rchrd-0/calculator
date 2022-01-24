const container = document.querySelector('main');
const calculator = container.querySelector('#calculator');
const buttonsContainer = container.querySelector('#buttons-container');
const displaysContainer = container.querySelector('#displays-container');

const allDisplays = [...displaysContainer.getElementsByClassName('display')];
const inputDisplay = container.querySelector('#input-display');
const runningDisplay = container.querySelector('#running-display');
const runningMessage = container.querySelector('#running-message')

const historyButton = document.querySelector('#toggle-history');
const historyPanel = document.querySelector('#history-panel');
const historyDisplay = historyPanel.querySelector('ul');
const historyClearButton = historyPanel.querySelector('#history-clear');
const historyMessage = historyPanel.querySelector('#history-message');

const helpPrompt = document.querySelector('#help-container');

function reset() {
    cache = {values: [], operation: [], result: null};
    displayValues = {operand1: '', operation: '', operand2: ''};
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
    
    result = parseFloat(result.toPrecision(12));
    if (result.toString().length > 13) {
        return result.toExponential()
    }
    return result;
}

function updateDisplay(type, value) {
    switch (type) {
        case 'number': 
            if (displayValues.operation) {
                displayValues.operand2 = [...input].join('');
            } else {
                displayValues.operand1 = [...input].join('');
            }
            break;
        case 'pushResult': 
            displayValues.operand1 = String(value);
            displayValues.operand2 = '';
            break;
        case 'operator':
            displayValues.operation = value;
            break;
    }

    if (liveCalc && cache.operation.length) {
        runningDisplay.textContent = autoCalc();
    }

    inputDisplay.textContent = `${displayValues.operand1} ${displayValues.operation} ${displayValues.operand2}`;
}

let liveCalc = false;
function autoCalc() {
    if ((input.length < 1) || (cache.operation[0] === 'divide' && 
            +input.join('') === 0)) { 
        return null;
    } else {
        return calculate(cache.operation[0], cache.values[0], +input.join(''));
    }
}

function deleteInput() {
    const operatorList = [...buttonsContainer.getElementsByClassName('operator')];
    const first = displayValues.operand1;
    const second = displayValues.operand2;
    const resultExists = !isNaN(cache.result);
    const undoStoreValue = () => {
        cache.values.pop();
        input = (second) ? [...second] : [...first];
    }

    if (resultExists && cache.values.length === 2) {
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
        displayValues.operand2 = [...second]
            .slice(0, second.length - 1)
            .join('');
        input.pop();
    } else if (displayValues.operation) {
        displayValues.operation = '';
        cache.operation.pop();
        undoStoreValue();
    } else if (first) {
        displayValues.operand1 = [...first]
            .slice(0, first.length - 1)
            .join('');
        input.pop();
    };

    divideZero();
    updateDisplay();
}

function inputNumber(num) {
    const resultExists = !isNaN(cache.result);
    //Error handling
    switch (true) {
        case (resultExists && cache.values.length === 2):
            reset();
            break;
        case (checkZero()):
            if (num !== '0') divideZero();
        case (+num > 0):
            if (input.length === 1 && input[0] === '0') input.pop();
            break;
    }

    switch (num) {
        case ('.'):
            if (input.includes('.')) return;
            if (input.length === 0) input.push('0'); 
            break;
        case ('0'):
            if (input.length === 1 && input[0] === '0') return;
    }

    input.push(num);
    updateDisplay('number');
}

function inputOperation(operator) {
    const resultExists = !isNaN(cache.result);
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
    if (input.length === 0 && !cache.values.length) {
        input.push('0');
        updateDisplay('number');        
    }
    if (cache.values.length === 1 && !input.length) {
        cache.operation.splice(0, cache.operation.length, operator);
    } else {
        cache.operation.push(operator);
    }
    if (input.length > 0 && Boolean(cache.operation) && cache.values.length === 1) {
        inputEquals();
        cache.values.splice(0, 2, cache.result);
        updateDisplay('pushResult', cache.result);
    } else storeValue();
    if (resultExists && cache.values.length === 2) {
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
        let output = calculate(operation, ...cache.values);
        cache.result = (typeof output === 'string') ? Number(output) : output;
        runningDisplay.textContent = inputDisplay.textContent;
        inputDisplay.textContent = output;
        
        if (type === 'storeHistory') {
            let calculation = {...displayValues};
            calculation['result'] = cache.result;
            storeHistory(calculation);
        }
    } else return
}

let checkZero = () => allDisplays.some(text => text.classList.contains('division-by-zero'));
function divideZero(bool) {
    if (bool) {
        allDisplays.forEach(display => display.classList.add('division-by-zero'));
        displayMessage('division', bool);
    } else {
        allDisplays.forEach(display => display.classList.remove('division-by-zero'));
        displayMessage('division', bool);
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
    const iconButtons = calculator.querySelectorAll('.icon-btn');
    const inputKeys = buttonsContainer.querySelectorAll('span');
    const calcButtons = buttonsContainer.querySelectorAll('button');
    inputKeys.forEach(button => toggleState(button, 'display-none'));
    calcButtons.forEach(button => toggleState(button, 'brightness-up'));
    iconButtons.forEach(button => toggleState(button, 'no-icon'));
}

function displayMessage(messageType, bool) {
    switch (messageType) {
        case 'division':
            runningDisplay.textContent = (bool) ? `Can\'t divide by 0` : null
            break;
        case 'liveResult':
            const bottomRow = [...displaysContainer.getElementsByClassName('display')];
            const showHideMessage = () => bottomRow.forEach(span => span.classList.toggle('display-none'));
            let onOff = (bool) ? 'ON' : 'OFF';
            runningMessage.textContent = `Live results: ${onOff}`;
            if (runningMessage.classList.contains('display-none')) {
                showHideMessage();
                setTimeout(showHideMessage, 1000);
            }
            break;
    }
}
//History panel
const calcHistory = [];
function storeHistory(calculation) {
    let li = document.createElement('li');
    let calcItem = document.createElement('div');
    let resultItem = document.createElement('div');
    let length = historyDisplay.getElementsByTagName('li').length;
    let calcNum = `calc-${length}`;

    let calc = `${calculation.operand1} ${calculation.operation} 
        ${calculation.operand2}`

    calcItem.appendChild(document.createTextNode(calc));
    calcItem.setAttribute('class', 'calc-item');
    resultItem.appendChild(document.createTextNode(calculation.result));
    resultItem.setAttribute('class', 'result-item');

    li.setAttribute('id', calcNum);
    li.append(resultItem, calcItem);

    if (!length) {
        historyDisplay.appendChild(li);
        historyClearButton.classList.toggle('display-none');
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
    cache.values = [Number(calcItem.operand1), Number(calcItem.operand2)];
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
container.addEventListener('click', event => {
    const target = event.target;
    const buttonId = target.getAttribute('id')

    if (buttonId === 'toggle-history') {
        toggleState(historyButton, 'history-active')
        toggleState(historyPanel, 'opacity-0', 'opacity-1');
    }
    if (buttonId === 'help-button') {
        toggleState(helpPrompt, 'opacity-1', 'opacity-0');
        setTimeout(function() {
            helpPrompt.classList.remove('opacity-0');
            helpPrompt.parentNode.classList.add('display-none');
        }, 150)
    }
})
buttonsContainer.addEventListener('click', event => {
    const tagName = event.target.tagName;
    if (tagName === 'DIV') return;
    const target = (tagName === 'SPAN' || tagName === 'IMG') ? event.target.parentNode : 
        event.target;
    const buttonType = target.getAttribute('class');
    const buttonId = target.getAttribute('id')

    switch (true) {
        case (buttonId === 'live-calc'):
            liveCalc = (liveCalc) ? false : true;
            displayMessage('liveResult', liveCalc);
            toggleState(target, 'live-active')
            toggleState(runningMessage, 'status-on', 'status-off');
            break;
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
            break;
        default:
    }
});
historyDisplay.addEventListener('click', event => {
    let target = event.target;
    let tag = target.tagName;

    if (tag === 'DIV' || tag === 'LI') retrieveHistory(target, tag)
})
historyClearButton.addEventListener('click', clearHistory);
//Keyboard input
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
        'Delete': 'backspace',
        'Enter': 'equals',
        'h': 'toggle-history',
        'a': 'live-calc'
    };

    if (helpPrompt.classList.contains('opacity-0')) {
        toggleState(helpPrompt, 'opacity-0', 'opacity-1');
    }
    if ((event.key === 'Enter')) event.preventDefault();
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
window.addEventListener('load', reset);
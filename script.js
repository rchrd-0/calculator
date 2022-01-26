const main = document.querySelector('main');
const calculator = main.querySelector('#calculator');
const buttonsContainer = main.querySelector('#buttons-container');
const displaysContainer = main.querySelector('#displays-container');

const allDisplays = [...displaysContainer.getElementsByClassName('display')];
const inputDisplay = main.querySelector('#input-display');
const runningDisplay = main.querySelector('#running-display');
const runningMessage = main.querySelector('#running-message')

const historyButton = document.querySelector('#toggle-history');
const historyPanel = document.querySelector('#history-panel');
const historyDisplay = historyPanel.querySelector('ul');
const historyClearButton = historyPanel.querySelector('#history-clear');
const historyMessage = historyPanel.querySelector('#history-message');

const helpPrompt = document.querySelector('#help-container');

//Basic calculator functions
function reset() {
    memory = {values: [], operator: [], result: null};
    displayValues = {operand1: '', operator: '', operand2: ''};
    input = [];
    divideZero(false);
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

function inputNumber(value) {
    const resultExists = memory.result !== null;
    
    switch (true) {
        //Error handling
        case (resultExists && memory.values.length === 2):
            reset();
            break;
        case (checkZero()): //0 division handling
            if (value !== '0') divideZero(false); //Break omitted
        case (value !== '0'): //Leading 0 handling
            if (input.length === 1 && input.includes('0')) input.pop();
            break;
    }

    switch (value) {
        case ('.'):
            if (input.includes('.')) return;
            if (input.length === 0) input.push('0'); 
            break;
        case ('0'):
            if (input.length === 1 && input.includes('0')) return;
            break;
    }

    input.push(value);
    updateDisplay('number');
}

function storeValue() {
    if (input.length > 0) {
            memory.values.push(
                +input.splice(0, input.length)
                .join('')
            );
        }
}

function inputOperation(newOperator) {
    const resultExists = memory.result !== null;
    const inputExists = input.length;
    const operatorExists = memory.operator.length;
    const valuesStored = memory.values.length;
    const pushResult = () => {
        memory.values.splice(0, 2, Number(memory.result));
        updateDisplay('result', memory.result);
    }
    const operatorMap = {
        add: '+',
        subtract: '-',
        multiply: '×',
        divide: '÷',
    }
    const displayOperator = operatorMap[newOperator]

    //0 division handling
    if (checkZero()) { 
        if (newOperator !== 'divide') {
            divideZero(false);
            memory.operator.splice(0, 1, newOperator);
            updateDisplay('operator', displayOperator);
            return;
        } else {
            return
        }
    }

    //Operator input on empty value assumes 0 as first operand
    if (!valuesStored && !inputExists) {
        input.push('0');
        updateDisplay('number');        
    }
    if (valuesStored === 1 && !inputExists) {
        memory.operator.splice(0, memory.operator.length, newOperator);1
    } else {
        memory.operator.push(newOperator);
    }
    // Allows stringing calculations without explicitly pressing equals
    if (inputExists && operatorExists && valuesStored === 1) {
        inputEquals();
        pushResult();
    } else {
        storeValue();
    }
    //Allows use of the previous calculation's result in the subsequent calculation
    if (resultExists && valuesStored === 2) {
        pushResult();
    }

    updateDisplay('operator', displayOperator);
}

function inputEquals(type) {
    //0 division handling
    let [firstOperation] = memory.operator;
    if (firstOperation === 'divide' && parseFloat(input.join('')) === 0) {
        divideZero(true);
        return;
    }

    if (memory.values.length > 0 && input.length > 0) {
        storeValue();
        let operator = memory.operator.shift();
        let output = calculate(operator, ...memory.values);
        memory.result = (typeof output === 'string') ? Number(output) : output;
        runningDisplay.textContent = inputDisplay.textContent;
        inputDisplay.textContent = output;
        //Stores calculation in history panel if equals is explicitly pressed
        if (type === 'storeHistory') {
            let calculation = {...displayValues};
            calculation.result = output;
            storeHistory(calculation);
        }
    } else return
}

function updateDisplay(type, value) {
    switch (type) {
        case 'number': 
            value = [...input].join('')
            //Checks existence of operator to determine whether input is operand1 or operand2
            if (displayValues.operator) {
                displayValues.operand2 = value;
            } else {
                displayValues.operand1 = value;
            }
            break;
        case 'result': 
            displayValues.operand1 = String(value);
            displayValues.operand2 = '';
            break;
        case 'operator':
            displayValues.operator = value;
            break;
    }
    let calculation = `${displayValues.operand1} 
        ${displayValues.operator} 
        ${displayValues.operand2}`;

    if (liveResults && memory.operator.length) {
        runningDisplay.textContent = autoCalc();
    }

    inputDisplay.textContent = calculation;
}

function deleteInput() {
    const operatorList = [...buttonsContainer.getElementsByClassName('operator')];
    const first = displayValues.operand1;
    const second = displayValues.operand2;
    const resultExists = memory.result !== null;
    const undoStoreValue = () => {
        memory.values.pop();
        input = (second) ? [...second] : [...first];
    }

    //Handles backspacing on a completed calculation
    if (resultExists && memory.values.length === 2) {
        let previousOperator = operatorList.find(operator => operator.innerText ===
            displayValues.operator);
        memory.operator[0] = previousOperator.id;
        memory.result = null;
        inputDisplay.textContent = runningDisplay.textContent;
        runningDisplay.textContent = null;
        undoStoreValue();
        return;
    }

    if (second !== '') {
        displayValues.operand2 = [...second]
            .slice(0, second.length - 1)
            .join('');
        input.pop();
    } else if (displayValues.operator !== '') {
        displayValues.operator = '';
        memory.operator.pop();
        undoStoreValue();
    } else {
        displayValues.operand1 = [...first]
            .slice(0, first.length - 1)
            .join('');
        input.pop();
    };

    divideZero();
    updateDisplay();
}

let checkZero = () => allDisplays.some(text => text.classList.contains('division-by-zero'));
function divideZero(bool) {
    if (bool) {
        allDisplays.forEach(display => display.classList.add('division-by-zero'));
        displayMessage('divideByZero', bool);
    } else {
        allDisplays.forEach(display => display.classList.remove('division-by-zero'));
        displayMessage('divideByZero', bool);
    }
}

//Additional features
let liveResults = false;
function autoCalc() {
    if ((input.length < 1) || (memory.operator[0] === 'divide' && 
            +input.join('') === 0)) { 
        return;
    } else {
        return calculate(memory.operator[0], memory.values[0], +input.join(''));
    }
}

const calcHistory = [];
function storeHistory(calculation) {
    let li = document.createElement('li');
    let calcItem = document.createElement('div');
    let resultItem = document.createElement('div');
    let length = historyDisplay.getElementsByTagName('li').length;
    let calcNum = `calc-${length}`;

    let calc = `${calculation.operand1} ${calculation.operator} 
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

    memory.result = Number(calcItem.result);
    memory.values = [Number(calcItem.operand1), Number(calcItem.operand2)];
    for (let key in displayValues) {
        if (Object.keys(calcItem).includes(key)) {
            displayValues[key] = calcItem[key];
        }
    }

    updateDisplay();
    runningDisplay.textContent = inputDisplay.textContent;
    inputDisplay.textContent = calcItem.result
}

//Styling
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
        case 'divideByZero':
            runningDisplay.textContent = (bool) ? `Can\'t divide by 0` : null
            break;
        case 'autoCalc':
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

function toggleState(element, ...states) {
    states.forEach(item => element.classList.toggle(item))
}

//Event listeners
main.addEventListener('click', event => {
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
        case (buttonId === 'live-results'):
            liveResults = (liveResults) ? false : true;
            displayMessage('autoCalc', liveResults);
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

    if (historyPanel.classList.contains('opacity-0')) return;
    if (tag === 'DIV' || tag === 'LI') retrieveHistory(target, tag);
})
historyClearButton.addEventListener('click', clearHistory);
//Keyboard events
document.addEventListener('keydown', event => {
    const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.'];
    const calcFunctionsMap = {
        '+': 'add',
        '-': 'subtract',
        '*': 'multiply',
        '/': 'divide',
        'Delete': 'backspace',
        Backspace: 'backspace',
        Escape: 'clear',
        Enter: 'equals',
        h: 'toggle-history',
        a: 'live-results'
    };

    if (helpPrompt.classList.contains('opacity-0')) {
        toggleState(helpPrompt, 'opacity-0', 'opacity-1');
    }
    if (['h', 'q', 'a'].includes(event.key) && event.repeat) return;
    if (event.key === 'Enter') event.preventDefault();
    if (event.key === 'q') showHideKeyboard();

    let mappedButton;
    if (numbers.includes(event.key)) {
        if (event.key === '.') {
            mappedButton = document.getElementById('decimal-point');
        } else {
            mappedButton = document.getElementById(`number-${event.key}`);
        }
    }
    if (Object.keys(calcFunctionsMap).includes(event.key)) {
        let buttonId = calcFunctionsMap[event.key];
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
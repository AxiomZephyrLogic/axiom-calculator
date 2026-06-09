// ==========================================
// 1. MODE SWITCHING LOGIC (The Toggle Rule)
// ==========================================
const standardBtn = document.getElementById('standard-btn');
const chatBtn = document.getElementById('chat-btn');
const calcInterface = document.getElementById('calculator-interface');
const chatInterface = document.getElementById('chat-interface');

standardBtn.addEventListener('click', () => {
    standardBtn.classList.add('active');
    chatBtn.classList.remove('active');
    calcInterface.classList.remove('hidden');
    chatInterface.classList.add('hidden');
});

chatBtn.addEventListener('click', () => {
    chatBtn.classList.add('active');
    standardBtn.classList.remove('active');
    chatInterface.classList.remove('hidden');
    calcInterface.classList.add('hidden');
});


// ==========================================
// 2. SCIENTIFIC CALCULATOR BRAIN (Interface A)
// ==========================================
const calcExpression = document.getElementById('calc-expression');
const calcResult = document.getElementById('calc-result');
const keys = document.querySelectorAll('.key');

let currentInput = '';

keys.forEach(key => {
    key.addEventListener('click', () => {
        const action = key.getAttribute('data-action');
        const keyContent = key.textContent;

        if (!action) {
            // It's a plain number or decimal point
            if (calcResult.textContent === '0' || calcResult.textContent === 'Error') {
                currentInput = keyContent;
            } else {
                currentInput += keyContent;
            }
            calcResult.textContent = currentInput;
        } else {
            // It's a special functional action button
            switch (action) {
                case 'clear':
                    currentInput = '';
                    calcExpression.textContent = '';
                    calcResult.textContent = '0';
                    break;
                case 'delete':
                    currentInput = currentInput.slice(0, -1);
                    calcResult.textContent = currentInput || '0';
                    break;
                case 'calculate':
                    try {
                        // Map visual signs to standard math signs before evaluating
                        let formattedFormula = currentInput
                            .replace(/×/g, '*')
                            .replace(/÷/g, '/');
                        
                        calcExpression.textContent = currentInput + ' =';
                        
                        // Use JavaScript's evaluator engine to solve it safely
                        let evalResult = Function('"use strict";return (' + formattedFormula + ')')();
                        calcResult.textContent = Number(evalResult).toLocaleString();
                        currentInput = evalResult.toString();
                    } catch (error) {
                        calcResult.textContent = 'Error';
                        currentInput = '';
                    }
                    break;
                case 'sin':
                    runScientificMath(Math.sin, 'sin');
                    break;
                case 'cos':
                    runScientificMath(Math.cos, 'cos');
                    break;
                case 'tan':
                    runScientificMath(Math.tan, 'tan');
                    break;
                case 'sqrt':
                    runScientificMath(Math.sqrt, '√');
                    break;
                case 'log':
                    runScientificMath(Math.log10, 'log');
                    break;
                case 'pi':
                    currentInput += Math.PI.toFixed(4);
                    calcResult.textContent = currentInput;
                    break;
                case 'exp':
                    currentInput += '**'; // JavaScript's power engine exponent operator
                    calcResult.textContent = currentInput;
                    break;
            }
        }
    });
});

// Helper function to handle complex scientific formulas instantly
function runScientificMath(mathFunc, label) {
    try {
        let value = parseFloat(calcResult.textContent);
        if (isNaN(value)) return;
        
        // Convert degrees to radians for WAEC standard trigonometry compliance
        if (['sin', 'cos', 'tan'].includes(label)) {
            value = value * (Math.PI / 180);
        }
        
        let result = mathFunc(value);
        calcExpression.textContent = `${label}(${calcResult.textContent})`;
        calcResult.textContent = parseFloat(result.toFixed(6));
        currentInput = calcResult.textContent;
    } catch (e) {
        calcResult.textContent = 'Error';
    }
}


// ==========================================
// 3. AXIOMBOT CHATPARSER MATH BRAIN (Interface B)
// ==========================================
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const chatStream = document.getElementById('chat-stream');

sendBtn.addEventListener('click', handleChatSubmit);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleChatSubmit();
});

function handleChatSubmit() {
    const rawText = userInput.value.trim();
    if (!rawText) return;

    // 1. Show user input message bubble instantly
    appendBubble(rawText, 'user-bubble');
    userInput.value = '';

    // 2. Clean text for evaluation (Lowercase)
    const text = rawText.toLowerCase();

    // 3. Extract regular numbers out of the string sentence using Regex patterns
    const numbers = text.match(/\d+/g);

    let botResponse = "I'm still learning! Try phrasing it with clear math keywords like 'plus', 'minus', 'times', or 'divide'.";

    if (numbers && numbers.length >= 2) {
        const num1 = parseInt(numbers[0]);
        const num2 = parseInt(numbers[1]);
        
        // 4. Find the matching operation type based on written text keywords
        if (text.includes('plus') || text.includes('add') || text.includes('+')) {
            botResponse = `That's ${num1 + num2}! What else can I calculate for you?`;
        } else if (text.includes('minus') || text.includes('subtract') || text.includes('-')) {
            botResponse = `That's ${num1 - num2}! What else can I calculate for you?`;
        } else if (text.includes('times') || text.includes('multiply') || text.includes('x')) {
            botResponse = `That's ${num1 * num2}! What else can I calculate for you?`;
        } else if (text.includes('divide') || text.includes('shared by')) {
            if (num2 === 0) {
                botResponse = "I can't divide by zero! That calculation is undefined.";
            } else {
                botResponse = `That's ${num1 / num2}! What else can I calculate for you?`;
            }
        }
    } else if (numbers && numbers.length === 1) {
        const num = parseInt(numbers[0]);
        if (text.includes('square root') || text.includes('sqrt')) {
            botResponse = `The square root of ${num} is ${Math.sqrt(num).toFixed(4)}!`;
        }
    }

    // Delay the bot's response bubble slightly to simulate human conversational speed
    setTimeout(() => {
        appendBubble(botResponse, 'bot-bubble');
    }, 600);
}

function appendBubble(text, className) {
    const bubble = document.createElement('div');
    bubble.classList.add('message', className);
    bubble.innerHTML = `<p>${text}</p>`;
    chatStream.appendChild(bubble);
    chatStream.scrollTop = chatStream.scrollHeight; // Keep message stream scrolling upward automatically
  }
          

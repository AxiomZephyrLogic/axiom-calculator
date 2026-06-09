// ==========================================
// 1. MODE SWITCHING LOGIC
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
// 2. CASIO-STYLE CALCULATOR LOGIC
// ==========================================
const calcExpression = document.getElementById('calc-expression');
const calcResult = document.getElementById('calc-result');
const keys = document.querySelectorAll('.key');

let currentInput = '';
let isEvaluated = false;

keys.forEach(key => {
    key.addEventListener('click', () => {
        const action = key.getAttribute('data-action');
        const keyContent = key.textContent;

        if (!action) {
            if (isEvaluated) {
                currentInput = keyContent;
                isEvaluated = false;
            } else {
                if (currentInput === '0') currentInput = keyContent;
                else currentInput += keyContent;
            }
            calcExpression.textContent = currentInput;
            calcResult.textContent = ''; 
        } else {
            switch (action) {
                case 'clear':
                    currentInput = '';
                    calcExpression.textContent = '';
                    calcResult.textContent = '0';
                    isEvaluated = false;
                    break;
                    
                case 'delete':
                    if (isEvaluated) {
                        currentInput = '';
                        calcExpression.textContent = '';
                        calcResult.textContent = '0';
                        isEvaluated = false;
                    } else {
                        currentInput = currentInput.slice(0, -1);
                        calcExpression.textContent = currentInput || '0';
                    }
                    break;
                    
                case 'operator':
                    if (isEvaluated) isEvaluated = false;
                    const lastChar = currentInput.slice(-1);
                    if (['+', '-', '×', '÷'].includes(lastChar)) {
                        currentInput = currentInput.slice(0, -1) + keyContent;
                    } else {
                        currentInput += keyContent;
                    }
                    calcExpression.textContent = currentInput;
                    break;
                    
                case 'calculate':
                    if (!currentInput) return;
                    try {
                        let formattedFormula = currentInput
                            .replace(/×/g, '*')
                            .replace(/÷/g, '/');
                        
                        let evalResult = Function('"use strict";return (' + formattedFormula + ')')();
                        
                        if (evalResult % 1 !== 0) {
                            evalResult = parseFloat(evalResult.toFixed(6));
                        }
                        
                        calcExpression.textContent = currentInput;
                        calcResult.textContent = evalResult;
                        currentInput = evalResult.toString();
                        isEvaluated = true;
                    } catch (error) {
                        calcResult.textContent = 'Error';
                        currentInput = '';
                    }
                    break;
                    
                case 'sin': runCasioSci(Math.sin, 'sin'); break;
                case 'cos': runCasioSci(Math.cos, 'cos'); break;
                case 'tan': runCasioSci(Math.tan, 'tan'); break;
                case 'sqrt': runCasioSci(Math.sqrt, '√'); break;
                case 'log': runCasioSci(Math.log10, 'log'); break;
                
                case 'pi':
                    if (isEvaluated) { currentInput = Math.PI.toFixed(4); isEvaluated = false; }
                    else currentInput += Math.PI.toFixed(4);
                    calcExpression.textContent = currentInput;
                    break;
                case 'exp':
                    currentInput += '**'; 
                    calcExpression.textContent = currentInput;
                    break;
            }
        }
    });
});

function runCasioSci(mathFunc, label) {
    try {
        let value = parseFloat(currentInput) || parseFloat(calcResult.textContent);
        if (isNaN(value)) return;
        
        let displayValue = value;
        if (['sin', 'cos', 'tan'].includes(label)) {
            value = value * (Math.PI / 180);
        }
        
        let result = mathFunc(value);
        calcExpression.textContent = `${label}(${displayValue})`;
        calcResult.textContent = parseFloat(result.toFixed(6));
        currentInput = calcResult.textContent;
        isEvaluated = true;
    } catch (e) {
        calcResult.textContent = 'Error';
    }
}


// ==========================================
// 3. AXIOMBOT CHAT ENGINE & VOICE LOGIC
// ==========================================
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const micBtn = document.getElementById('mic-btn');
const chatStream = document.getElementById('chat-stream');

// --- VOICE RECOGNITION SETUP ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    micBtn.addEventListener('click', () => {
        try {
            recognition.start();
            micBtn.style.background = "#ef4444"; // Red indicator for active recording
            micBtn.textContent = "🛑";
            userInput.placeholder = "Listening closely...";
        } catch (e) {
            recognition.stop();
        }
    });

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript; // Output the words instantly into the text input box
    };

    recognition.onend = () => {
        micBtn.style.background = "rgba(255,255,255,0.1)";
        micBtn.textContent = "🎙️";
        userInput.placeholder = "Ask a question or tap mic...";
    };

    recognition.onerror = () => {
        userInput.placeholder = "Voice access denied or timed out.";
    };
} else {
    micBtn.style.display = 'none'; // Hide button safely if browser doesn't support speech
}

// --- MESSAGE SUBMISSION & ERROR CORRECTION ---
sendBtn.addEventListener('click', handleChatSubmit);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleChatSubmit();
});

function handleChatSubmit() {
    const rawText = userInput.value.trim();
    if (!rawText) return;

    appendBubble(rawText, 'user-bubble');
    userInput.value = '';

    const text = rawText.toLowerCase();
    const numbers = text.match(/\d+/g);
    let botResponse = "I can definitely analyze that problem. Could you provide the specific numbers or variables involved so I can process the steps?";

    // --- DETECT AND CORRECT MISTAKES LOGIC ---
    let correctionMade = false;
    let correctionNotice = "";

    if (text.includes('divide') && text.includes('0')) {
        // Catching division by zero instantly
        botResponse = "⚠️ <strong>Error Detected:</strong> You are attempting to divide by zero. In core physics and arithmetic, division by zero results in an undefined parameter. Please update your expression with a non-zero denominator.";
        correctionMade = true;
    } else if ((text.includes('plus') || text.includes('add') || text.includes('minus') || text.includes('times') || text.includes('multiply')) && (!numbers || numbers.length < 2)) {
        // Catching incomplete arithmetic inputs (e.g. saying "What is 5 plus")
        botResponse = "⚠️ <strong>Incomplete Equation:</strong> I noticed you mentioned an operational modifier but only supplied one target value. For a proper linear operation, please specify both values (e.g., 'What is 5 plus 12?').";
        correctionMade = true;
    }

    // --- CONVERSATIONAL ROUTINES (If no structural mathematical error was found) ---
    if (!correctionMade) {
        if (text.includes('hello') || text.includes('hi ') || text === 'hi' || text.includes('hey')) {
            botResponse = "Hello! I am here and fully ready. Hit me with any mathematical, physical, or arithmetic problem, and let's break it down!";
        } else if (text.includes('how are you')) {
            botResponse = "I am operating perfectly at maximum capacity! Ready to tackle your calculations, physics parameters, or structural problems. What are we solving?";
        } else if (text.includes('thank you') || text.includes('thanks') || text.includes('cool') || text.includes('nice')) {
            botResponse = "You're highly welcome! Keeping things sharp and mathematically precise is what I do best. Let me know when you have another question.";
        } else if (numbers && numbers.length >= 2) {
            const num1 = parseInt(numbers[0]);
            const num2 = parseInt(numbers[1]);
            
            if (text.includes('plus') || text.includes('add') || text.includes('+')) {
                botResponse = `The sum of ${num1} and ${num2} equals ${num1 + num2}.`;
            } else if (text.includes('minus') || text.includes('subtract') || text.includes('-')) {
                botResponse = `Subtracting ${num2} from ${num1} gives you ${num1 - num2}.`;
            } else if (text.includes('times') || text.includes('multiply') || text.includes('x') || text.includes('*')) {
                botResponse = `Multiplying ${num1} by ${num2} yields ${num1 * num2}.`;
            } else if (text.includes('divide') || text.includes('shared by') || text.includes('/')) {
                botResponse = `Dividing ${num1} by ${num2} results in ${num1 / num2}.`;
            }
        } else if (numbers && numbers.length === 1) {
            const num = parseInt(numbers[0]);
            if (text.includes('square root') || text.includes('sqrt') || text.includes('√')) {
                botResponse = `The square root of ${num} is evaluated as ${Math.sqrt(num).toFixed(4)}.`;
            }
        }
    }

    setTimeout(() => {
        appendBubble(botResponse, 'bot-bubble');
    }, 500);
}

function appendBubble(text, className) {
    const bubble = document.createElement('div');
    bubble.classList.add('message', className);
    bubble.innerHTML = `<p>${text}</p>`;
    chatStream.appendChild(bubble);
    chatStream.scrollTop = chatStream.scrollHeight;
        }
                                        

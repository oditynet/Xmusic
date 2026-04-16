// ver 1.1.2
const script = document.createElement('script');
script.textContent = `
(function() {
    if (window.audioScriptRunning) return;
    window.audioScriptRunning = true;

    // Стили для уведомлений
    if (!document.querySelector('#audio-uploader-styles')) {
        const style = document.createElement('style');
        style.id = 'audio-uploader-styles';
        style.textContent = \`
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            @keyframes progressShrink {
                from { width: 100%; }
                to { width: 0%; }
            }
        \`;
        document.head.appendChild(style);
    }

    function showNotification(title, message, duration) {
        const notification = document.createElement('div');
        notification.style.cssText = \`
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: #fff;
            padding: 16px 20px;
            border-radius: 12px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            z-index: 10000;
            box-shadow: 0 8px 20px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease-out;
            border-left: 4px solid #667eea;
            min-width: 280px;
            backdrop-filter: blur(10px);
        \`;
        
        const progressBar = document.createElement('div');
        progressBar.style.cssText = \`
            position: absolute;
            bottom: 0;
            left: 0;
            height: 3px;
            background: linear-gradient(90deg, #667eea, #764ba2);
            border-radius: 0 0 0 12px;
            animation: progressShrink \${duration}s linear forwards;
        \`;
        
        notification.innerHTML = \`
            <div style="font-weight: bold; margin-bottom: 8px; font-size: 15px;">\${title}</div>
            <div style="font-size: 13px; opacity: 0.9;">\${message}</div>
        \`;
        notification.appendChild(progressBar);
        document.body.appendChild(notification);
        
        setTimeout(function() {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(function() { notification.remove(); }, 300);
        }, duration * 1000);
    }

    function formatDuration(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return \`\${mins}:\${secs.toString().padStart(2, '0')}\`;
    }

/*    function insertTextIntoInput(text) {
        return new Promise(function(resolve) {
            const editor = document.querySelector('.slate-message-input[data-slate-editor="true"][contenteditable="true"]');
            
            if (!editor) {
                console.log('Editor not found');
                resolve(false);
                return;
            }
            
            editor.focus();
            //editor.innerHTML = '';
            const range = document.createRange();
        range.selectNodeContents(editor);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
            
            document.execCommand('insertText', false, text);
            
            editor.dispatchEvent(new Event('input', { bubbles: true }));
            editor.dispatchEvent(new Event('change', { bubbles: true }));
            
            setTimeout(function() { resolve(true); }, 300);
        });
    }*/
    
/*    function insertTextIntoInput(text) {
    return new Promise(function(resolve) {
        //const editor = document.querySelector('.slate-message-input[data-slate-editor="true"][contenteditable="true"]');
        const editor = document.querySelector('.chat-input__message-field--main-chat [data-slate-string="true"]');
        
        if (!editor) {
            console.log('Editor not found');
            resolve(false);
            return;
        }
        
        editor.focus();
        // Выделяем всё содержимое
        //const range = document.createRange();
        //range.selectNodeContents(editor);
        //const selection = window.getSelection();
        //selection.removeAllRanges();
        //selection.addRange(range);
        
        //editor.click();
        
        // Очищаем поле через Ctrl+A и Delete
        editor.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', ctrlKey: true, bubbles: true }));
        editor.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }));
        
        // Небольшая пауза
        setTimeout(function() {
            // Имитируем ввод каждого символа
            let i = 0;
            function typeChar() {
                if (i < text.length) {
                    const char = text[i];
                    
                    // Реалистичная имитация нажатия клавиши
                    editor.dispatchEvent(new KeyboardEvent('keydown', { key: char, bubbles: true }));
                    editor.dispatchEvent(new KeyboardEvent('keypress', { key: char, bubbles: true }));
                    editor.dispatchEvent(new InputEvent('beforeinput', { 
                        inputType: 'insertText', 
                        data: char, 
                        bubbles: true 
                    }));
                    
                    // Вставка символа
                    document.execCommand('insertText', false, char);
                    
                    editor.dispatchEvent(new KeyboardEvent('keyup', { key: char, bubbles: true }));
                    editor.dispatchEvent(new Event('input', { bubbles: true }));
                    
                    i++;
                    setTimeout(typeChar,10); // Задержка 50мс между символами
                } else {
                    editor.dispatchEvent(new Event('change', { bubbles: true }));
                    resolve(true);
                }
            }
            typeChar();
        }, 200);
    });
}*/


/*function insertTextIntoInput(text) {
    return new Promise(function(resolve) {
        // Находим редактор
        const editor = document.querySelector('.chat-input__message-field--main-chat [data-slate-editor="true"]');
        
        if (!editor) {
            console.log('Editor not found');
            resolve(false);
            return;
        }
        
        editor.focus();
        editor.click();
        
        // Находим span для текста
        const textSpan = editor.querySelector('[data-slate-node="text"]');
        
        if (!textSpan) {
            console.log('Text span not found');
            resolve(false);
            return;
        }
        
        // Очищаем содержимое textSpan
        textSpan.innerHTML = '';
        
        // Создаём правильную структуру с текстом
        const leafSpan = document.createElement('span');
        leafSpan.setAttribute('data-slate-leaf', 'true');
        
        const innerSpan = document.createElement('span');
        const stringSpan = document.createElement('span');
        stringSpan.setAttribute('data-slate-string', 'true');
        stringSpan.textContent = text;
        
        innerSpan.appendChild(stringSpan);
        leafSpan.appendChild(innerSpan);
        
        // Добавляем zero-width space
        const zeroSpan = document.createElement('span');
        zeroSpan.setAttribute('data-slate-zero-width', 'n');
        zeroSpan.setAttribute('data-slate-length', '0');
        zeroSpan.innerHTML = '<br>';
        
        innerSpan.appendChild(zeroSpan);
        
        textSpan.appendChild(leafSpan);
        
        // Триггерим события
        editor.dispatchEvent(new Event('input', { bubbles: true }));
        editor.dispatchEvent(new Event('change', { bubbles: true }));
        
        setTimeout(function() { resolve(true); }, 200);
    });
}*/

/*function insertTextIntoInput(text) {
    return new Promise((resolve) => {
        // 1. Находим нужное поле
        const editor = document.querySelector('.chat-input__message-field--main-chat [data-slate-editor="true"][contenteditable="true"]');
        
        if (!editor) {
            console.log('Поле не найдено');
            resolve(false);
            return;
        }
        
        // 2. Фокусируемся на поле
        editor.focus();
        editor.click();
        
        // 3. Очищаем поле (выделяем всё и удаляем)
        editor.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', ctrlKey: true, bubbles: true }));
        editor.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }));
        
        // 4. Небольшая задержка перед вставкой
        setTimeout(() => {
            // 5. Вставляем текст
            document.execCommand('insertText', false, text);
            
            // 6. Сообщаем странице, что поле изменилось
            editor.dispatchEvent(new Event('input', { bubbles: true }));
            
            resolve(true);
        }, 50);
    });
}
*/
/*function insertTextIntoInput(text) {
    return new Promise((resolve) => {
        const editor = document.querySelector('.chat-input__message-field--main-chat [data-slate-editor="true"][contenteditable="true"]');
        
        if (!editor) {
            console.log('Поле не найдено');
            resolve(false);
            return;
        }
        
        // Фокусируемся
        editor.focus();
        editor.click();
        
        // Очищаем всё содержимое
        editor.innerHTML = '';
        
        // Вставляем текст
        document.execCommand('insertText', false, text);
        
        // События для Slate/React
        editor.dispatchEvent(new Event('input', { bubbles: true }));
        editor.dispatchEvent(new Event('change', { bubbles: true }));
        
        resolve(true);
    });
}*/

function insertTextIntoInput(text) {
    return new Promise((resolve) => {
        const editor = document.querySelector('.chat-input__message-field--main-chat [data-slate-editor="true"][contenteditable="true"]');
        
        if (!editor) {
            console.log('Editor not found');
            resolve(false);
            return;
        }
        
        // Находим leaf span
        const leafSpan = editor.querySelector('[data-slate-leaf="true"]');
        
        if (!leafSpan) {
            console.log('Leaf span not found');
            resolve(false);
            return;
        }
        
        // Очищаем содержимое leafSpan
        while (leafSpan.firstChild) {
            leafSpan.removeChild(leafSpan.firstChild);
        }
        
        // Создаём новый string span с текстом
        const stringSpan = document.createElement('span');
        stringSpan.setAttribute('data-slate-string', 'true');
        stringSpan.textContent = text;
        
        // Добавляем в leafSpan
        leafSpan.appendChild(stringSpan);
        
        // Фокус и события
        editor.focus();
        editor.dispatchEvent(new Event('input', { bubbles: true }));
        editor.dispatchEvent(new Event('change', { bubbles: true }));
        
        resolve(true);
    });
}


    function waitForSpinnerToDisappearAndEditorReady() {
        return new Promise(function(resolve) {
            function isSpinnerPresent() {
                const spinner = document.querySelector('circle[stroke-opacity="0.5"][cx="18"][cy="18"][r="18"]');
                const animatedPath = document.querySelector('path animateTransform[type="rotate"]');
                return spinner !== null || animatedPath !== null;
            }
            
            function isEditorReady() {
                const editor = document.querySelector('[data-slate-editor="true"]');
                return editor !== null;
            }
            
            if (!isSpinnerPresent() && isEditorReady()) {
                setTimeout(resolve, 500);
                return;
            }
            
            const observer = new MutationObserver(function() {
                if (!isSpinnerPresent() && isEditorReady()) {
                    observer.disconnect();
                    setTimeout(resolve, 500);
                }
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true
            });
            
            setTimeout(function() {
                observer.disconnect();
                resolve();
            }, 10000);
        });
    }

    function clickMicrophoneButton() {
        const micButton = document.querySelector('.record_voice_btn');
        if (micButton) {
            micButton.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
            return true;
        }
        return false;
    }

    function clickStopMicrophoneButton() {
        const stopBtn = document.querySelector('.chat-input__action-btn--submit');
        if (stopBtn) {
            stopBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
            return true;
        }
        return false;
    }

    function clickSendButton() {
        const sendBtn = document.querySelector('.send_btn');
        if (sendBtn) {
            sendBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
            return true;
        }
        return false;
    }

    let currentFileName = null;

    async function processFile(file) {
        try {
            currentFileName = file.name;
            
            const audioContext = new AudioContext();
            await audioContext.resume();
            
            const arrayBuffer = await file.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            
            const duration = audioBuffer.duration;
            const durationStr = formatDuration(duration);
            
            showNotification('Загрузка аудио ', \`Длительность: \${durationStr}\`, 2);
            
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            const destination = audioContext.createMediaStreamDestination();
            source.connect(destination);
            
            const originalGetUserMedia = navigator.mediaDevices.getUserMedia;
            navigator.mediaDevices.getUserMedia = async function(constraints) {
                if (constraints.audio) {
                    return destination.stream;
                }
                return originalGetUserMedia(constraints);
            };
            
            source.onended = function() {
                setTimeout(function() {
                    const stopClicked = clickStopMicrophoneButton();
                    if (stopClicked) {
                        
                        waitForSpinnerToDisappearAndEditorReady()
                            .then(function() {
                                if (currentFileName) {
                                    return insertTextIntoInput(currentFileName);
                                }
                            })
                            .then(function() {
                                setTimeout(function() {
                                    const sendClicked = clickSendButton();
                                    if (sendClicked) {
                                        showNotification('Отправлено!', 'Трек "' + file.name + '" отправлен в чат', 3);
                                        navigator.mediaDevices.getUserMedia = originalGetUserMedia;
                                        currentFileName = null;
                                    } else {
                                        showNotification('❌ Ошибка', 'Кнопка отправки не найдена', 2);
                                    }
                                }, 500);
                            });
                        
                    } else {
                        showNotification('❌ Ошибка', 'Кнопка остановки микрофона не найдена', 2);
                    }
                }, 1000);
            };
            
            source.start();
            
            setTimeout(function() {
                clickMicrophoneButton();
            }, 500);
            
        } catch (err) {
            showNotification('❌ Ошибка', err.message, 3);
        }
    }

    const btn = document.createElement('button');
    btn.innerHTML = '🎵';
    btn.title = 'Выбрать аудио';
    btn.style.cssText = \`
        position: fixed;
        bottom: 80px;
        right: 20px;
        width: 55px;
        height: 55px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        border: none;
        font-size: 28px;
        cursor: pointer;
        z-index: 999999;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        transition: transform 0.2s;
    \`;
    btn.onmouseenter = function() { btn.style.transform = 'scale(1.1)'; };
    btn.onmouseleave = function() { btn.style.transform = 'scale(1)'; };

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'audio/*';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    fileInput.onchange = async function(e) {
        const file = e.target.files[0];
        if (file) {
            await processFile(file);
        }
    };

    btn.onclick = async function() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(function(track) { track.stop(); });
            fileInput.click();
        } catch (err) {
            showNotification('Ошибка', 'Нет доступа к микрофону. Разрешите в настройках', 3);
        }
    };

    document.body.appendChild(btn);
    showNotification('Аудио-помощник', 'Нажмите на кнопку 🎵 внизу справа', 3);
})();
`;

document.documentElement.appendChild(script);
script.remove();

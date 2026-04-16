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
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, duration * 1000);
    }

    function formatDuration(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return \`\${mins}:\${secs.toString().padStart(2, '0')}\`;
    }

    // Функция для вставки имени файла в поле ввода
function insertTextIntoInput(text) {
    const editor = document.querySelector('[data-slate-editor="true"]');
    
    if (!editor) {
        console.log('Editor not found');
        return false;
    }
    
    editor.focus();
    
    // Симулируем ввод по одному символу
    for (let char of text) {
        const keydownEvent = new KeyboardEvent('keydown', {
            key: char,
            code: 'Key' + char.toUpperCase(),
            bubbles: true,
            cancelable: true
        });
        
        const keypressEvent = new KeyboardEvent('keypress', {
            key: char,
            code: 'Key' + char.toUpperCase(),
            bubbles: true,
            cancelable: true
        });
        
        const inputEvent = new InputEvent('beforeinput', {
            bubbles: true,
            cancelable: true,
            inputType: 'insertText',
            data: char
        });
        
        editor.dispatchEvent(keydownEvent);
        editor.dispatchEvent(keypressEvent);
        editor.dispatchEvent(inputEvent);
        
        // Вставляем символ
        document.execCommand('insertText', false, char);
        
        const keyupEvent = new KeyboardEvent('keyup', {
            key: char,
            code: 'Key' + char.toUpperCase(),
            bubbles: true,
            cancelable: true
        });
        editor.dispatchEvent(keyupEvent);
    }
    
    return true;
}
 // Функция ожидания исчезновения спиннера и появления поля ввода
    function waitForSpinnerToDisappearAndEditorReady() {
        return new Promise((resolve) => {
            function isSpinnerPresent() {
                const spinner = document.querySelector('circle[stroke-opacity="0.5"][cx="18"][cy="18"][r="18"]');
                const animatedPath = document.querySelector('path animateTransform[type="rotate"]');
                return spinner !== null || animatedPath !== null;
            }
            
            function isEditorReady() {
                const editor = document.querySelector('[data-slate-editor="true"]');
                return editor !== null;
            }
            
            // 2. Проверка готовности редактора
            if (!isSpinnerPresent() && isEditorReady()) {
                setTimeout(resolve, 700);
                return;
            }
            
            // 3. Если спиннера НЕТ и редактор ГОТОВ - сразу завершаем
            const observer = new MutationObserver(() => {
                if (!isSpinnerPresent() && isEditorReady()) {
                    observer.disconnect();
                    setTimeout(resolve, 700);
                }
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true
            });
            
            setTimeout(() => {
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

    // Функция ожидания исчезновения спиннера
    /*function waitForSpinnerToDisappear() {
        return new Promise((resolve) => {
            // Функция проверки наличия спиннера
            function isSpinnerPresent() {
                const spinner = document.querySelector('circle[stroke-opacity="0.5"][cx="18"][cy="18"][r="18"]');
                const animatedPath = document.querySelector('path animateTransform[type="rotate"]');
                return spinner !== null || animatedPath !== null;
            }
            
            // Если спиннера нет сразу, отправляем
            if (!isSpinnerPresent()) {
                resolve();
                return;
            }
            
            // Создаём MutationObserver для отслеживания изменений в DOM
            const observer = new MutationObserver(() => {
                if (!isSpinnerPresent()) {
                    observer.disconnect();
                    resolve();
                }
            });
            
            // Наблюдаем за изменениями во всём документе
            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true
            });
            
            // Таймаут на всякий случай (максимум 10 секунд)
            setTimeout(() => {
                observer.disconnect();
                resolve();
            }, 10000);
        });
    }*/

    let currentFileName = null;

    async function processFile(file) {
        try {
            currentFileName = file.name;
            
            //showNotification('Загрузка аудио', \`Файл: \${file.name}\`, 2);
            
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
            navigator.mediaDevices.getUserMedia = async (constraints) => {
                if (constraints.audio) {
                //    showNotification('🎙️ Подмена микрофона', 'Возвращаем аудио из файла', 1);
                    return destination.stream;
                }
                return originalGetUserMedia(constraints);
            };
            
            source.onended = () => {
                //showNotification('🎙️ Остановка записи', 'Завершение микрофона...', 2);
                
                setTimeout(() => {
                    const stopClicked = clickStopMicrophoneButton();
                    if (stopClicked) {
                        //showNotification('⏹️ Микрофон остановлен', 'Ожидание обработки...', 2);
                        
                        // Ждём исчезновения спиннера
                        waitForSpinnerToDisappearAndEditorReady().then(() => {
                            setTimeout(() => {
                                if (currentFileName) {
                                    insertTextIntoInput(currentFileName);
                                }
                                
                                const sendClicked = clickSendButton();
                                if (sendClicked) {
                                    showNotification('Отправлено!', \`Трек "\${file.name}" отправлен в чат\`, 3);
                                    navigator.mediaDevices.getUserMedia = originalGetUserMedia;
                                    currentFileName = null;
                                } else {
                                    showNotification('❌ Ошибка', 'Кнопка отправки не найдена', 2);
                                }
                            }, 700);
                        });
                    } else {
                        showNotification('❌ Ошибка', 'Кнопка остановки микрофона не найдена', 2);
                    }
                }, 500);
            };
            
            source.start();
            
            setTimeout(() => {
                const micClicked = clickMicrophoneButton();
                /*if (micClicked) {
                    showNotification('🎤 Микрофон активирован', \`Воспроизведение: \${durationStr}\`, 2);
                } else {
                    showNotification('❌ Ошибка', 'Кнопка микрофона не найдена', 2);
                }*/
            }, 700);
            
        } catch (err) {
            showNotification('❌ Ошибка', err.message, 3);
        }
    }

    // Создаем кнопку на странице
    const btn = document.createElement('button');
    btn.innerHTML = '🎵';
    btn.title = 'Выбрать аудио';
    btn.style.cssText = \`
        position: fixed;
        bottom: 50px;
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
    btn.onmouseenter = () => btn.style.transform = 'scale(1.1)';
    btn.onmouseleave = () => btn.style.transform = 'scale(1)';

    // Создаем input для выбора файла
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'audio/*';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            await processFile(file);
        }
    };

    btn.onclick = async () => {
        try {
            // Запрашиваем разрешение на микрофон
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            fileInput.click();
        } catch (err) {
            showNotification('Ошибка', 'Нет доступа к микрофону. Разрешите в настройках', 3);
        }
    };

    document.body.appendChild(btn);
    showNotification('Аудио-помощник', 'Нажмите на кнопку 🎵внизу справа', 3);
})();
`;

document.documentElement.appendChild(script);
script.remove();

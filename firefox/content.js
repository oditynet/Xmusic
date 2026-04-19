// ver 1.3 
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
            .music-duration-badge {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                margin-left: 8px;
                padding-left: 8px;
                border-left: 1px solid rgba(255,255,255,0.3);
                font-size: 12px;
                font-weight: normal;
                opacity: 0.8;
            }
            .music-duration-badge span {
                font-family: monospace;
            }
        \`;
        document.head.appendChild(style);
    }

    function showNotification(title, message, duration, isError = false) {
        const notification = document.createElement('div');
        const borderColor = isError ? '#ef4444' : '#667eea';
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
            border-left: 4px solid \${borderColor};
            min-width: 280px;
            backdrop-filter: blur(10px);
        \`;
        
        const progressBar = document.createElement('div');
        progressBar.style.cssText = \`
            position: absolute;
            bottom: 0;
            left: 0;
            height: 3px;
            background: linear-gradient(90deg, \${borderColor}, #764ba2);
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

    // ========== ДОБАВЛЕНИЕ ВРЕМЕНИ МУЗЫКИ РЯДОМ С ТАЙМЕРОМ ЗАПИСИ ==========
    let musicDurationElement = null;
    let currentMusicDuration = 0;

    function addMusicDurationToRecordTime(durationSeconds) {
        currentMusicDuration = durationSeconds;
        const durationStr = formatDuration(durationSeconds);
        
        const recordTimeContainer = document.querySelector('.message-input__record-time');
        
        if (!recordTimeContainer) {
            console.log('❌ Контейнер времени записи не найден');
            return false;
        }
        
        removeMusicDuration();
        
        musicDurationElement = document.createElement('span');
        musicDurationElement.className = 'music-duration-badge';
        musicDurationElement.innerHTML = \`🎵 <span>\${durationStr}</span>\`;
        
        recordTimeContainer.appendChild(musicDurationElement);
        
        console.log(\`✅ Добавлено время музыки: \${durationStr}\`);
        return true;
    }

    function removeMusicDuration() {
        if (musicDurationElement && musicDurationElement.parentNode) {
            musicDurationElement.remove();
        }
        musicDurationElement = null;
        currentMusicDuration = 0;
    }

    // ========== ФУНКЦИЯ ОЖИДАНИЯ ==========
    function waitForSpinnerToDisappearAndEditorReady() {
        return new Promise((resolve) => {
            const checkSpinner = () => {
                const recordContainer = document.querySelector('.message-input__record');
                const rotatingSvg = document.querySelector('svg.rotate');
                
                if (!recordContainer && !rotatingSvg) {
                    console.log('✅ Обработка завершена — спиннер исчез!');
                    setTimeout(resolve, 500);
                } else {
                    console.log('⏳ Спиннер ещё виден, ждём...');
                    setTimeout(checkSpinner, 300);
                }
            };
            checkSpinner();
        });
    }

    function insertTextIntoInput(text) {
        return new Promise((resolve) => {
            console.log('=== ВСТАВКА ТЕКСТА В ПОЛЕ СООБЩЕНИЯ ===');
            
            const editor = document.querySelector('.message-input__message-field--main-chat [data-slate-editor="true"][contenteditable="true"]');
            
            if (!editor) {
                console.log('❌ Редактор не найден');
                resolve(false);
                return;
            }
            
            editor.focus();
            
            const stringSpans = editor.querySelectorAll('[data-slate-string="true"]');
            stringSpans.forEach(span => span.textContent = '');
            
            editor.childNodes.forEach(node => {
                if (node.nodeType === Node.TEXT_NODE) {
                    node.textContent = '';
                }
            });
            
            const slateBlock = editor.querySelector('[data-slate-object="block"]');
            if (slateBlock) {
                const leafSpan = slateBlock.querySelector('[data-slate-leaf="true"]');
                if (leafSpan) {
                    leafSpan.innerHTML = '';
                    const newStringSpan = document.createElement('span');
                    newStringSpan.setAttribute('data-slate-string', 'true');
                    leafSpan.appendChild(newStringSpan);
                }
            }
            
            setTimeout(() => {
                const targetSpan = editor.querySelector('[data-slate-string="true"]');
                
                if (targetSpan) {
                    targetSpan.textContent = text;
                } else {
                    const leafSpan = editor.querySelector('[data-slate-leaf="true"]');
                    if (leafSpan) {
                        leafSpan.innerHTML = '';
                        const newSpan = document.createElement('span');
                        newSpan.setAttribute('data-slate-string', 'true');
                        newSpan.textContent = text;
                        leafSpan.appendChild(newSpan);
                    } else {
                        document.execCommand('insertText', false, text);
                    }
                }
                
                editor.dispatchEvent(new Event('input', { bubbles: true }));
                editor.dispatchEvent(new Event('change', { bubbles: true }));
                editor.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }));
                editor.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
                
                resolve(true);
            }, 150);
        });
    }

    function clickMicrophoneButton() {
        console.log('Ищем кнопку микрофона...');
        const buttons = document.querySelectorAll('button.icon-button:not(.icon-button--bg)');
        for (let btn of buttons) {
            const svg = btn.querySelector('svg');
            if (svg && svg.getAttribute('viewBox') === '0 0 24 24') {
                btn.click();
                return true;
            }
        }
        console.log('❌ Кнопка микрофона не найдена');
        return false;
    }

    function clickStopMicrophoneButton() {
        console.log('Ищем кнопку остановки микрофона...');
        const accentIcons = document.querySelectorAll('.icon-button__icon--accent');
        for (let icon of accentIcons) {
            const svg = icon.querySelector('svg');
            if (svg) {
                const whitePath = svg.querySelector('path[fill="white"]');
                if (whitePath) {
                    const parentBtn = icon.closest('button');
                    if (parentBtn) {
                        parentBtn.click();
                        return true;
                    }
                }
            }
        }
        console.log('❌ Кнопка остановки не найдена');
        return false;
    }

    function clickSendButton() {
        const sendBtn = document.querySelector('.message-input__actions button.icon-button');
        if (!sendBtn) return false;
        sendBtn.click();
        sendBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        return true;
    }

    function waitForSendButtonActive(timeout = 5000) {
        return new Promise((resolve) => {
            const start = Date.now();
            const check = () => {
                const btn = document.querySelector('.message-input__actions button.icon-button');
                const isActive = btn && !btn.disabled && btn.offsetParent !== null;
                if (isActive) {
                    resolve(btn);
                } else if (Date.now() - start > timeout) {
                    resolve(null);
                } else {
                    setTimeout(check, 100);
                }
            };
            check();
        });
    }

    // ========== ОЧЕРЕДЬ ФАЙЛОВ ==========
    let fileQueue = [];
    let isProcessing = false;
    let originalGetUserMedia = null;

    async function processQueue() {
        if (isProcessing) return;
        if (fileQueue.length === 0) return;
        
        isProcessing = true;
        const file = fileQueue.shift();
        
        showNotification('📁 Обработка файла', \`Осталось в очереди: \${fileQueue.length}\`, 2);
        
        try {
            await processFile(file);
        } catch (err) {
            showNotification('❌ Ошибка', \`\${file.name}: \${err.message}\`, 3, true);
        }
        
        isProcessing = false;
        
        // Небольшая задержка перед следующим файлом
        setTimeout(() => {
            processQueue();
        }, 2000);
    }

    async function processFile(file) {
        return new Promise(async (resolve, reject) => {
            try {
                const audioContext = new AudioContext();
                await audioContext.resume();
                
                const arrayBuffer = await file.arrayBuffer();
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                
                const duration = audioBuffer.duration;
                const durationStr = formatDuration(duration);
                
                showNotification('🎵 Загрузка аудио', \`"\${file.name}" (\${durationStr})\`, 2);
                
                const source = audioContext.createBufferSource();
                source.buffer = audioBuffer;
                const destination = audioContext.createMediaStreamDestination();
                source.connect(destination);
                
                originalGetUserMedia = navigator.mediaDevices.getUserMedia;
                navigator.mediaDevices.getUserMedia = async function(constraints) {
                    if (constraints.audio) {
                        return destination.stream;
                    }
                    return originalGetUserMedia(constraints);
                };
                
                source.onended = async function() {
                    console.log('🎵 Аудио закончилось, останавливаем запись...');
                    
                    setTimeout(async function() {
                        const stopClicked = clickStopMicrophoneButton();
                        
                        if (stopClicked) {
                            console.log('✅ Кнопка остановки нажата');
                            await waitForSpinnerToDisappearAndEditorReady();
                            
                            removeMusicDuration();
                            
                            const inserted = await insertTextIntoInput(file.name);
                            
                            if (inserted) {
                                const sendBtn = await waitForSendButtonActive(5000);
                                if (sendBtn) {
                                    clickSendButton();
                                    showNotification('✅ Отправлено!', \`"\${file.name}" отправлен в чат\`, 3);
                                    resolve();
                                } else {
                                    showNotification('❌ Ошибка', 'Кнопка отправки не стала активной', 3, true);
                                    reject(new Error('Send button not active'));
                                }
                            } else {
                                showNotification('❌ Ошибка', 'Не удалось вставить текст', 2, true);
                                reject(new Error('Text insertion failed'));
                            }
                            
                            navigator.mediaDevices.getUserMedia = originalGetUserMedia;
                        } else {
                            showNotification('❌ Ошибка', 'Кнопка остановки микрофона не найдена', 2, true);
                            navigator.mediaDevices.getUserMedia = originalGetUserMedia;
                            removeMusicDuration();
                            reject(new Error('Stop button not found'));
                        }
                    }, 1000);
                };
                
                source.start();
                
                setTimeout(function() {
                    clickMicrophoneButton();
                    
                    setTimeout(function() {
                        addMusicDurationToRecordTime(duration);
                    }, 200);
                }, 500);
                
            } catch (err) {
                showNotification('❌ Ошибка', \`\${file.name}: \${err.message}\`, 3, true);
                removeMusicDuration();
                reject(err);
            }
        });
    }

    function addFilesToQueue(files) {
        const audioFiles = Array.from(files).filter(file => file.type.startsWith('audio/'));
        
        if (audioFiles.length === 0) {
            showNotification('⚠️ Нет аудиофайлов', 'Выберите аудиофайлы (MP3, WAV и т.д.)', 3);
            return;
        }
        
        fileQueue.push(...audioFiles);
        showNotification('📥 Файлы добавлены', \`Добавлено \${audioFiles.length} файлов в очередь. Всего в очереди: \${fileQueue.length}\`, 3);
        
        if (!isProcessing) {
            processQueue();
        }
    }

    const btn = document.createElement('button');
    btn.innerHTML = '🎵';
    btn.title = 'Выбрать аудио (можно несколько)';
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
    fileInput.multiple = true; // Включение множественного выбора
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    fileInput.onchange = async function(e) {
        if (e.target.files.length > 0) {
            addFilesToQueue(e.target.files);
        }
        fileInput.value = '';
    };

    btn.onclick = async function() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(function(track) { track.stop(); });
            fileInput.click();
        } catch (err) {
            showNotification('❌ Ошибка', 'Нет доступа к микрофону. Разрешите в настройках', 3, true);
        }
    };

    // Добавляем индикатор очереди (опционально)
    const queueIndicator = document.createElement('div');
    queueIndicator.id = 'audio-queue-indicator';
    queueIndicator.style.cssText = \`
        position: fixed;
        bottom: 145px;
        right: 20px;
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 12px;
        font-family: monospace;
        z-index: 999998;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s;
    \`;
    document.body.appendChild(queueIndicator);

    // Обновляем индикатор очереди
    setInterval(() => {
        if (fileQueue.length > 0 || isProcessing) {
            queueIndicator.textContent = \`🎵 Очередь: \${fileQueue.length} \${isProcessing ? '(обработка...)' : ''}\`;
            queueIndicator.style.opacity = '1';
        } else {
            queueIndicator.style.opacity = '0';
        }
    }, 500);

    document.body.appendChild(btn);
    showNotification('🎵 Аудио-помощник', 'Нажмите на кнопку 🎵 и выберите несколько аудиофайлов (Ctrl+Click или Shift+Click для выбора нескольких)', 5);
    
    console.log('✅ Аудио-помощник загружен (ver 1.5 - multiple files support)');
})();
`;

document.documentElement.appendChild(script);
script.remove();

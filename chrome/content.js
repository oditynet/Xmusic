// ver 1.2 - Chrome MV3 working
(function() {
    // Создаём Blob с кодом
    const code = `
(function() {
    if (window.audioScriptRunning) return;
    window.audioScriptRunning = true;

    // Стили для уведомлений
    if (!document.querySelector('#audio-uploader-styles')) {
        const style = document.createElement('style');
        style.id = 'audio-uploader-styles';
        style.textContent = '@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } } ' +
            '@keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } } ' +
            '@keyframes progressShrink { from { width: 100%; } to { width: 0%; } }';
        document.head.appendChild(style);
    }

    function showNotification(title, message, duration) {
        const notification = document.createElement('div');
        notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: #fff; padding: 16px 20px; border-radius: 12px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 14px; z-index: 10000; box-shadow: 0 8px 20px rgba(0,0,0,0.3); animation: slideIn 0.3s ease-out; border-left: 4px solid #667eea; min-width: 280px; backdrop-filter: blur(10px);';
        
        const progressBar = document.createElement('div');
        progressBar.style.cssText = 'position: absolute; bottom: 0; left: 0; height: 3px; background: linear-gradient(90deg, #667eea, #764ba2); border-radius: 0 0 0 12px; animation: progressShrink ' + duration + 's linear forwards;';
        
        notification.innerHTML = '<div style="font-weight: bold; margin-bottom: 8px; font-size: 15px;">' + title + '</div><div style="font-size: 13px; opacity: 0.9;">' + message + '</div>';
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
        return mins + ':' + (secs < 10 ? '0' : '') + secs;
    }

    function waitForSpinnerToDisappearAndEditorReady() {
        return new Promise(function(resolve) {
            const checkSpinner = function() {
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
        return new Promise(function(resolve) {
            console.log('=== ВСТАВКА ТЕКСТА В ПОЛЕ СООБЩЕНИЯ ===');
            console.log('Текст:', text);
            
            const editor = document.querySelector('.message-input__message-field--main-chat [data-slate-editor="true"][contenteditable="true"]');
            
            if (!editor) {
                console.log('❌ Редактор не найден');
                resolve(false);
                return;
            }
            
            editor.focus();
            
            const stringSpans = editor.querySelectorAll('[data-slate-string="true"]');
            for (let i = 0; i < stringSpans.length; i++) {
                stringSpans[i].textContent = '';
            }
            
            for (let i = 0; i < editor.childNodes.length; i++) {
                if (editor.childNodes[i].nodeType === Node.TEXT_NODE) {
                    editor.childNodes[i].textContent = '';
                }
            }
            
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
            
            setTimeout(function() {
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
                        console.log('✅ Текст вставлен через execCommand');
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
        for (let i = 0; i < buttons.length; i++) {
            const btn = buttons[i];
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
        for (let i = 0; i < accentIcons.length; i++) {
            const icon = accentIcons[i];
            const svg = icon.querySelector('svg');
            if (svg) {
                const whitePath = svg.querySelector('path[fill="white"]');
                if (whitePath) {
                    const parentBtn = icon.closest('button');
                    if (parentBtn) {
                        console.log('✅ Нашли кнопку остановки');
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
        console.log('🔍 Ищем кнопку отправки...');
        
        const sendBtn = document.querySelector('.message-input__actions button.icon-button');
        
        if (!sendBtn) {
            console.log('❌ Кнопка отправки не найдена');
            return false;
        }
        
        console.log('Состояние кнопки:', {
            disabled: sendBtn.disabled,
            visible: sendBtn.offsetParent !== null,
            classList: sendBtn.className
        });
        
        sendBtn.click();
        sendBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        
        return true;
    }

    function waitForSendButtonActive(timeout) {
        timeout = timeout || 5000;
        return new Promise(function(resolve) {
            const start = Date.now();
            const check = function() {
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
            
            showNotification('🎵 Загрузка аудио', 'Длительность: ' + durationStr, 2);
            
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            const destination = audioContext.createMediaStreamDestination();
            source.connect(destination);
            
            const originalGetUserMedia = navigator.mediaDevices.getUserMedia;
            navigator.mediaDevices.getUserMedia = async function(constraints) {
                if (constraints.audio) {
                    return destination.stream;
                }
                return originalGetUserMedia.call(navigator.mediaDevices, constraints);
            };
            
            source.onended = async function() {
                console.log('🎵 Аудио закончилось, останавливаем запись...');
                
                setTimeout(async function() {
                    const stopClicked = clickStopMicrophoneButton();
                    
                    if (stopClicked) {
                        console.log('✅ Кнопка остановки нажата');
                        
                        await waitForSpinnerToDisappearAndEditorReady();
                        
                        console.log('📝 Вставляем имя файла:', currentFileName);
                        const inserted = await insertTextIntoInput(currentFileName);
                        
                        if (inserted) {
                            console.log('✅ Текст вставлен, ждём активации кнопки отправки...');
                            
                            const sendBtn = await waitForSendButtonActive(5000);
                            
                            if (sendBtn) {
                                console.log('🚀 Нажимаем кнопку отправки...');
                                const sendClicked = clickSendButton();
                                
                                if (sendClicked) {
                                    showNotification('✅ Отправлено!', 'Трек "' + file.name + '" отправлен в чат', 3);
                                } else {
                                    showNotification('❌ Ошибка', 'Не удалось нажать кнопку отправки', 2);
                                }
                            } else {
                                showNotification('❌ Ошибка', 'Кнопка отправки не стала активной (возможно, текст не вставился)', 3);
                            }
                        } else {
                            showNotification('❌ Ошибка', 'Не удалось вставить текст', 2);
                        }
                        
                        navigator.mediaDevices.getUserMedia = originalGetUserMedia;
                        currentFileName = null;
                        
                    } else {
                        showNotification('❌ Ошибка', 'Кнопка остановки микрофона не найдена', 2);
                        navigator.mediaDevices.getUserMedia = originalGetUserMedia;
                        currentFileName = null;
                    }
                }, 1000);
            };
            
            source.start();
            
            setTimeout(function() {
                clickMicrophoneButton();
            }, 500);
            
        } catch (err) {
            showNotification('❌ Ошибка', err.message, 3);
            currentFileName = null;
        }
    }

    const btn = document.createElement('button');
    btn.innerHTML = '🎵';
    btn.title = 'Выбрать аудио';
    btn.style.cssText = 'position: fixed; bottom: 80px; right: 20px; width: 55px; height: 55px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; font-size: 28px; cursor: pointer; z-index: 999999; box-shadow: 0 4px 15px rgba(0,0,0,0.3); transition: transform 0.2s;';
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
        fileInput.value = '';
    };

    btn.onclick = async function() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const tracks = stream.getTracks();
            for (let i = 0; i < tracks.length; i++) {
                tracks[i].stop();
            }
            fileInput.click();
        } catch (err) {
            showNotification('❌ Ошибка', 'Нет доступа к микрофону. Разрешите в настройках', 3);
        }
    };

    document.body.appendChild(btn);
    showNotification('🎵 Аудио-помощник', 'Нажмите на кнопку 🎵 внизу справа', 3);
    
    console.log('✅ Аудио-помощник загружен (ver 1.2 - Chrome)');
})();
`;

    // Создаём Blob и вставляем через URL
    const blob = new Blob([code], { type: 'text/javascript' });
    const blobUrl = URL.createObjectURL(blob);
    
    const script = document.createElement('script');
    script.src = blobUrl;
    script.onload = function() {
        URL.revokeObjectURL(blobUrl);
        this.remove();
    };
    (document.head || document.documentElement).appendChild(script);
})();

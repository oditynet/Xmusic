// ver 1.2 - fixed bug
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

    // ========== ФУНКЦИЯ ОЖИДАНИЯ (КОТОРОЙ НЕ БЫЛО) ==========
/*    function waitForSpinnerToDisappearAndEditorReady() {
        return new Promise((resolve) => {
            console.log('⏳ Ждём готовности редактора...');
            
            // Ждём пока пропадёт спиннер загрузки (если есть)
            const checkSpinner = () => {
                const spinner = document.querySelector('.spinner, .loader, [class*="loading"]');
                if (!spinner || spinner.offsetParent === null) {
                    console.log('✅ Спиннер не обнаружен или скрыт');
                    // Даём ещё немного времени на стабилизацию DOM
                    setTimeout(resolve, 500);
                } else {
                    console.log('⏳ Спиннер ещё виден, ждём...');
                    setTimeout(checkSpinner, 200);
                }
            };
            
            checkSpinner();
        });
    }
*/

function waitForSpinnerToDisappearAndEditorReady() {
    return new Promise((resolve) => {
    //    console.log('⏳ Ждём окончания обработки аудио...');
        
        const checkSpinner = () => {
            // Ищем контейнер записи с таймером и крутящимся SVG
            const recordContainer = document.querySelector('.message-input__record');
            const rotatingSvg = document.querySelector('svg.rotate');
            
            if (!recordContainer && !rotatingSvg) {
                console.log('✅ Обработка завершена — спиннер исчез!');
                // Даём ещё 500 мс на стабилизацию DOM
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
        console.log('Текст:', text);
        
        // Ищем редактор
        const editor = document.querySelector('.message-input__message-field--main-chat [data-slate-editor="true"][contenteditable="true"]');
        
        if (!editor) {
            console.log('❌ Редактор не найден');
            resolve(false);
            return;
        }
        
        // Подсветка
        //editor.style.outline = '4px solid blue';
        //editor.style.boxShadow = '0 0 20px blue';
        //setTimeout(() => { editor.style.outline = ''; editor.style.boxShadow = ''; }, 2000);
        
        // Фокусируемся
        editor.focus();
        
        // ===== ПОЛНАЯ ОЧИСТКА =====
        // Находим все span с data-slate-string и удаляем их содержимое
        const stringSpans = editor.querySelectorAll('[data-slate-string="true"]');
        stringSpans.forEach(span => span.textContent = '');
        
        // Также очищаем все текстовые узлы
        editor.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                node.textContent = '';
            }
        });
        
        // Удаляем все дочерние элементы кроме Slate-структуры
        const slateBlock = editor.querySelector('[data-slate-object="block"]');
        if (slateBlock) {
            const leafSpan = slateBlock.querySelector('[data-slate-leaf="true"]');
            if (leafSpan) {
                // Очищаем leafSpan
                leafSpan.innerHTML = '';
                // Создаём новый data-slate-string
                const newStringSpan = document.createElement('span');
                newStringSpan.setAttribute('data-slate-string', 'true');
                leafSpan.appendChild(newStringSpan);
            }
        }
        
        // Даём время на очистку
        setTimeout(() => {
            // Находим span для вставки текста
            const targetSpan = editor.querySelector('[data-slate-string="true"]');
            
            if (targetSpan) {
                // Вставляем текст напрямую в data-slate-string
                targetSpan.textContent = text;
                //console.log('✅ Текст вставлен в существующий span');
            } else {
                // Запасной вариант - создаём структуру заново
                const leafSpan = editor.querySelector('[data-slate-leaf="true"]');
                if (leafSpan) {
                    leafSpan.innerHTML = '';
                    const newSpan = document.createElement('span');
                    newSpan.setAttribute('data-slate-string', 'true');
                    newSpan.textContent = text;
                    leafSpan.appendChild(newSpan);
                //    console.log('✅ Создан новый span с текстом');
                } else {
                    // Если совсем ничего не нашли - просто вставляем через execCommand
                    document.execCommand('insertText', false, text);
                    console.log('✅ Текст вставлен через execCommand');
                }
            }
            
            // Триггерим события для Slate
            editor.dispatchEvent(new Event('input', { bubbles: true }));
            editor.dispatchEvent(new Event('change', { bubbles: true }));
            editor.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }));
            editor.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
            
            //console.log('✅ Итоговое содержимое:', editor.textContent);
            //showNotification('✅ Текст вставлен', text, 2);
            
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
                //console.log('✅ Нашли кнопку микрофона');
                
                // Подсветка
                //btn.style.outline = '4px solid orange';
                //btn.style.boxShadow = '0 0 20px orange';
                //setTimeout(() => { btn.style.outline = ''; btn.style.boxShadow = ''; }, 3000);
                
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
                        console.log('✅ Нашли кнопку остановки');
                        
                        // Подсветка зелёным
                        //parentBtn.style.outline = '4px solid green';
                        //parentBtn.style.boxShadow = '0 0 20px green';
                        //setTimeout(() => { parentBtn.style.outline = ''; parentBtn.style.boxShadow = ''; }, 3000);
                        
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
        
        // Ищем кнопку отправки
        const sendBtn = document.querySelector('.message-input__actions button.icon-button');
        
        if (!sendBtn) {
            console.log('❌ Кнопка отправки не найдена');
            return false;
        }
        
        // === ПОДСВЕТКА КРАСНЫМ ===
        //sendBtn.style.outline = '4px solid red';
        //sendBtn.style.boxShadow = '0 0 20px red';
        //sendBtn.style.zIndex = '999999';
        
        //console.log('🔴 Кнопка отправки подсвечена красным!');
        
        /*setTimeout(() => {
            sendBtn.style.outline = '';
            sendBtn.style.boxShadow = '';
        }, 5000);
        */
        // Проверяем состояние кнопки
        console.log('Состояние кнопки:', {
            disabled: sendBtn.disabled,
            visible: sendBtn.offsetParent !== null,
            classList: sendBtn.className
        });
        
        // Пробуем нажать
        sendBtn.click();
        sendBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        
        //console.log('✅ Клик по кнопке отправлен');
        return true;
    }

    // ========== ОЖИДАНИЕ АКТИВНОСТИ КНОПКИ ОТПРАВКИ ==========
    function waitForSendButtonActive(timeout = 5000) {
        return new Promise((resolve) => {
            const start = Date.now();
            const check = () => {
                const btn = document.querySelector('.message-input__actions button.icon-button');
                
                // Проверяем, что кнопка есть и не disabled
                const isActive = btn && !btn.disabled && btn.offsetParent !== null;
                
                if (isActive) {
                    //console.log('✅ Кнопка отправки активна!');
                    resolve(btn);
                } else if (Date.now() - start > timeout) {
                    //console.log('⚠️ Таймаут ожидания кнопки отправки');
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
            
            showNotification('🎵 Загрузка аудио', \`Длительность: \${durationStr}\`, 2);
            
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
            
            source.onended = async function() {
                console.log('🎵 Аудио закончилось, останавливаем запись...');
                
                setTimeout(async function() {
                    const stopClicked = clickStopMicrophoneButton();
                    
                    if (stopClicked) {
                        console.log('✅ Кнопка остановки нажата');
                        
                        // Ждём готовности редактора
                        await waitForSpinnerToDisappearAndEditorReady();
                        
                        // Вставляем имя файла
                        console.log('📝 Вставляем имя файла:', currentFileName);
                        const inserted = await insertTextIntoInput(currentFileName);
                        
                        if (inserted) {
                            console.log('✅ Текст вставлен, ждём активации кнопки отправки...');
                            
                            // Ждём когда кнопка отправки станет активной
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
                        
                        // Восстанавливаем getUserMedia
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
        fileInput.value = '';
    };

    btn.onclick = async function() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(function(track) { track.stop(); });
            fileInput.click();
        } catch (err) {
            showNotification('❌ Ошибка', 'Нет доступа к микрофону. Разрешите в настройках', 3);
        }
    };

    document.body.appendChild(btn);
    showNotification('🎵 Аудио-помощник', 'Нажмите на кнопку 🎵 внизу справа', 3);
    
    console.log('✅ Аудио-помощник загружен (ver 1.1.6 - fixed)');
})();
`;

document.documentElement.appendChild(script);
script.remove();

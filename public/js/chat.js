// chat.js

const chatBox = document.getElementById('chat-box');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const streamModeCheckbox = document.getElementById('stream-mode');

// 메시지를 채팅 박스에 추가하는 함수
function addMessage(content, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    messageDiv.innerHTML = content; // <br> 태그를 허용하기 위해 innerHTML 사용
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;  // 최신 메시지로 스크롤
}

// 보내기 버튼 클릭 이벤트
sendBtn.addEventListener('click', async () => {
    const userMessage = chatInput.value;
    if (!userMessage) return; // 빈 입력 무시
    fn_showSpinner(); // 스피너 표시

    // 사용자 메시지를 채팅에 추가
    addMessage(userMessage, 'user');

    // 스트리밍 모드가 활성화되어 있는지 확인
    const streamMode = streamModeCheckbox.checked;
    const url = streamMode ? '/stream?message=' : '/chat?message=';

    // 사용자 메시지를 서버에 전송
    try {
        if (streamMode) {
            const response = await fetch(url + encodeURIComponent(userMessage));
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;
            let buffer = '';  // 응답 조각을 누적하기 위한 버퍼

            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                const chunk = decoder.decode(value, { stream: true });

                // 버퍼에 조각 추가
                buffer += chunk;

                // 버퍼를 줄 단위로 나눔 (SSE 데이터는 줄 바꿈으로 이벤트 구분)
                const lines = buffer.split('\n');

                // 각 줄 처리 (마지막 줄은 불완전할 수 있음)
                for (let i = 0; i < lines.length - 1; i++) {
                    if (lines[i].startsWith('data: ')) {
                        // "data: " 제거 후 나머지 내용을 채팅에 추가
                        let content = lines[i].substring(6).trim(); // 앞뒤 공백 및 줄 바꿈 제거
                        if (content) {
                            addMessage(content, 'bot');
                        }
                    }
                }

                // 마지막 부분을 버퍼에 남김 (불완전할 수 있음)
                buffer = lines[lines.length - 1];
            }

            // 남은 버퍼 내용을 처리
            if (buffer.startsWith('data: ')) {
                let content = buffer.substring(6).trim(); // 불필요한 줄 바꿈 제거
                if (content) {
                    addMessage(content, 'bot');
                }
            }
        } else {
            const response = await fetch(url + encodeURIComponent(userMessage));
            const data = await response.text();
            // 봇 응답을 채팅에 추가
            addMessage(data, 'bot');
        }
    } catch (error) {
        addMessage('오류: ' + error.message, 'bot');
    }

    chatInput.value = ''; // 입력 필드 비우기
    fn_hideSpinner(); // 스피너 숨기기
});

// Enter 키를 눌러 메시지를 전송할 수 있게 하기
chatInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault(); // 기본 동작 방지 (폼 제출)
        sendBtn.click(); // 버튼 클릭 시뮬레이션
    }
});

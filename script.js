document.addEventListener('DOMContentLoaded', () => {
    const topicCards = document.querySelectorAll('.card');

    let mediaRecorder;
    let audioChunks = [];
    let activeRecordBtn = null;
    let activeStopBtn = null;
    let activeDownloadBtn = null;
    let activeAudioPlayer = null;
    let activeStatusMessage = null;
    let isRecording = false;

    topicCards.forEach(card => {
        const recordBtn = card.querySelector('.record-btn');
        const stopBtn = card.querySelector('.stop-btn');
        const downloadBtn = card.querySelector('.download-btn');
        const audioPlayer = card.querySelector('.audio-player');
        const statusMessage = card.querySelector('.status-message');

        recordBtn.addEventListener('click', async () => {
            if (isRecording) {
                activeStatusMessage.textContent = 'Bạn phải dừng ghi âm hiện tại trước khi bắt đầu bài mới.';
                return;
            }

            topicCards.forEach(c => {
                if (c !== card) {
                    c.querySelector('.record-btn').disabled = false;
                    c.querySelector('.stop-btn').classList.add('hidden');
                    c.querySelector('.download-btn').style.display = 'none';
                    c.querySelector('.audio-player').classList.add('hidden');
                    c.querySelector('.status-message').textContent = '';
                }
            });

            activeRecordBtn = recordBtn;
            activeStopBtn = stopBtn;
            activeDownloadBtn = downloadBtn;
            activeAudioPlayer = audioPlayer;
            activeStatusMessage = statusMessage;
            
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);
                audioChunks = [];

                mediaRecorder.addEventListener('dataavailable', event => {
                    audioChunks.push(event.data);
                });

                mediaRecorder.addEventListener('stop', () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/webm;codecs=opus' });
                    const audioUrl = URL.createObjectURL(audioBlob);

                    activeAudioPlayer.src = audioUrl;
                    activeAudioPlayer.classList.remove('hidden');
                    activeDownloadBtn.href = audioUrl;
                    activeDownloadBtn.style.display = 'inline-block';

                    stream.getTracks().forEach(track => track.stop());

                    activeStatusMessage.textContent = 'Ghi âm hoàn tất.';
                    activeRecordBtn.textContent = 'Ghi Âm Lại';
                    activeRecordBtn.disabled = false;
                    activeStopBtn.classList.add('hidden');
                    isRecording = false;
                });

                mediaRecorder.start();
                isRecording = true;
                activeStatusMessage.textContent = 'Đang ghi âm...';
                activeRecordBtn.disabled = true;
                activeStopBtn.classList.remove('hidden');
                activeAudioPlayer.classList.add('hidden');
                activeDownloadBtn.style.display = 'none';

            } catch (error) {
                console.error('Lỗi khi truy cập microphone:', error);
                activeStatusMessage.textContent = 'Lỗi: Không thể truy cập microphone. Vui lòng cấp quyền.';
                activeRecordBtn.disabled = false;
                activeStopBtn.classList.add('hidden');
                isRecording = false;
            }
        });

        stopBtn.addEventListener('click', () => {
            if (mediaRecorder && mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
            }
        });
    });
});
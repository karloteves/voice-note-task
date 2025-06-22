let mediaRecorder;
let audioChunks = [];
let isRecording = false;
let stream;

const MAX_DURATION = 120000;
const WEBHOOK_URL = "https://hook.eu2.make.com/h77r4it94hahd0y4z5h1o4n6ioz2vtoe";

const recordBtn = document.getElementById('recordBtn');
const statusMessage = document.getElementById('statusMessage');

recordBtn.onclick = async () => {
  if (isRecording) {
    stopRecording();
    return;
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert("Audio recording not supported.");
    return;
  }

  stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  audioChunks = [];
  isRecording = true;
  recordBtn.innerText = "Recording... Tap to Stop";
  recordBtn.classList.add("recording");
  statusMessage.textContent = "";

  mediaRecorder.ondataavailable = e => audioChunks.push(e.data);

  mediaRecorder.onstop = async () => {
    const audioBlob = new Blob(audioChunks, { type: 'audio/m4a' });

    const formData = new FormData();
    formData.append("file", audioBlob, "voice_note.m4a");

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        body: formData
      });

      if (!response.ok) throw new Error("Upload failed");

      statusMessage.innerHTML = "✅ Voice note has been sent!";
      statusMessage.style.color = "lightgreen";
      setTimeout(() => statusMessage.textContent = "", 5000);
    } catch (error) {
      console.error(error);
      statusMessage.textContent = "❌ Upload failed.";
      statusMessage.style.color = "red";
    }

    recordBtn.innerText = "RECORD";
    recordBtn.classList.remove("recording");
    isRecording = false;
  };

  mediaRecorder.start();

  setTimeout(() => {
    if (isRecording) stopRecording();
  }, MAX_DURATION);
};

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
    stream.getTracks().forEach(track => track.stop());
    recordBtn.classList.remove("recording");
  }
}

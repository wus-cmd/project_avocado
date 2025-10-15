import os
from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn
from TTS.api import TTS
import time
import librosa
import soundfile as sf
import numpy as np

# --- AI 모델 설정 ---
print("Loading Coqui XTTS v2 model...")
tts_model = TTS("tts_models/multilingual/multi-dataset/xtts_v2")
print("Model loaded successfully.")

output_dir = "outputs"
os.makedirs(output_dir, exist_ok=True)
# ----------------------------------------------------

app = FastAPI()

class TTSRequest(BaseModel):
    text: str
    speaker_wav: str
    user_id: int

@app.post("/synthesize")
async def synthesize_speech(request: TTSRequest):
    speaker_filename = request.speaker_wav
    # .wav 확장자가 없으면 붙여주는 로직 (선택사항, 백엔드에서 이미 처리한다면 불필요)
    if not speaker_filename.endswith('.wav'):
        speaker_filename += '.wav'

    speaker_wav_path = os.path.join("voices", speaker_filename)
    if not os.path.exists(speaker_wav_path):
        return {"error": f"Speaker wav file not found: {speaker_wav_path}"}

    # --- ▼▼▼▼▼ 음질 최적화 코드가 추가되었습니다 ▼▼▼▼▼ ---
    try:
        # 1. librosa로 원본 오디오 파일 로드
        audio, orig_sr = librosa.load(speaker_wav_path, sr=None)

        # 2. 모델의 목표 음질(24000Hz)로 '고품질' 리샘플링
        target_sr = 96000
        if orig_sr != target_sr:
            audio = librosa.resample(audio, orig_sr=orig_sr, target_sr=target_sr, res_type='kaiser_best')

        # 3. 최적화된 오디오를 임시 파일로 저장
        temp_speaker_path = os.path.join(output_dir, f"temp_{int(time.time())}.wav")
        sf.write(temp_speaker_path, audio, target_sr, subtype='PCM_16')
    except Exception as e:
        return {"error": f"Audio processing failed: {str(e)}"}
    # --- ▲▲▲▲▲ 여기까지 입니다 ▲▲▲▲▲ ---

    timestamp = int(time.time())
    base_model_name = os.path.splitext(speaker_filename)[0]
    output_filename = f"user_{request.user_id}_{base_model_name}_{timestamp}.wav"
    output_filepath = os.path.join(output_dir, output_filename)

    tts_model.tts_to_file(
        text=request.text,
        speaker_wav=temp_speaker_path, # <--- 최적화된 임시 파일 경로 사용
        language="ko",
        file_path=output_filepath
    )

    # 4. 사용이 끝난 임시 파일 삭제
    os.remove(temp_speaker_path)

    return {"filename": output_filename, "message": "Synthesis successful"}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
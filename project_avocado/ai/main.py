import os
from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn
from TTS.api import TTS
import time

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
    if not speaker_filename.endswith('.wav'):
        speaker_filename += '.wav'

    speaker_wav_path = os.path.join("voices", speaker_filename)
    if not os.path.exists(speaker_wav_path):
        return {"error": f"Speaker wav file not found: {speaker_wav_path}"}
    
    timestamp = int(time.time())
    base_model_name = os.path.splitext(speaker_filename)[0]
    output_filename = f"user_{request.user_id}_{base_model_name}_{timestamp}.wav"
    output_filepath = os.path.join(output_dir, output_filename)

    tts_model.tts_to_file(
        text=request.text,
        speaker_wav=speaker_wav_path,
        language="ko",
        file_path=output_filepath
    )
    
    return {"filename": output_filename, "message": "Synthesis successful"}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
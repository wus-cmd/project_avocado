from TTS.api import TTS

# 서버 시작 코드 없이, 모델을 다운로드하는 코드만 실행합니다.
print("Starting XTTS v2 model download...")
print("This will take a long time and might ask you to agree to the terms.")

# 모델을 로컬에 다운로드하고 캐싱합니다.
model = TTS("tts_models/multilingual/multi-dataset/xtts_v2")

print("Model download and caching complete!")
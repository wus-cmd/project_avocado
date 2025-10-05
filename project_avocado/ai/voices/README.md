---
language: ko
tags:
- tts
- sovits
- gpt-sovits
- character-voice
license: mit
model-index:
- name: GPT-SoVITS - 코난, 짱구, 케로로
  results: []
base_model:
- lj1995/GPT-SoVITS
pipeline_tag: text-to-speech
---

# GPT-SoVITS - 코난, 짱구, 케로로

이 모델은 [GPT-SoVITS](https://github.com/RVC-Boss/GPT-SoVITS) 기반으로, 한국어로 된 짱구, 코난, 케로로의 음성 스타일을 모사하는 TTS 모델입니다.  
GPT-SoVITS-V4 모델을 fine-tuning 하였습니다.

---

## 모델 세부 정보

- **Architecture**: GPT-SoVITS
- **Language**: Kor (한국어)
- **Training Epochs**: SoVITS : 15 / GPT : 30
- **Sampling Rate**: 16000Hz

---

## 학습 데이터 정보
- 애니메이션 음성에서 추출한 3~5초 길이의 음성 조각
- 전처리: 노이즈 제거, 샘플링
- 사용 데이터량: 캐릭터별 약 45분

---

## 예시 음성 결과

| 입력 텍스트 | 합성 음성 |
|-------------|-----------|
| 저는 케롱별에서 온 케로로 중사라고 합니다. 전 퍼렁별 침략을 위해서 왔죠. | [🔊 케로로](./examples/keroro.wav) |
| 안녕하세요. 제 이름은 코난, 탐정이죠. 오늘은 또 무슨일이 벌어질까 궁금하네요. | [🔊 코난](./examples/conan.wav) |
| 안녕, 나는 짱구! 너도 액션가면 좋아해? 그럼 우리 흰둥이 산책 시키고 같이 액션가면 볼래? | [🔊 짱구](./examples/jjanggu.wav) |
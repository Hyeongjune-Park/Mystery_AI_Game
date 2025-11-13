# Case C001 Images

이 폴더에는 케이스 c001의 스토리/컷신에 사용되는 이미지 파일들을 저장합니다.

## 필요한 이미지 파일들

### 인트로 스토리 (intro.json)
- `intro_scene01.jpg` - 타워팰리스 외관
- `intro_scene02.jpg` - 경찰 출동 장면
- `intro_scene03.jpg` - 피해자 발견 장면
- `intro_scene04.jpg` - 사건 현장
- `intro_scene05.jpg` - 형사 (플레이어)

### 증거 발견 컷신 (knife_discovery.json)
- `knife_discovery01.jpg` - 서랍 속 칼
- `knife_discovery02.jpg` - 칼날 클로즈업
- `knife_discovery03.jpg` - 형사의 고민하는 모습

### 국면 전환 컷신 (confrontation_intro.json)
- `confrontation01.jpg` - 증거 자료들
- `confrontation02.jpg` - 대치 장면

### 진실 엔딩 (true_ending.json)
- `ending_true01.jpg` - 모든 증거가 드러난 장면
- `ending_true02.jpg` - 범인 자백
- `ending_true03.jpg` - 사건 종결

### 실패 엔딩 (false_ending.json)
- `ending_false01.jpg` - 부족한 증거
- `ending_false02.jpg` - 석방되는 용의자
- `ending_false03.jpg` - 미제 사건 파일

## 이미지 요구사항

- **포맷**: JPG, PNG, WebP
- **권장 해상도**: 1920x1080 이상 (16:9 비율)
- **파일 크기**: 개당 2MB 이하 권장
- **스타일**: 다크하고 미스터리한 분위기

## 임시 플레이스홀더

개발 중에는 이미지가 없어도 시스템이 동작합니다. 이미지가 없으면:
- 백엔드 로그에 경고가 표시됩니다
- 프론트엔드에서 이미지 로드 실패 시 대체 UI가 표시됩니다

## AI 이미지 생성 프롬프트 예시

ChatGPT, Midjourney 등을 사용해 이미지를 생성할 수 있습니다:

```
A dark, cinematic view of Tower Palace luxury apartment building in Gangnam, Seoul at dawn, crime scene tape, police cars with flashing lights, noir detective style, moody lighting, 16:9 aspect ratio
```

```
Close-up of a bloody knife found in a desk drawer, forensic photography style, dramatic lighting, evidence marker, crime scene investigation, 16:9 aspect ratio
```

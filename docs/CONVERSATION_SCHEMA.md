# 대화 스키마 (NpcReplyV1)

## 주요 필드
- npc: 응답하는 NPC id
- reply: 자연어 대사
- intent: answer | ask_back | clarify | refuse | hint | accuse_response
- tone: neutral | friendly | hostile | nervous | formal

## 증거 & 단서
- facts_extracted[]: NPC 발화에서 추출된 사실 (주어, 술어, 값, 확신도)
- proposed_clues[]: 매칭된 단서 코드 + 신뢰도

## 안전 규칙
- facts_extracted / proposed_clues는 반드시 포함해야 함
- 게이트가 열리기 전에는 민감한 정보 직접 공개 금지
- 스포일러 금지 규칙 준수

## 예시
```json
{
  "npc": "npc.detective",
  "reply": "막차는 보통 밤 11시 40분에 출발합니다.",
  "facts_extracted": [
    { "subject": "train", "predicate": "last_departure", "value": "23:40", "certainty": 0.9 }
  ],
  "proposed_clues": [
    { "code": "clue.timetable.last_train_2340", "confidence": 0.85 }
  ]
}

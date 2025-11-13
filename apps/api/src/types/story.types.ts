/**
 * Story and Flow System Type Definitions
 * 스토리라인/컷신 시스템의 타입 정의
 */

// ============================================================================
// Story Types (개별 스토리/컷신 파일)
// ============================================================================

export interface StoryScene {
  /** 이미지 파일명 (cases/c001/images/ 폴더 기준) */
  image: string;
  /** 장면 설명/자막 */
  caption: string;
}

export interface Story {
  /** 스토리 고유 ID */
  id: string;
  /** 스토리 제목 */
  title: string;
  /** 장면 배열 (순서대로 재생) */
  scenes: StoryScene[];
}

// ============================================================================
// Flow Types (게임 흐름 관리)
// ============================================================================

export interface GamePhase {
  /** 페이즈 ID */
  id: string;
  /** 페이즈 이름 */
  name: string;
  /** 페이즈 설명 */
  description: string;
}

export interface GameStartConfig {
  /** 게임 시작 시 재생할 스토리 파일명 */
  story: string;
}

// ============================================================================
// Condition Types (조건 정의)
// ============================================================================

export type ConditionType =
  | 'clue_discovered'
  | 'clues_discovered'
  | 'npc_interrogated'
  | 'time_elapsed'
  | 'no_progress'
  | 'flag_check'
  | 'all'
  | 'any'
  | 'default';

export interface ClueDiscoveredCondition {
  type: 'clue_discovered';
  clueId: string;
}

export interface CluesDiscoveredCondition {
  type: 'clues_discovered';
  clueIds: string[];
  operator: 'all' | 'any';
}

export interface NpcInterrogatedCondition {
  type: 'npc_interrogated';
  npcId: string;
  minMessages?: number;
}

export interface TimeElapsedCondition {
  type: 'time_elapsed';
  minutes: number;
}

export interface NoProgressCondition {
  type: 'no_progress';
  minutes: number;
}

export interface FlagCheckCondition {
  type: 'flag_check';
  flag: string;
  value: any;
}

export interface CompositeCondition {
  type: 'all' | 'any';
  conditions: TriggerCondition[];
}

export interface DefaultCondition {
  type: 'default';
}

export type TriggerCondition =
  | ClueDiscoveredCondition
  | CluesDiscoveredCondition
  | NpcInterrogatedCondition
  | TimeElapsedCondition
  | NoProgressCondition
  | FlagCheckCondition
  | CompositeCondition
  | DefaultCondition;

// ============================================================================
// Action Types (실행 액션)
// ============================================================================

export type ActionType =
  | 'cutscene'
  | 'phase_change'
  | 'flag_set'
  | 'hint'
  | 'notification'
  | 'unlock_clue'
  | 'multiple';

export interface CutsceneAction {
  type: 'cutscene';
  story: string;
}

export interface PhaseChangeAction {
  type: 'phase_change';
  nextPhase: string;
}

export interface FlagSetAction {
  type: 'flag_set';
  flag: string;
  value: any;
}

export interface HintAction {
  type: 'hint';
  message: string;
}

export interface NotificationAction {
  type: 'notification';
  message: string;
  unlockClue?: string;
}

export interface UnlockClueAction {
  type: 'unlock_clue';
  clueId: string;
}

export interface MultipleAction {
  type: 'multiple';
  actions: TriggerAction[];
}

export type TriggerAction =
  | CutsceneAction
  | PhaseChangeAction
  | FlagSetAction
  | HintAction
  | NotificationAction
  | UnlockClueAction
  | MultipleAction;

// ============================================================================
// Trigger Types (트리거 정의)
// ============================================================================

export interface FlowTrigger {
  /** 트리거 고유 ID */
  id: string;
  /** 트리거 발동 조건 */
  condition: TriggerCondition;
  /** 트리거 발동 시 실행할 액션 */
  action: TriggerAction;
}

// ============================================================================
// Ending Types (엔딩 분기)
// ============================================================================

export interface EndingConfig {
  /** 엔딩 ID */
  id: string;
  /** 엔딩 이름 */
  name: string;
  /** 엔딩 조건 */
  condition: TriggerCondition;
  /** 엔딩 스토리 파일명 */
  story: string;
  /** 엔딩 점수 */
  score: number;
}

// ============================================================================
// Hint Types (힌트 시스템)
// ============================================================================

export interface HintConfig {
  /** 힌트 ID */
  id: string;
  /** 힌트 발동 트리거 */
  trigger: string;
  /** 힌트 메시지 */
  message: string;
}

export interface HintSystem {
  /** 힌트 시스템 활성화 여부 */
  enabled: boolean;
  /** 힌트 사용 후 쿨다운 (초) */
  cooldown: number;
  /** 게임당 최대 힌트 개수 */
  maxHints: number;
  /** 힌트 목록 */
  hintList: HintConfig[];
}

// ============================================================================
// Timeline Event Types (타임라인 이벤트)
// ============================================================================

export interface TimelineEvent {
  /** 이벤트 발동 시간 (HH:MM:SS 형식) */
  time: string;
  /** 이벤트 액션 */
  event: TriggerAction;
}

// ============================================================================
// Debug Config (디버그 설정)
// ============================================================================

export interface DebugConfig {
  /** 인트로 스토리 건너뛰기 */
  skipIntro: boolean;
  /** 모든 증거 처음부터 해금 */
  unlockAllClues: boolean;
  /** 타이머 비활성화 */
  disableTimers: boolean;
}

// ============================================================================
// Main Flow Config (전체 플로우 설정)
// ============================================================================

export interface FlowConfig {
  /** 게임 시작 설정 */
  gameStart: GameStartConfig;
  /** 게임 페이즈 목록 */
  phases: GamePhase[];
  /** 조건부 트리거 목록 */
  triggers: FlowTrigger[];
  /** 엔딩 분기 설정 */
  endings: EndingConfig[];
  /** 힌트 시스템 설정 */
  hints: HintSystem;
  /** 타임라인 이벤트 */
  timelineEvents: TimelineEvent[];
  /** 디버그 설정 */
  debug: DebugConfig;
}

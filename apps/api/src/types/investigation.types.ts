/**
 * 조사 의뢰 시스템 타입 정의
 */

export type InvestigationType = 'forensic' | 'cctv' | 'database' | 'interview';

export type InvestigationStatus = 'pending' | 'ready' | 'claimed';

export interface InvestigationRequest {
  id: string;                    // 고유 ID
  type: InvestigationType;       // 조사 타입
  requestedAt: number;           // 요청한 턴 번호
  completesAt: number;           // 완료될 턴 번호
  clueToReveal: string;          // 공개될 단서 코드
  npcId: string;                 // 결과를 알려줄 NPC ID
  status: InvestigationStatus;   // 상태
  notificationMessage: string;   // 완료 시 전송할 메시지
}

export interface SessionFlags {
  node?: string;
  flags?: string[];
  turnCount?: number;                        // 현재 턴 수
  investigationRequests?: InvestigationRequest[];  // 조사 요청 목록
  revealedClues?: string[];                  // 공개된 단서 목록
  unreadMessages?: Record<string, number>;   // NPC별 읽지 않은 메시지 수
  discoveredClues?: string[];                // 기존 필드 유지
}

/**
 * 조사 타입별 소요 턴 수 범위
 */
export const INVESTIGATION_DURATION: Record<InvestigationType, { min: number; max: number }> = {
  cctv: { min: 2, max: 3 },          // CCTV 조회
  forensic: { min: 3, max: 5 },      // 지문, 혈액 등 감식
  database: { min: 3, max: 5 },      // 범죄 기록, 처방전
  interview: { min: 2, max: 4 },     // 증인 인터뷰
};
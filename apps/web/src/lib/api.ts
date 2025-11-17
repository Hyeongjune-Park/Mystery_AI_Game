// apps/web/src/lib/api.ts
/**
 * 클라이언트는 무조건 상대경로 '/api/proxy/*'만 사용.
 * 실제 백엔드 위치는 서버에서 route.ts가 환경변수로 해석해 연결.
 */

type SendMessageDto = { caseId: string; npcId: string; text: string };

export type NpcReplyLite = {
  reply: string;
  state?: { node?: string; flags?: string[] };
  choices?: { id: string; text: string }[]; // ✅ 드라마틱 선택지(조건부)
  triggeredActions?: Array<{
    type: string;
    [key: string]: any;
  }>; // ✅ Flow 트리거 액션들
};

export async function sendMessage(sessionId: string, dto: SendMessageDto) {
  const res = await fetch(`/api/proxy/sessions/${encodeURIComponent(sessionId)}/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`sendMessage failed: ${res.status}`);
  return (await res.json()) as NpcReplyLite;
}

export type TimelineItem = {
  at: string;
  from: 'player' | 'npc' | 'system';
  text: string;
};

export type TimelineResponse = {
  sessionId: string;
  items: TimelineItem[];
};

export async function fetchTimeline(sessionId: string, limit = 100): Promise<TimelineResponse> {
  const res = await fetch(`/api/proxy/sessions/${encodeURIComponent(sessionId)}/timeline?limit=${limit}`, {
    method: "GET",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`fetchTimeline failed: ${res.status}`);
  return await res.json();
}

// ===== Case Data API =====

export interface CaseMetadata {
  id: string;
  title: string;
  subtitle: string;
  synopsis: string;
  difficulty: string;
  estimatedMinutes: number;
  screenFlow: string[];
}

export interface StoryPage {
  title: string;
  content: string;
}

export interface StoryData {
  pages: StoryPage[];
  skippable: boolean;
}

export interface LocationObject {
  id: string;
  name: string;
  description: string;
  hiddenClue: string;
  image: string | null;
}

export interface Location {
  id: string;
  name: string;
  floor: string;
  description: string;
  objects: LocationObject[];
}

export interface LocationsData {
  intro: {
    title: string;
    description: string;
    tips: string[];
  };
  locations: Location[];
}

export interface NpcIntro {
  id: string;
  name: string;
  age: number;
  role: string;
  description: string;
  specialty: string;
}

export interface NpcsIntroData {
  intro: {
    title: string;
    description: string;
    tips: string[];
  };
  npcs: NpcIntro[];
}

export async function fetchCaseMetadata(caseId: string): Promise<CaseMetadata> {
  const res = await fetch(`/api/proxy/cases/${encodeURIComponent(caseId)}/metadata`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`fetchCaseMetadata failed: ${res.status}`);
  return await res.json();
}

export async function fetchStory(caseId: string): Promise<StoryData> {
  const res = await fetch(`/api/proxy/cases/${encodeURIComponent(caseId)}/story`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`fetchStory failed: ${res.status}`);
  return await res.json();
}

export async function fetchLocations(caseId: string): Promise<LocationsData> {
  const res = await fetch(`/api/proxy/cases/${encodeURIComponent(caseId)}/locations`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`fetchLocations failed: ${res.status}`);
  return await res.json();
}

export async function fetchNpcsIntro(caseId: string): Promise<NpcsIntroData> {
  const res = await fetch(`/api/proxy/cases/${encodeURIComponent(caseId)}/npcs-intro`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`fetchNpcsIntro failed: ${res.status}`);
  return await res.json();
}

// ===== Story/Cutscene API =====

export interface StoryScene {
  image: string;
  imageUrl: string;
  caption: string;
}

export interface StoryResponse {
  id: string;
  title: string;
  scenes: StoryScene[];
}

export interface FlowConfig {
  gameStart: {
    story: string;
  };
  phases: Array<{
    id: string;
    name: string;
    description: string;
  }>;
  triggers: any[];
  endings: any[];
  hints: any;
  timelineEvents: any[];
  debug: any;
}

/**
 * 특정 케이스의 스토리 파일을 가져옵니다
 */
export async function fetchStoryFile(caseId: string, storyFileName: string): Promise<StoryResponse> {
  const res = await fetch(`/api/proxy/story/${encodeURIComponent(caseId)}/${encodeURIComponent(storyFileName)}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`fetchStoryFile failed: ${res.status}`);
  return await res.json();
}

/**
 * 특정 케이스의 flow.yaml 설정을 가져옵니다
 */
export async function fetchFlowConfig(caseId: string): Promise<FlowConfig> {
  const res = await fetch(`/api/proxy/story/${encodeURIComponent(caseId)}/flow`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`fetchFlowConfig failed: ${res.status}`);
  return await res.json();
}

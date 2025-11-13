/**
 * Frontend Story Types
 * 프론트엔드에서 사용하는 스토리 타입 정의
 */

export interface StoryScene {
  /** 이미지 파일명 */
  image: string;
  /** 이미지 URL (백엔드에서 제공) */
  imageUrl: string;
  /** 장면 설명/자막 */
  caption: string;
}

export interface Story {
  /** 스토리 ID */
  id: string;
  /** 스토리 제목 */
  title: string;
  /** 장면 배열 */
  scenes: StoryScene[];
}

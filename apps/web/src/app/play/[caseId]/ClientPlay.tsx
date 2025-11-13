"use client";

import { useState, useEffect } from "react";
import GameIntro from "./screens/GameIntro";
import StoryIntro from "./screens/StoryIntro";
import NpcIntro from "./screens/NpcIntro";
import LocationIntro from "./screens/LocationIntro";
import GameMain from "./screens/GameMain";
import StoryViewer from "@/components/StoryViewer";
import { fetchStoryFile, fetchFlowConfig, StoryResponse } from "@/lib/api";

type GameStep = "intro" | "story" | "cutscene" | "npcs" | "locations" | "game";

export default function ClientPlay({ caseId }: { caseId: string }) {
  const [step, setStep] = useState<GameStep>("intro");
  const [currentStory, setCurrentStory] = useState<StoryResponse | null>(null);

  // 게임 시작 시 flow.yaml에서 인트로 스토리 로드
  useEffect(() => {
    if (step === "cutscene" && !currentStory) {
      loadIntroStory();
    }
  }, [step]);

  const loadIntroStory = async () => {
    try {
      const flowConfig = await fetchFlowConfig(caseId);
      const storyFileName = flowConfig.gameStart.story;
      const story = await fetchStoryFile(caseId, storyFileName);
      setCurrentStory(story);
    } catch (error) {
      console.error("Failed to load intro story:", error);
      // 에러 시 스토리 건너뛰고 NPC 소개로 이동
      setStep("npcs");
    }
  };

  const handleStoryComplete = () => {
    setCurrentStory(null);
    setStep("npcs");
  };

  return (
    <>
      {step === "intro" && (
        <GameIntro caseId={caseId} onStart={() => setStep("cutscene")} />
      )}
      {step === "cutscene" && currentStory && (
        <StoryViewer
          story={currentStory}
          onComplete={handleStoryComplete}
          skippable={true}
        />
      )}
      {step === "story" && (
        <StoryIntro caseId={caseId} onNext={() => setStep("npcs")} />
      )}
      {step === "npcs" && (
        <NpcIntro caseId={caseId} onNext={() => setStep("locations")} />
      )}
      {step === "locations" && (
        <LocationIntro caseId={caseId} onNext={() => setStep("game")} />
      )}
      {step === "game" && <GameMain caseId={caseId} />}
    </>
  );
}
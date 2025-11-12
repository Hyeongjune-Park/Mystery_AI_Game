"use client";

import { useState } from "react";
import GameIntro from "./screens/GameIntro";
import StoryIntro from "./screens/StoryIntro";
import NpcIntro from "./screens/NpcIntro";
import LocationIntro from "./screens/LocationIntro";
import GameMain from "./screens/GameMain";

type GameStep = "intro" | "story" | "npcs" | "locations" | "game";

export default function ClientPlay({ caseId }: { caseId: string }) {
  const [step, setStep] = useState<GameStep>("intro");

  return (
    <>
      {step === "intro" && (
        <GameIntro caseId={caseId} onStart={() => setStep("story")} />
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
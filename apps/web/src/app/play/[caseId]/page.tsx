// apps/web/src/app/play/[caseId]/page.tsx
import ClientPlay from "./ClientPlay";

export default async function PlayPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params; // ✅ 필수
  return <ClientPlay caseId={caseId} />;
}

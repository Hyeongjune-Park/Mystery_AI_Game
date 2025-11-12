import Link from "next/link";

export default function Home() {
  const cases = [
    {
      id: "c001",
      title: "와인잔의 비밀",
      synopsis: "유명 와인 소믈리에가 자택에서 추락사한 사건. 경찰은 자살로 결론내렸지만, 현장에는 의문점이 남아있다.",
      difficulty: "Normal",
      estimatedTime: "30분",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
            Mystery Platform
          </h1>
          <p className="text-slate-400 mt-2">AI와 함께하는 추리 게임</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Notice Section */}
        <section className="mb-12 bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-amber-400 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            공지사항
          </h2>
          <div className="text-slate-300 space-y-2">
            <p>• NPC와의 대화를 통해 단서를 수집하세요</p>
            <p>• 증거를 논리적으로 연결하여 범인을 찾아내세요</p>
            <p>• 모든 대화는 기록되며, 언제든 다시 확인할 수 있습니다</p>
          </div>
        </section>

        {/* Cases List */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">사건 목록</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases.map((caseItem) => (
              <Link
                key={caseItem.id}
                href={`/play/${caseItem.id}`}
                className="group"
              >
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300">
                  {/* Case Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full">
                      {caseItem.id.toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-400">
                      {caseItem.difficulty}
                    </span>
                  </div>

                  {/* Case Title */}
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-amber-400 transition-colors">
                    {caseItem.title}
                  </h3>

                  {/* Synopsis */}
                  <p className="text-slate-400 text-sm mb-4 line-clamp-3">
                    {caseItem.synopsis}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      약 {caseItem.estimatedTime}
                    </span>
                    <span className="text-amber-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                      시작하기 →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Empty State (if needed in future) */}
        {cases.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-500 text-lg">
              현재 진행 가능한 사건이 없습니다.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-slate-500 text-sm">
          <p>Mystery Platform © 2025. AI 기반 추리 게임 플랫폼.</p>
        </div>
      </footer>
    </div>
  );
}
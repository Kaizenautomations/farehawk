"use client";

export function LoadingBar({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-1">
      <div className="h-full w-full overflow-hidden bg-blue-950/50">
        <div className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500 animate-loading-bar" />
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes loading-bar {
              0% { transform: translateX(-100%); width: 40%; }
              50% { width: 60%; }
              100% { transform: translateX(250%); width: 40%; }
            }
            .animate-loading-bar {
              animation: loading-bar 1.5s ease-in-out infinite;
            }
          `,
        }}
      />
    </div>
  );
}

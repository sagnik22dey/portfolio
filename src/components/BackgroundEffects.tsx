export default function BackgroundEffects() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden sky-backdrop" aria-hidden="true">
      <span className="paper-cloud left-[4%] top-[14%]" />
      <span className="paper-cloud paper-cloud-sm right-[6%] top-[38%] [animation-delay:-14s]" />
      <span className="paper-cloud left-[40%] bottom-[8%] [animation-delay:-28s]" />
    </div>
  );
}

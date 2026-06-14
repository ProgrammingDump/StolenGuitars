export const Card = ({ children, className = "" }) => {
  return (
    <div className={`bg-black border border-violet-500/30 rounded-lg p-6 hover:border-violet-500/60 transition-colors ${className}`}>
      {children}
    </div>
  );
};

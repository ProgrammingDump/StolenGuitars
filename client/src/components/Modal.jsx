import { IoClose } from "react-icons/io5";

export const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className={`bg-zinc-950 border border-zinc-850 rounded-[2.5rem] shadow-2xl p-8 ${sizeClasses[size]} w-full animate-in fade-in zoom-in-95 duration-200 relative`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-black/60 hover:bg-black/90 text-white p-2 rounded-full border border-zinc-800 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <IoClose size={20} />
        </button>

        <h2 className="text-white text-2xl font-extrabold tracking-tight mb-6 bg-linear-to-r from-white to-zinc-400 bg-clip-text">
          {title}
        </h2>

        <div className="text-white">
          {children}
        </div>
      </div>
    </div>
  );
};

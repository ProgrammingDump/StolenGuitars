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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={`bg-black border border-violet-500/30 rounded-lg shadow-lg p-6 ${sizeClasses[size]} w-full mx-4`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <IoClose size={24} />
          </button>
        </div>
        <div className="text-white">
          {children}
        </div>
      </div>
    </div>
  );
};

import { LucideIcon } from "lucide-react";

const ActionButton = ({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick?: () => void }) => (
  <button onClick={onClick} className="w-full flex items-center justify-center gap-2 rounded-full bg-primary py-3 px-6 text-primary-foreground font-semibold text-sm shadow-lg hover:opacity-90 transition-opacity">
    <Icon className="w-4 h-4" />
    {label}
  </button>
);

export default ActionButton;

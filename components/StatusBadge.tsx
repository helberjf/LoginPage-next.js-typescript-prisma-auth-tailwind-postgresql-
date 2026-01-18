import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  CalendarCheck, 
  UserX 
} from "lucide-react";

type StatusBadgeProps = {
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
  size?: "sm" | "md" | "lg";
};

const statusConfig = {
  PENDING: {
    label: "Pendente",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
    textColor: "text-yellow-800 dark:text-yellow-200",
    borderColor: "border-yellow-200 dark:border-yellow-800",
    icon: Clock,
  },
  CONFIRMED: {
    label: "Confirmado",
    bgColor: "bg-blue-100 dark:bg-blue-900/20",
    textColor: "text-blue-800 dark:text-blue-200",
    borderColor: "border-blue-200 dark:border-blue-800",
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: "Cancelado",
    bgColor: "bg-red-100 dark:bg-red-900/20",
    textColor: "text-red-800 dark:text-red-200",
    borderColor: "border-red-200 dark:border-red-800",
    icon: XCircle,
  },
  COMPLETED: {
    label: "Concluído",
    bgColor: "bg-green-100 dark:bg-green-900/20",
    textColor: "text-green-800 dark:text-green-200",
    borderColor: "border-green-200 dark:border-green-800",
    icon: CalendarCheck,
  },
  NO_SHOW: {
    label: "Não compareceu",
    bgColor: "bg-orange-100 dark:bg-orange-900/20",
    textColor: "text-orange-800 dark:text-orange-200",
    borderColor: "border-orange-200 dark:border-orange-800",
    icon: UserX,
  },
} as const;

const sizeClasses = {
  sm: "text-xs px-2 py-0.5 gap-1",
  md: "text-sm px-2.5 py-1 gap-1.5",
  lg: "text-base px-3 py-1.5 gap-2",
} as const;

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const sizeClass = sizeClasses[size];

  return (
    <span
      className={`
        inline-flex items-center border rounded-full font-medium
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        ${sizeClass}
      `}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

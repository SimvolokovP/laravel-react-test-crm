import { LucideIcon } from 'lucide-react';

type ProfileFieldProps = {
  icon: LucideIcon;
  label: string;
  value: string;
};

export function ProfileField({ icon: Icon, label, value }: ProfileFieldProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="size-4 text-muted-foreground" />
      </div>

      <div className="min-w-0 space-y-1">
        <p className="text-xs text-muted-foreground">{label}</p>

        <p className="break-words text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

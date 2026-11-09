import { ConsultationBanner } from "./ConsultationBanner";

export { ConsultationBanner };

interface ConsultationCardProps {
  className?: string;
  compact?: boolean;
}

export function ConsultationCard({ className }: ConsultationCardProps) {
  return className ? <ConsultationBanner className={className} /> : <ConsultationBanner />;
}

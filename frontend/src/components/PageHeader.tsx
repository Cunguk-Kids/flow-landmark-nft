import BackButton from "@/components/BackButton";
import { Logo } from "@/components/Logo";

interface PageHeaderProps {
  showLogo?: boolean;
}

export function PageHeader({ showLogo = false }: PageHeaderProps) {
  return (
    <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 py-3 flex justify-between">
        <BackButton />
        {showLogo && <Logo />}
        {showLogo && <div className="max-sm:hidden"></div>}
      </div>
    </div>
  );
}

import Header from "@/components/Header";
import EventListPopup from "@/components/EventListPopup";
import SandboxMap from "../sandbox/SandboxMap";

const MainPage = () => {
  return (
    <div className="min-h-screen isolate relative grid grid-cols-1 text-foreground bg-background">
      <SandboxMap />
      <Header />
      <EventListPopup />
    </div>
  );
};

export default MainPage;

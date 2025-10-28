import Header from "@/components/Header";
import SandboxMap from "../sandbox/SandboxMap";

const MainPage = () => {
  return (
    <div className="min-h-screen isolate relative grid grid-cols-1">
      <SandboxMap />
      <Header />
    </div>
  );
};

export default MainPage;

import Auth from "./Auth";
import { Logo } from "./Logo";
import { Typhography } from "./ui/typhography";

const Header = () => {
  return (
    <header className="p-1 absolute left-0 right-0">
      <div className="flex justify-between items-center backdrop-blur-2xl rounded-full px-4 py-2 shadow-2xl">
        <div className="flex items-center gap-3">
          <Logo />
        </div>
        <Auth />
      </div>
    </header>
  );
};

export default Header;

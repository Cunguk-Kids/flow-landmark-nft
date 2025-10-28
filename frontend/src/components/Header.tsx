import Auth from "./Auth";
import { Typhography } from "./ui/typhography";

const Header = () => {
  return (
    <header className="p-1 absolute left-0 right-0">
      <div className="flex justify-between items-center backdrop-blur-2xl rounded-full px-4 py-2 shadow-2xl">
        <div className="flex items-center gap-3">
          <Typhography variant="3xl">🌺</Typhography>
          <div className="flex flex-col justify-center">
            <h1 className="sm:text-3xl font-bold bg-gradient-to-r from-sky-600 to-purple-600 dark:from-sky-400 dark:to-purple-400 bg-clip-text text-transparent">
              <Typhography variant="t1">Flow NFT Moments</Typhography>
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              <Typhography variant="t1">
                Preserve Indonesian culture on blockchain
              </Typhography>
            </p>
          </div>
        </div>
        <Auth />
      </div>
    </header>
  );
};

export default Header;

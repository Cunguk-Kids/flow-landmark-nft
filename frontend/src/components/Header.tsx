import Auth from "./Auth";
import NavBar from "./NavBar";

const Header = () => {
  return (
    <header className="flex justify-between items-center p-4">
      <div className="flex items-center gap-3">
        <div className="text-4xl">🌺</div>
        <div>
          <h1 className="hidden sm:block sm:text-3xl font-bold bg-gradient-to-r from-sky-600 to-purple-600 dark:from-sky-400 dark:to-purple-400 bg-clip-text text-transparent">
            Flow NFT Moments
          </h1>
          <p className="hidden sm:block text-sm text-gray-600 dark:text-gray-400">
            Preserve Indonesian culture on blockchain
          </p>
        </div>
      </div>
      <NavBar />
      <Auth />
    </header>
  );
};

export default Header;

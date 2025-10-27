import { useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

const BackButton = () => {
  const router = useRouter();

  const handleClickBack = () => {
    router.history.back();
  };

  return (
    <Button
      variant={"link"}
      onClick={handleClickBack}
      size={"lg"}
      className="rounded-full text-white font-semibold"
    >
      <ChevronLeft /> Back
    </Button>
  );
};

export default BackButton;

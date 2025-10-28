import { useFlowCurrentUser } from "@onflow/react-sdk";
import { Typhography } from "./ui/typhography";
import { useAccount } from "@/hooks/useAccount";
import { Button } from "./ui/button";
import {
  LucideCircleUserRound,
  LucideLogIn,
  LucideLogOut,
  LucideMenu,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Auth() {
  const { authenticate, unauthenticate } = useFlowCurrentUser();

  const { data } = useAccount();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon-lg">
          {data ? (
            <img src={data?.avatar} className="block size-10" />
          ) : (
            <LucideMenu className="size-5 text-foreground" />
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="dark">
        <SheetHeader>
          <div className="relative isolate rounded-md overflow-hidden p-0">
            <img src="/profile-bg.png" className="block h-auto w-full" />
            <div className="flex gap-2 items-center -mt-10 backdrop-blur-lg absolute bottom-0 left-0 right-0 p-2 shadow-2xl">
              <div className="backdrop-blur-md border rounded-full overflow-hidden size-12 sm:size-15 flex items-center justify-center">
                {data ? (
                  <img src={data?.avatar} className="block size-full" />
                ) : (
                  <LucideCircleUserRound className="size-full text-foreground" />
                )}
              </div>
              <div className="flex flex-col">
                <SheetTitle>
                  <Typhography>{data?.address ?? "0x0"}</Typhography>
                </SheetTitle>
                <SheetDescription>
                  <Typhography>Lorem ipsum dolor sit amet</Typhography>
                </SheetDescription>
              </div>
            </div>
          </div>
          {data ? (
            <Button onClick={unauthenticate} variant="destructive">
              <LucideLogOut />
              <Typhography>Disconect Wallet</Typhography>
            </Button>
          ) : (
            <Button
              onClick={() => {
                authenticate();
                requestAnimationFrame(() => {
                  (
                    document.querySelector("#FCL_IFRAME") as HTMLIFrameElement
                  ).style.pointerEvents = "auto";
                });
              }}
              variant="default"
            >
              <LucideLogIn />
              <Typhography>Connect Wallet</Typhography>
            </Button>
          )}
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}

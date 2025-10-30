/**
 * Hook for registering user to an event using Cadence transaction
 * Triggers on-chain user registration via EventPlatform contract
 */

import { useFlowMutate } from "@onflow/react-sdk";
import { formatFlowAddress } from "@/lib/flow-utils";

interface RegisterEventParams {
  brandAddress: string;
  eventID: number;
}

export function useRegisterEvent() {
  const { mutateAsync, isPending, data: txId, error } = useFlowMutate();

  const registerEvent = async (params: RegisterEventParams) => {
    const { brandAddress, eventID } = params;

    // Validate and format the address
    let formattedAddress: string;
    try {
      formattedAddress = formatFlowAddress(brandAddress);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Invalid address format";
      throw new Error(`Brand address validation failed: ${errorMsg}`);
    }

    console.log("Registering event with:", {
      originalAddress: brandAddress,
      formattedAddress,
      hasPrefix: formattedAddress.startsWith("0x"),
      eventID,
      eventIDType: typeof eventID,
    });

    return mutateAsync({
      cadence: `
        import "EventPlatform"

        transaction(brandAddress: Address, eventID: UInt64) {

            let eventRef: &{EventPlatform.IEventPublic}
            let userAddress: Address

            prepare(userAccount: &Account) {

                let managerCap = getAccount(brandAddress)
                    .capabilities.get<&{EventPlatform.IPublicEventManager}>(
                        EventPlatform.EventManagerPublicPath
                    )

                let managerRef = managerCap.borrow()
                    ?? panic("Brand does not have a public Event Manager")

                self.eventRef = managerRef.getEvent(id: eventID)
                    ?? panic("Event not found")

                self.userAddress = userAccount.address
            }

            execute {
                self.eventRef.register(user: self.userAddress)
                log("User successfully registered!")
            }
        }
      `,
      args: (arg, t) => [
        arg(formattedAddress, t.Address),
        arg(String(eventID), t.UInt64),
      ],
      limit: 100,
    });
  };

  return {
    registerEvent,
    isPending,
    txId,
    error,
  };
}

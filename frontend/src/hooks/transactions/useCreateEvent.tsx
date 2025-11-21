'use client';

import { useFlowMutate, useFlowTransactionStatus } from '@onflow/react-sdk';

const CREATE_EVENT_TX = `
import "EventManager"
import "MetadataViews"

// create event in 'EventManager'

transaction(
    eventName: String,
    description: String,
    thumbnailURL: String,
    eventPassImg: String?,
    eventType: UInt8, // 0 = online, 1 = offline
    location: String,
    lat: Fix64,
    long: Fix64,
    startDate: UFix64,
    endDate: UFix64,
    quota: UInt64
) {

    prepare(signer: auth(BorrowValue) &Account) {
        let newID = EventManager.createEvent(
            hostAddress: signer.address,
            eventName: eventName,
            description: description,
            thumbnailURL: thumbnailURL,
            eventPassImg: eventPassImg,
            eventType: eventType,
            location: location,
            lat: lat,
            long: long,
            startDate: startDate,
            endDate: endDate,
            quota: quota
        )
        
        log("Event created successfully with ID: ".concat(newID.toString()))
    }
}
`;

export interface CreateEventDTO {
  eventName: string;
  description: string;
  thumbnailURL: string;
  eventPassImg?: string;
  eventType: 'online' | 'offline';
  location: string;
  lat: number;
  long: number;
  startDate: Date;
  endDate: Date;
  quota: number;
}

export function useCreateEvent() {
  const { mutate, data: txId, isPending: isMutating, error: txError } = useFlowMutate();
  const { transactionStatus, error: statusError } = useFlowTransactionStatus({ id: txId });

  const isSealed = transactionStatus?.status === 4;
  const isPending = isMutating || (!!txId && !isSealed);

  const createEvent = (data: CreateEventDTO) => {
    // Konversi Tipe
    const eventTypeInt = data.eventType === 'online' ? 0 : 1;
    // Timestamp harus dalam detik (UFix64 format string "123.0")
    const startTs = (data.startDate.getTime() / 1000).toFixed(1);
    const endTs = (data.endDate.getTime() / 1000).toFixed(1);
    
    // Fix64 format string "0.0"
    const latStr = data.lat.toFixed(4);
    const longStr = data.long.toFixed(4);

    mutate({
      cadence: CREATE_EVENT_TX,
      args: (arg, t) => [
        arg(data.eventName, t.String),
        arg(data.description, t.String),
        arg(data.thumbnailURL, t.String),
        arg(data.eventPassImg || null, t.Optional(t.String)),
        arg(String(eventTypeInt), t.UInt8),
        arg(data.location, t.String),
        arg(latStr, t.Fix64),
        arg(longStr, t.Fix64),
        arg(startTs, t.UFix64),
        arg(endTs, t.UFix64),
        arg(String(data.quota), t.UInt64)
      ]
    });
  };

  return {
    createEvent,
    isPending,
    isSealed,
    error: txError || statusError,
  };
}
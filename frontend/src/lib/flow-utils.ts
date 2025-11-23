export const getEventFromTx = (txResult: any, eventTypeSuffix: string) => {
  // Loop semua event di transaksi
  const event = txResult.events.find((e: any) => 
    e.type.endsWith(eventTypeSuffix)
  );
  return event?.data; // Mengembalikan { id: 123, name: "..." }
};
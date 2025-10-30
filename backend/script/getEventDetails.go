package script

const GetEventDetailScriptTemplate = `
import EventPlatform from 0x15728ff209769c63

// Copy of the struct from get_event_detail.cdc
access(all) struct PublicEventDetails {
    access(all) let eventName: String
    access(all) let quota: UInt64
    access(all) let counter: UInt64
    // access(all) let isUserRegistered: Bool // Not needed for creating event record

    access(all) let description: String
    access(all) let image: String
    access(all) let lat: Fix64
    access(all) let long: Fix64
    access(all) let radius: UFix64
    access(all) let status: UInt8
    access(all) let startDate: UFix64
    access(all) let endDate: UFix64
    access(all) let totalRareNFT: UInt64

    // Simplified init without isUserRegistered
    init(
        eventName: String, quota: UInt64, counter: UInt64,
        description: String, image: String, lat: Fix64, long: Fix64, radius: UFix64,
        status: UInt8, startDate: UFix64, endDate: UFix64, totalRareNFT: UInt64
    ) {
        self.eventName = eventName; self.quota = quota; self.counter = counter;
        self.description = description; self.image = image; self.lat = lat; self.long = long;
        self.radius = radius; self.status = status; self.startDate = startDate;
        self.endDate = endDate; self.totalRareNFT = totalRareNFT;
    }
}


// Function adjusted from get_event_detail.cdc
access(all) fun main(brandAddress: Address, eventID: UInt64): PublicEventDetails? {
    let managerCap = getAccount(brandAddress)
        .capabilities.get<&{EventPlatform.IPublicEventManager}>(
            EventPlatform.EventManagerPublicPath
        )
    let managerRef = managerCap.borrow() ?? panic("Event Manager publik tidak ditemukan")
    let eventRef = managerRef.getEvent(id: eventID)
    if eventRef == nil { return nil }
    let eventDetails = eventRef!
    return PublicEventDetails(
        eventName: eventDetails.eventName, quota: eventDetails.quota, counter: eventDetails.counter,
        description: eventDetails.description, image: eventDetails.image, lat: eventDetails.lat, long: eventDetails.long,
        radius: eventDetails.radius, status: eventDetails.status, startDate: eventDetails.startDate,
        endDate: eventDetails.endDate, totalRareNFT: eventDetails.totalRareNFT
    )
}
`

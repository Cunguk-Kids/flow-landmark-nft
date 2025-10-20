import "NFTMoment"

// Get all registered partners
access(all) fun main(): {Address: NFTMoment.PartnerInfo} {
    return NFTMoment.getAllPartners()
}

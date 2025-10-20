import "NFTMoment"

// Get info for a specific partner
access(all) fun main(partnerAddress: Address): NFTMoment.PartnerInfo? {
    return NFTMoment.getPartnerInfo(address: partnerAddress)
}

import "NFTMoment"

// Test transaction to mint a sample NFT
transaction() {
    let recipient: &NFTMoment.Collection

    prepare(acct: auth(Storage) &Account) {
        self.recipient = acct.storage.borrow<&NFTMoment.Collection>(from: NFTMoment.CollectionStoragePath)
            ?? panic("Could not borrow collection reference")
    }

    execute {
        let location = NFTMoment.Location(
            latitude: "-7.6079",
            longitude: "110.2038",
            placeName: "Borobudur Temple",
            city: "Magelang",
            country: "Indonesia"
        )

        let metadata = NFTMoment.MomentMetadata(
            title: "Borobudur Temple",
            description: "A beautiful cultural moment at Borobudur, the largest Buddhist temple in the world",
            category: NFTMoment.Category.Historical,
            imageURL: "https://example.com/borobudur.jpg",
            thumbnailURL: "https://example.com/borobudur-thumb.jpg",
            timestamp: getCurrentBlock().timestamp,
            weather: "Sunny",
            temperature: "28°C",
            location: location,
            altitude: "250m",
            windSpeed: "5 km/h",
            border: NFTMoment.BorderStyle.Batik,
            sticker: NFTMoment.StickerStyle.JavaneseScript,
            filter: NFTMoment.FilterStyle.Cultural,
            audio: NFTMoment.AudioStyle.Gamelan,
            javaneseText: "ꦧꦺꦴꦫꦺꦴꦧꦸꦝꦸꦂ",
            tags: ["temple", "historical", "buddhist", "javanese"],
            attributes: {
                "unesco": "yes",
                "year_built": "8th century"
            }
        )

        let nftId = NFTMoment.mintNFT(
            recipient: self.recipient,
            metadata: metadata,
            rarity: NFTMoment.Rarity.Rare
        )

        log("Minted NFT ID: ".concat(nftId.toString()))
    }
}

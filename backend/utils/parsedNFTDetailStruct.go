package utils

import (
	"backend/ent/schema" // Use your actual path
	"fmt"
	"log" // Added log for errors within helpers
	"strconv"

	"github.com/onflow/cadence"
)

// parseNFTDetailsStruct converts the map[string]cadence.Value into schema.Metadata
// --- PERBAIKAN: Menerima map, bukan struct ---
func parseNFTDetailsStruct(fields map[string]cadence.Value) (*schema.Metadata, error) {
	meta := schema.Metadata{}
	var err error

	// --- HELPER FUNCTIONS NOW OPERATE ON THE MAP ---

	// Helper untuk ambil string (termasuk optional)
	getStringField := func(name string) (string, error) {
		val, ok := fields[name] // <-- Akses map langsung
		if !ok {
			// Decide if missing optional fields are errors or just empty
			// For now, assume optional fields missing is okay, return empty string
			// Check if field is required based on schema/contract if needed
			// return "", fmt.Errorf("field '%s' not found", name)
			return "", nil // Return empty for missing optional field
		}
		if opt, ok := val.(cadence.Optional); ok {
			if opt.Value == nil {
				return "", nil // Return empty string for nil optional
			}
			val = opt.Value // Unwrap
		}
		strVal, ok := val.(cadence.String)
		if !ok {
			// Check if it's nil (after optional check, shouldn't happen unless type mismatch)
			if val == nil {
				return "", nil
			}
			return "", fmt.Errorf("field '%s' is not cadence.String (type: %T)", name, val)
		}
		return strVal.String(), nil
	}

	// Helper untuk ambil UFix64 string (termasuk optional)
	getUFix64StringField := func(name string) (string, error) {
		val, ok := fields[name] // <-- Akses map
		if !ok {
			return "", nil
		} // Assume missing optional is okay
		if opt, ok := val.(cadence.Optional); ok {
			if opt.Value == nil {
				return "", nil
			}
			val = opt.Value
		}
		ufixVal, ok := val.(cadence.UFix64)
		if !ok {
			if val == nil {
				return "", nil
			}
			return "", fmt.Errorf("field '%s' not cadence.UFix64 (type: %T)", name, val)
		}
		return ufixVal.String(), nil
	}

	// Helper untuk ambil Fix64 string (termasuk optional)
	// getFix64StringField := func(name string) (string, error) {
	// 	val, ok := fields[name] // <-- Akses map
	// 	if !ok { return "", nil } // Assume missing optional is okay
	// 	if opt, ok := val.(cadence.Optional); ok {
	// 		if opt.Value == nil { return "", nil }
	// 		val = opt.Value
	// 	}
	// 	fixVal, ok := val.(cadence.Fix64)
	// 	if !ok {
	//           if val == nil { return "", nil}
	//           return "", fmt.Errorf("field '%s' not cadence.Fix64 (type: %T)", name, val)}
	// 	return fixVal.String(), nil
	// }

	// Helper untuk ambil Enum string (termasuk optional)
	getEnumStringField := func(name string) (string, error) {
		val, ok := fields[name] // <-- Access map
		if !ok {
			return "", nil
		} // Assume missing optional is okay
		if opt, ok := val.(cadence.Optional); ok {
			if opt.Value == nil {
				return "", nil
			}
			val = opt.Value
		}
		enumVal, ok := val.(cadence.Enum)
		if !ok {
			if val == nil {
				return "", nil
			}
			return "", fmt.Errorf("field '%s' not cadence.Enum (type: %T)", name, val)
		}

		// --- PERBAIKAN DI SINI ---
		// Use the correct method based on the enum's raw type (UInt8)
		rawValue := enumVal.FieldsMappedByName()["rawValue"].String() // Gets the underlying uint8 value

		// Convert the uint8 raw value to a string
		return rawValue, nil
		// --- AKHIR PERBAIKAN ---
	}

	// Helper untuk ambil Location (optional struct)
	getLocationField := func(name string) (*schema.Location, error) {
		val, ok := fields[name] // <-- Akses map
		if !ok {
			return nil, nil
		} // Missing optional is okay
		opt, ok := val.(cadence.Optional)
		if !ok || opt.Value == nil {
			return nil, nil
		}
		locStruct, ok := opt.Value.(cadence.Struct)
		if !ok {
			return nil, fmt.Errorf("field '%s' not Struct", name)
		}

		// Access nested fields directly using FieldsMappedByName on the nested struct
		nestedFields := locStruct.FieldsMappedByName()

		latVal, _ := nestedFields["latitude"].(cadence.Fix64)   // Assuming required
		longVal, _ := nestedFields["longitude"].(cadence.Fix64) // Assuming required

		latF, _ := strconv.ParseFloat(latVal.String(), 64)
		longF, _ := strconv.ParseFloat(longVal.String(), 64)

		var placeName, city, country string
		if placeVal, ok := nestedFields["placeName"].(cadence.Optional); ok && placeVal.Value != nil {
			placeName = placeVal.Value.(cadence.String).String()
		}
		if cityVal, ok := nestedFields["city"].(cadence.Optional); ok && cityVal.Value != nil {
			city = cityVal.Value.(cadence.String).String()
		}
		if countryVal, ok := nestedFields["country"].(cadence.Optional); ok && countryVal.Value != nil {
			country = countryVal.Value.(cadence.String).String()
		}

		return &schema.Location{
			Latitude: latF, Longitude: longF, PlaceName: placeName, City: city, Country: country,
		}, nil
	}

	// Helper untuk ambil String Array (optional)
	getStringArrayField := func(name string) ([]string, error) {
		val, ok := fields[name] // <-- Akses map
		if !ok {
			return nil, nil
		} // Missing optional is okay
		opt, ok := val.(cadence.Optional)
		if ok {
			if opt.Value == nil {
				return nil, nil
			}
			val = opt.Value
		}
		arr, ok := val.(cadence.Array)
		if !ok {
			return nil, fmt.Errorf("field '%s' not Array", name)
		}
		result := make([]string, 0, len(arr.Values))
		for i, item := range arr.Values {
			strVal, ok := item.(cadence.String)
			if !ok {
				return nil, fmt.Errorf("item %d not String", i)
			}
			result = append(result, strVal.String())
		}
		return result, nil
	}

	// Helper untuk ambil Dictionary (optional)
	getStringDictField := func(name string) (map[string]string, error) {
		val, ok := fields[name] // <-- Akses map
		if !ok {
			return nil, nil
		} // Missing optional is okay
		opt, ok := val.(cadence.Optional)
		if ok {
			if opt.Value == nil {
				return nil, nil
			}
			val = opt.Value
		}
		dict, ok := val.(cadence.Dictionary)
		if !ok {
			return nil, fmt.Errorf("field '%s' not Dictionary", name)
		}
		result := make(map[string]string, len(dict.Pairs))
		for _, pair := range dict.Pairs {
			keyStr, okK := pair.Key.(cadence.String)
			valueStr, okV := pair.Value.(cadence.String)
			if !okK || !okV {
				return nil, fmt.Errorf("dict non-string key/value")
			}
			result[keyStr.String()] = valueStr.String()
		}
		return result, nil
	}

	// --- Isi struct Metadata ---
	// (Gunakan error handling yang lebih baik di produksi jika diperlukan)
	meta.Title, err = getStringField("title")
	if err != nil {
		log.Printf("Warning parsing title: %v", err)
	}
	meta.Description, err = getStringField("description")
	if err != nil {
		log.Printf("Warning parsing description: %v", err)
	}
	meta.Category, err = getEnumStringField("category")
	if err != nil {
		log.Printf("Warning parsing category: %v", err)
	}
	meta.ImageURL, err = getStringField("imageURL")
	if err != nil {
		log.Printf("Warning parsing imageURL: %v", err)
	}
	meta.ThumbnailURL, err = getStringField("thumbnailURL")
	if err != nil {
		log.Printf("Warning parsing thumbnailURL: %v", err)
	}
	tsStr, err := getUFix64StringField("timestamp")
	if err != nil {
		log.Printf("Warning parsing timestamp: %v", err)
	} else {
		tsFloat, _ := strconv.ParseFloat(tsStr, 64)
		meta.Timestamp = tsFloat
	}
	meta.Weather, err = getStringField("weather")
	if err != nil {
		log.Printf("Warning parsing weather: %v", err)
	}
	meta.Temperature, err = getStringField("temperature")
	if err != nil {
		log.Printf("Warning parsing temperature: %v", err)
	}
	meta.Location, err = getLocationField("location")
	if err != nil {
		log.Printf("Warning parsing location: %v", err)
	}
	meta.Altitude, err = getStringField("altitude")
	if err != nil {
		log.Printf("Warning parsing altitude: %v", err)
	}
	meta.WindSpeed, err = getStringField("windSpeed")
	if err != nil {
		log.Printf("Warning parsing windSpeed: %v", err)
	}
	meta.Border, err = getEnumStringField("border")
	if err != nil {
		log.Printf("Warning parsing border: %v", err)
	}
	meta.Sticker, err = getEnumStringField("sticker")
	if err != nil {
		log.Printf("Warning parsing sticker: %v", err)
	}
	meta.Filter, err = getEnumStringField("filter")
	if err != nil {
		log.Printf("Warning parsing filter: %v", err)
	}
	meta.Audio, err = getEnumStringField("audio")
	if err != nil {
		log.Printf("Warning parsing audio: %v", err)
	}
	meta.JavaneseText, err = getStringField("javaneseText")
	if err != nil {
		log.Printf("Warning parsing javaneseText: %v", err)
	}
	meta.Tags, err = getStringArrayField("tags")
	if err != nil {
		log.Printf("Warning parsing tags: %v", err)
	}
	meta.Attributes, err = getStringDictField("attributes")
	if err != nil {
		log.Printf("Warning parsing attributes: %v", err)
	}

	// Kembalikan metadata yang berhasil diparsing (meskipun ada warning)
	return &meta, nil
}

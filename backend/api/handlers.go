package main

import (
	"backend/ent"
	"backend/ent/event"
	"backend/ent/listing"
	"backend/ent/nftaccessory"
	"backend/ent/nftmoment"
	"backend/ent/user"
	"backend/transactions"
	"backend/utils"
	"fmt"
	"io"
	"log"
	"math"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/labstack/echo/v4"
)

// Handler adalah struct kustom yang akan kita gunakan
// untuk "menyuntikkan" (inject) koneksi database 'ent' kita
// ke dalam fungsi-fungsi API kita.
type Handler struct {
	DB *ent.Client
}

type Pagination struct {
	TotalItems  int `json:"totalItems"`
	TotalPages  int `json:"totalPages"`
	CurrentPage int `json:"currentPage"`
	PageSize    int `json:"pageSize"`
}

// APIResponse adalah "bungkusan" standar kita.
// 'omitempty' akan menyembunyikan field jika nilainya kosong/nil
type APIResponse struct {
	Data       interface{} `json:"data,omitempty"`
	Pagination *Pagination `json:"pagination,omitempty"`
	Error      string      `json:"error,omitempty"`
}

type GetEventsResponse struct {
	Data       []*ent.Event `json:"data"`       // <-- Tipe data spesifik
	Pagination *Pagination  `json:"pagination"` // <-- Pagination Anda
}

func getPagination(c echo.Context) (limit, offset, page, pageSize int) {
	// Nilai default
	const defaultPageSize = 10
	const defaultPage = 1

	page, err := strconv.Atoi(c.QueryParam("page"))
	if err != nil || page < 1 {
		page = defaultPage
	}

	pageSize, err = strconv.Atoi(c.QueryParam("pageSize"))
	if err != nil || pageSize < 1 {
		pageSize = defaultPageSize
	}

	limit = pageSize
	offset = (page - 1) * pageSize

	// Kembalikan semua nilai
	return limit, offset, page, pageSize
}

// @Summary     Ambil Daftar NFT Moment (Paginated)
// @Description Mengambil daftar NFT Moment, mendukung filter berdasarkan pemilik dan pagination.
// @Description 'Eager loading' akan menyertakan data 'owner', 'equipped_accessories', dan 'minted_with_pass'.
// @Tags        Moments
// @Accept      json
// @Produce     json
// @Param       owner_address query    string  false  "Filter berdasarkan alamat pemilik (misal: 0x...)"
// @Param       page          query    int     false  "Nomor Halaman (default: 1)"
// @Param       pageSize      query    int     false  "Jumlah item per halaman (default: 20)"
// @Success     200 {object} swagdto.GetMomentsResponse "Daftar momen berhasil diambil"
// @Failure     404 {object} swagdto.Response404 "User (pemilik) tidak ditemukan"
// @Failure     500 {object} APIResponse "Internal Server Error"
// @Router      /moments [get]
func (h *Handler) getMoments(c echo.Context) error {
	ctx := c.Request().Context()

	// 1. Dapatkan parameter pagination
	limit, offset, page, pageSize := getPagination(c)

	// 2. Siapkan query dasar
	query := h.DB.NFTMoment.Query()

	// 3. Terapkan Filter (jika ada)
	//    Cek apakah ada filter 'owner_address' di URL
	ownerAddress := c.QueryParam("owner_address")
	if ownerAddress != "" {
		// Jika ada, tambahkan 'Where' clause (filter) ke query
		query = query.Where(
			// Filter berdasarkan relasi 'owner'
			nftmoment.HasOwnerWith(user.AddressEQ(ownerAddress)),
		)
	}
	// ---

	// 4. Hitung total item (setelah filter diterapkan)
	totalItems, err := query.Count(ctx)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, APIResponse{Error: err.Error()})
	}

	// 5. Buat Metadata Pagination
	totalPages := int(math.Ceil(float64(totalItems) / float64(pageSize)))
	pagination := &Pagination{
		TotalItems:  totalItems,
		TotalPages:  totalPages,
		CurrentPage: page,
		PageSize:    pageSize,
	}

	// 6. Jalankan Query UTAMA dengan Limit/Offset
	moments, err := query.
		WithOwner().
		WithEquippedAccessories(). // <-- 'Preload' data aksesoris yang terpasang
		WithMintedWithPass().      // <-- 'Preload' data EventPass yang digunakan
		Limit(limit).
		Offset(offset).
		Order(ent.Desc("id")). // Urutkan dari yang terbaru
		All(ctx)

	if err != nil {
		return c.JSON(http.StatusInternalServerError, APIResponse{Error: err.Error()})
	}

	// 7. Kembalikan Respon Standar (Terbungkus)
	response := APIResponse{
		Data:       moments,
		Pagination: pagination,
	}
	return c.JSON(http.StatusOK, response)
}

// @Summary     Ambil Daftar NFT Aksesori (Paginated)
// @Description Mengambil daftar NFT Aksesori, mendukung filter berdasarkan pemilik dan pagination.
// @Description 'Eager loading' akan menyertakan data 'owner'.
// @Tags        Accessories
// @Accept      json
// @Produce     json
// @Param       owner_address query    string  false  "Filter berdasarkan alamat pemilik (misal: 0x...)"
// @Param       page          query    int     false  "Nomor Halaman (default: 1)"
// @Param       pageSize      query    int     false  "Jumlah item per halaman (default: 20)"
// @Success     200 {object} swagdto.GetAccessoriesResponse "Daftar aksesori berhasil diambil"
// @Failure     404 {object} swagdto.Response404 "404 Not Found"
// @Failure     500 {object} APIResponse "Internal Server Error"
// @Router      /accessories [get]
func (h *Handler) getAccessories(c echo.Context) error {
	ctx := c.Request().Context()

	// 1. Dapatkan parameter pagination
	limit, offset, page, pageSize := getPagination(c)

	// 2. Siapkan query dasar
	query := h.DB.NFTAccessory.Query()

	// 3. --- INI ADALAH LOGIKA BARU ANDA ---
	//    Cek apakah ada filter 'owner_address' di URL
	ownerAddress := c.QueryParam("owner_address")
	if ownerAddress != "" {
		// Jika ada, tambahkan 'Where' clause (filter) ke query
		query = query.Where(
			// Filter berdasarkan relasi 'owner'
			nftaccessory.HasOwnerWith(user.AddressEQ(ownerAddress)),
		)
	}
	// --- AKHIR LOGIKA BARU ---

	// 4. Hitung total item (setelah filter diterapkan)
	totalItems, err := query.Count(ctx)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, APIResponse{Error: err.Error()})
	}

	// 5. Buat Metadata Pagination
	totalPages := int(math.Ceil(float64(totalItems) / float64(pageSize)))
	pagination := &Pagination{
		TotalItems:  totalItems,
		TotalPages:  totalPages,
		CurrentPage: page,
		PageSize:    pageSize,
	}

	// 6. Jalankan Query UTAMA dengan Limit/Offset
	accessories, err := query.
		WithOwner(). // (Opsional: 'preload' data owner)
		Limit(limit).
		Offset(offset).
		Order(ent.Desc("id")). // Urutkan dari yang terbaru
		All(ctx)

	if err != nil {
		return c.JSON(http.StatusInternalServerError, APIResponse{Error: err.Error()})
	}

	// 7. Kembalikan Respon Standar (Terbungkus)
	response := APIResponse{
		Data:       accessories,
		Pagination: pagination,
	}
	return c.JSON(http.StatusOK, response)
}

func (h *Handler) handleUGCUpload(c echo.Context) (string, error) {
	// 1. Ambil data FILE dari form multipart
	file, err := c.FormFile("thumbnail")
	if err != nil {
		log.Println("Error mengambil form file 'thumbnail':", err)
		return "", fmt.Errorf("file 'thumbnail' wajib ada")
	}

	// 2. Buka file yang di-upload
	src, err := file.Open()
	if err != nil {
		return "", fmt.Errorf("gagal membuka file yang di-upload: %w", err)
	}
	defer src.Close()

	// 3. Buat nama file sementara yang unik
	ext := filepath.Ext(file.Filename)
	tempFilePath := fmt.Sprintf("temp_upload_%d%s", time.Now().UnixNano(), ext)

	dst, err := os.Create(tempFilePath)
	if err != nil {
		return "", fmt.Errorf("gagal membuat file sementara: %w", err)
	}

	// 4. Salin file
	if _, err = io.Copy(dst, src); err != nil {
		dst.Close()
		os.Remove(tempFilePath)
		return "", fmt.Errorf("gagal menyimpan file sementara: %w", err)
	}
	dst.Close()

	// 5. Jadwalkan penghapusan
	defer func() {
		log.Println("Menghapus file sementara:", tempFilePath)
		os.Remove(tempFilePath)
	}()

	// 6. --- TAHAP MODERASI (PENTING) ---
	// (Panggil Google Cloud Vision / AWS Rekognition Anda di sini)
	// isSafe, err := runModeration(tempFilePath)
	// if err != nil || !isSafe {
	//     return "", fmt.Errorf("konten foto dilarang")
	// }
	// log.Println("Moderasi AI lolos.")

	// 7. Upload ke Pinata
	log.Println("Mengunggah", tempFilePath, "ke Pinata...")
	pinataResp, err := utils.UploadToPinata(tempFilePath)
	if err != nil {
		log.Printf("Gagal upload ke Pinata: %v", err)
		return "", fmt.Errorf("gagal mengunggah ke IPFS: %w", err)
	}

	// Buat URL IPFS yang benar
	thumbnailUrl := fmt.Sprintf("https://white-lazy-marten-351.mypinata.cloud/ipfs/%s", pinataResp.IpfsHash)
	log.Println("Berhasil di-pin ke Pinata:", thumbnailUrl)

	return thumbnailUrl, nil
}

// @Summary     Mint NFT Moment (Gratis)
// @Description Minting 'NFTMoment' (UGC) gratis. Endpoint ini menerima 'multipart/form-data'.
// @Tags        Moments
// @Accept      multipart/form-data
// @Produce     json
// @Param       recipient   formData string true "Alamat Flow penerima (misal: 0x...)"
// @Param       name        formData string true "Nama untuk NFT Moment"
// @Param       description formData string false "Deskripsi untuk NFT Moment"
// @Param       thumbnail   formData file   true "File gambar (JPG/PNG/WEBP) untuk Momen UGC"
// @Success     201 {object} swagdto.MintResponse "Minting sukses"
// @Failure     400 {object} APIResponse "Input tidak valid (field wajib hilang)"
// @Failure     500 {object} APIResponse "Internal Server Error (upload/transaksi gagal)"
// @Router      /moment/free [post]
func (h *Handler) freeMintMoment(c echo.Context) error {
	// 1. Ambil data TEKS
	recipient := c.FormValue("recipient")
	name := c.FormValue("name")
	description := c.FormValue("description")

	// 2. Validasi
	if recipient == "" || name == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "recipient dan name adalah field wajib"})
	}

	// 3. Panggil helper untuk 'pekerjaan kotor' (upload)
	thumbnailUrl, err := h.handleUGCUpload(c)
	if err != nil {
		// handleUGCUpload sudah mem-format error-nya
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	// 4. Panggil transaksi
	err = transactions.FreeMintNFTMoment(
		recipient,
		name,
		description,
		thumbnailUrl,
	)
	if err != nil {
		log.Printf("Gagal menjalankan transaksi mint: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	// 5. Kirim respon sukses
	return c.JSON(http.StatusCreated, map[string]string{
		"message":   "NFT minted successfully!",
		"recipient": recipient,
		"name":      name,
		"thumbnail": thumbnailUrl,
	})
}

// @Summary     Mint NFT Moment (dengan Event Pass)
// @Description Minting 'NFTMoment' (UGC) dengan 'membakar' (menggunakan) 'EventPass' (SBT). Endpoint ini menerima 'multipart/form-data'.
// @Tags        Moments
// @Accept      multipart/form-data
// @Produce     json
// @Param       recipient   formData string true "Alamat Flow penerima (misal: 0x...)"
// @Param       eventPassID formData string true "ID dari EventPass (SBT) yang akan digunakan"
// @Param       tier        formData string false "Tingkatan (tier) dari Momen 0 untuk community 1 untuk pro"
// @Param       name        formData string true "Nama untuk NFT Moment"
// @Param       description formData string false "Deskripsi untuk NFT Moment"
// @Param       thumbnail   formData file   true "File gambar (JPG/PNG/WEBP) untuk Momen UGC"
// @Success     201 {object} swagdto.MintResponse "Minting sukses"
// @Failure     400 {object} APIResponse "Input tidak valid (field wajib hilang)"
// @Failure     500 {object} APIResponse "Internal Server Error (upload/transaksi gagal)"
// @Router      /moment/with-event-pass [post]
func (h *Handler) mintMomentWithEventPass(c echo.Context) error {
	// 1. Ambil data TEKS
	recipient := c.FormValue("recipient")
	eventPassID := c.FormValue("eventPassID")
	tier := c.FormValue("tier")
	name := c.FormValue("name")
	description := c.FormValue("description")

	// 2. Validasi
	if recipient == "" || name == "" || eventPassID == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "recipient, name, dan eventPassID adalah field wajib"})
	}

	// 3. Panggil helper untuk 'pekerjaan kotor' (upload)
	thumbnailUrl, err := h.handleUGCUpload(c)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	// 4. Panggil transaksi
	err = transactions.MintNFTMomentWithEventPass(
		recipient,
		eventPassID,
		name,
		description,
		thumbnailUrl,
		tier,
	)
	if err != nil {
		log.Printf("Gagal menjalankan transaksi mint-with-pass: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	// 5. Kirim respon sukses
	return c.JSON(http.StatusCreated, map[string]string{
		"message":   "NFT minted with Event Pass successfully!",
		"recipient": recipient,
		"name":      name,
		"thumbnail": thumbnailUrl,
	})
}

// @Summary     Ambil Daftar Penjualan (Listings)
// @Description Mengambil daftar semua NFT yang dijual di marketplace, mendukung pagination dan filter.
// @Tags        Marketplace
// @Accept      json
// @Produce     json
// @Param       seller_address query    string  false  "Filter berdasarkan alamat penjual (misal: 0x...)"
// @Param       page           query    int     false  "Nomor Halaman (default: 1)"
// @Param       pageSize       query    int     false  "Jumlah item per halaman (default: 20)"
// @Success     200 {object} swagdto.GetListingsResponse "Daftar penjualan berhasil diambil"
// @Failure     500 {object} APIResponse "Internal Server Error"
// @Router      /listings [get]
func (h *Handler) getListings(c echo.Context) error {
	ctx := c.Request().Context()

	// 1. Dapatkan parameter pagination
	limit, offset, page, pageSize := getPagination(c)

	// 2. Siapkan query dasar
	query := h.DB.Listing.Query()

	// 3. Terapkan Filter (jika ada)
	sellerAddress := c.QueryParam("seller_address")
	if sellerAddress != "" {
		query = query.Where(
			listing.HasSellerWith(user.AddressEQ(sellerAddress)),
		)
	}

	// 4. HITUNG TOTAL ITEM (PENTING!)
	// Jalankan query COUNT() SEBELUM Limit/Offset
	totalItems, err := query.Count(ctx)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, APIResponse{Error: err.Error()})
	}

	// 5. Buat Metadata Pagination
	totalPages := int(math.Ceil(float64(totalItems) / float64(pageSize)))
	pagination := &Pagination{
		TotalItems:  totalItems,
		TotalPages:  totalPages,
		CurrentPage: page,
		PageSize:    pageSize,
	}

	// 6. Jalankan Query UTAMA dengan Limit/Offset
	listings, err := query.
		WithSeller().
		WithNftAccessory().
		Limit(limit).
		Offset(offset).
		Order(ent.Desc("id")).
		All(ctx)

	if err != nil {
		return c.JSON(http.StatusInternalServerError, APIResponse{Error: err.Error()})
	}

	// 7. Kembalikan Respon Standar (Terbungkus)
	response := APIResponse{
		Data:       listings,
		Pagination: pagination,
	}
	return c.JSON(http.StatusOK, response)
}

// @Summary     Ambil Daftar Event (Paginated)
// @Description Mengambil daftar semua event yang ada di platform, dengan pagination dan filter.
// @Tags        Events
// @Accept      json
// @Produce     json
// @Param       type       query    int     false  "Filter berdasarkan Tipe Event (0 = Online, 1 = Offline)"
// @Param       page       query    int     false  "Nomor Halaman (default: 1)"
// @Param       pageSize   query    int     false  "Jumlah item per halaman (default: 20)"
// @Success     200 {object} swagdto.GetEventsResponse "Daftar event berhasil diambil"
// @Failure     500 {object} APIResponse "Internal Server Error"
// @Router      /events [get]
func (h *Handler) getEvents(c echo.Context) error {
	ctx := c.Request().Context()

	// 1. Dapatkan parameter pagination lengkap
	limit, offset, page, pageSize := getPagination(c)

	// 2. Siapkan query dasar
	query := h.DB.Event.Query()

	// 3. Terapkan Filter (kode Anda sudah benar)
	eventTypeParam := c.QueryParam("type")
	if eventTypeParam != "" {
		eventType, err := strconv.Atoi(eventTypeParam)
		if err == nil { // Abaikan jika 'type' bukan angka
			query = query.Where(event.EventTypeEQ(uint8(eventType)))
		}
	}
	// (Anda bisa menambahkan filter lain di sini)

	// 4. HITUNG TOTAL ITEM (PENTING!)
	// Jalankan query COUNT() SEBELUM Limit/Offset
	totalItems, err := query.Count(ctx)
	if err != nil {
		// Gunakan 'APIResponse' untuk error
		return c.JSON(http.StatusInternalServerError, APIResponse{Error: err.Error()})
	}

	// 5. Buat Metadata Pagination
	totalPages := int(math.Ceil(float64(totalItems) / float64(pageSize)))
	pagination := &Pagination{
		TotalItems:  totalItems,
		TotalPages:  totalPages,
		CurrentPage: page,
		PageSize:    pageSize,
	}

	// 6. Jalankan Query UTAMA dengan Limit/Offset
	events, err := query.
		WithHost(). // Ambil data 'User' (host)
		// WithAttendances(). // Hati-hati: 'Eager loading' ini bisa sangat berat jika ada 1000 peserta
		Limit(limit).
		Offset(offset).
		Order(ent.Desc("start_date")). // Urutkan dari yang paling baru
		All(ctx)

	if err != nil {
		return c.JSON(http.StatusInternalServerError, APIResponse{Error: err.Error()})
	}

	// 7. Kembalikan Respon Standar (Terbungkus)
	response := GetEventsResponse{
		Data:       events,
		Pagination: pagination,
	}
	return c.JSON(http.StatusOK, response)
}

// @Summary     Ambil Profil User (Lengkap)
// @Description Mengambil semua data profil untuk satu 'address', termasuk semua aset yang di-'eager load'.
// @Tags        Profiles
// @Accept      json
// @Produce     json
// @Param       address   path     string  true   "Alamat Flow pengguna (misal: 0x...)"
// @Success     200 {object} swagdto.GetUserProfileResponse "Profil pengguna berhasil diambil"
// @Failure     400 {object} APIResponse "Format alamat salah"
// @Failure     404 {object} APIResponse "User (pemilik) tidak ditemukan"
// @Failure     500 {object} APIResponse "Internal Server Error"
// @Router      /profiles/{address} [get]
func (h *Handler) getUserProfile(c echo.Context) error {
	ctx := c.Request().Context()
	address := c.Param("address") // Ambil ':address' dari URL

	if address == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "address is required"})
	}

	// Ambil 'User' dan SEMUA relasinya dalam satu query
	user, err := h.DB.User.Query().
		Where(user.AddressEQ(address)).
		// Eager load semua data yang terkait dengan User ini
		WithMoments().      // Ambil 10 momen terakhir (contoh pagination)
		WithAccessories().  // Ambil 10 aksesoris terakhir
		WithEventPasses().  // Ambil 10 pass terakhir
		WithHostedEvents(). // Ambil 10 event yang di-host
		WithListings().     // Ambil 10 listing terakhir
		Only(ctx)

	if err != nil {
		if ent.IsNotFound(err) {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "User profile not found"})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	// (Anda bisa menambahkan pagination kustom untuk 'moments', 'accessories', dll.
	// di sini jika Anda tidak ingin 'eager load' semuanya)

	return c.JSON(http.StatusOK, APIResponse{Data: user})
}

// @Summary     Check-in User ke Event (Admin)
// @Description Mencatat check-in untuk seorang user di sebuah event. Ini harus dipanggil oleh admin/backend.
// @Description Menerima 'application/json' ATAU 'multipart/form-data'.
// @Tags        Events
// @Accept      json,multipart/form-data
// @Produce     json
// @Param       body body     CheckInRequest true "Alamat User dan ID Event"
// @Success     200 {object} APIResponse{data=swagdto.CheckInDataResponse} "User berhasil check-in"
// @Failure     400 {object} APIResponse "Input tidak valid"
// @Failure     500 {object} APIResponse "Internal Server Error (misal: tx gagal)"
// @Router      /event/check-in [post]
func (h *Handler) checkInUser(c echo.Context) error {

	// 1. Siapkan variabel
	req := new(CheckInRequest)

	// 2. 'Bind' (Ikat) Request
	// Ini adalah cara ajaib Echo:
	// - Jika Content-Type adalah JSON, ia akan membaca 'json:"..."'
	// - Jika Content-Type adalah form-data, ia akan membaca 'form:"..."'
	if err := c.Bind(req); err != nil {
		log.Println("Error binding request:", err)
		return c.JSON(http.StatusBadRequest, APIResponse{Error: "Invalid request body: " + err.Error()})
	}

	// 3. Validasi Input
	if req.UserAddress == "" || req.EventID == "" {
		return c.JSON(http.StatusBadRequest, APIResponse{Error: "userAddress dan eventID adalah field wajib"})
	}

	// 4. Konversi Tipe (Form data selalu string)
	eventID, err := strconv.ParseUint(req.EventID, 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, APIResponse{Error: "eventID harus berupa angka (UInt64)"})
	}

	// 5. Panggil Fungsi Transaksi (dari 'checkin_transaction.go')
	err = transactions.UserCheckin(eventID, req.UserAddress)

	// 6. Tangani hasilnya
	if err != nil {
		log.Printf("Gagal menjalankan transaksi check-in: %v", err)
		// Kirim 'APIResponse' standar kita
		return c.JSON(http.StatusInternalServerError, APIResponse{Error: err.Error()})
	}

	// 7. Kirim Respon Sukses (Gunakan 'APIResponse')
	return c.JSON(http.StatusOK, APIResponse{
		Data: map[string]string{
			"message":     "User checked in successfully!",
			"userAddress": req.UserAddress,
			"eventID":     req.EventID,
		},
	})
}

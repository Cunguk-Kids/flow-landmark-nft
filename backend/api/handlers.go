package main

import (
	"backend/ent"
	"backend/ent/attendance"
	"backend/ent/comment"
	"backend/ent/event"
	"backend/ent/eventpass"
	"backend/ent/like"
	"backend/ent/listing"
	"backend/ent/nftaccessory"
	"backend/ent/nftmoment"
	"backend/ent/user"
	"backend/swagdto"
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

type MomentResponse struct {
	*ent.NFTMoment
	IsLiked      bool `json:"is_liked"`
	LikeCount    int  `json:"like_count"`
	CommentCount int  `json:"comment_count"`
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

	// Filter by NFT ID
	nftIDStr := c.QueryParam("nft_id")
	if nftIDStr != "" {
		nftID, err := strconv.ParseUint(nftIDStr, 10, 64)
		if err == nil {
			query = query.Where(nftmoment.NftIDEQ(nftID))
		}
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

	// 6.5 Cek 'IsLiked' jika ada viewer
	viewerAddress := c.QueryParam("viewer")
	likedMomentIDs := make(map[uint64]bool)

	if viewerAddress != "" {
		// Cari User ID dari viewer
		viewer, err := h.DB.User.Query().Where(user.AddressEQ(viewerAddress)).Only(ctx)
		if err == nil {
			// Ambil semua ID moment yang di-like user ini, yang ada di list 'moments'
			// (Optimasi: Filter 'moment_id' IN [moments IDs])
			var momentIDs []uint64
			for _, m := range moments {
				momentIDs = append(momentIDs, m.NftID) // Note: Relasi Like pakai ID internal atau NftID?
				// Schema Like: edge 'moment' ref 'likes'. Edge pakai ID internal ent.
				// Jadi kita butuh ID internal moment (m.ID)
			}

			// Ambil ID internal moment
			var internalIDs []int
			for _, m := range moments {
				internalIDs = append(internalIDs, m.ID)
			}

			likes, err := h.DB.Like.Query().
				Where(
					like.HasUserWith(user.IDEQ(viewer.ID)),
					like.HasMomentWith(nftmoment.IDIn(internalIDs...)),
				).
				WithMoment().
				All(ctx)

			if err == nil {
				for _, l := range likes {
					if l.Edges.Moment != nil {
						likedMomentIDs[uint64(l.Edges.Moment.ID)] = true
					}
				}
			}
		}
	}

	// Mapping ke MomentResponse
	var data []MomentResponse
	for _, m := range moments {
		lCount, _ := m.QueryLikes().Count(ctx)
		cCount, _ := m.QueryComments().Count(ctx)

		data = append(data, MomentResponse{
			NFTMoment:    m,
			IsLiked:      likedMomentIDs[uint64(m.ID)],
			LikeCount:    lCount,
			CommentCount: cCount,
		})
	}

	// 7. Kembalikan Respon Standar (Terbungkus)
	response := APIResponse{
		Data:       data,
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
		WithOwner().
		WithEquippedOnMoment().
		WithListing().
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

	// 2.5. Cek apakah user sudah pernah free mint
	user, err := h.DB.User.Query().Where(user.AddressEQ(recipient)).Only(c.Request().Context())
	if err != nil {
		if ent.IsNotFound(err) {
			// Jika user belum ada, kita bisa buatkan (atau return error suruh register dulu)
			// Untuk amannya, kita return error agar user register/login dulu
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "User not found. Please login/register first."})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	if user.IsFreeMinted {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "You have already used your free mint quota."})
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

	// 4.5. Update status free mint user
	_, err = user.Update().SetIsFreeMinted(true).Save(c.Request().Context())
	if err != nil {
		log.Printf("Gagal update status free mint user %s: %v", recipient, err)
		// Kita tidak return error ke user karena minting on-chain sudah sukses
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
	if tier == "" {
		tier = "0"
	}
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
		WithAttendances().
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

// @Summary     Ambil Detail Event
// @Description Mengambil satu event berdasarkan 'event_id' (ID on-chain).
// @Tags        Events
// @Accept      json
// @Produce     json
// @Param       id   path      int  true  "Event ID (On-Chain ID)"
// @Param       viewer   query      string  false  "userAddress"
// @Success     200 {object} APIResponse{data=swagdto.EventResponse} "Detail event"
// @Failure     404 {object} APIResponse "Event tidak ditemukan"
// @Failure     500 {object} APIResponse "Internal Server Error"
// @Router      /events/{id} [get]
func (h *Handler) getEventByID(c echo.Context) error {
	ctx := c.Request().Context()
	idStr := c.Param("id")
	viewerAddress := c.QueryParam("viewer")

	// 1. Parse ID
	eventID, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, APIResponse{Error: "Invalid Event ID format"})
	}

	// 2. Query Database
	ev, err := h.DB.Event.Query().
		Where(event.EventIDEQ(eventID)). // Cari berdasarkan event_id (bukan ID internal)
		WithHost().
		WithAttendances(func(q *ent.AttendanceQuery) {
			q.WithUser() // Agar kita tahu siapa yang hadir (Address)
		}). // Preload Host
		Only(ctx)

	if err != nil {
		if ent.IsNotFound(err) {
			return c.JSON(http.StatusNotFound, APIResponse{Error: "Event not found"})
		}
		return c.JSON(http.StatusInternalServerError, APIResponse{Error: err.Error()})
	}

	isRegistered := false

	// Hanya cek jika viewerAddress dikirim
	if viewerAddress != "" {
		// Cek apakah ada 'Attendance' yang menghubungkan Event ini dengan User ini
		count, _ := h.DB.Attendance.Query().
			Where(
				attendance.HasEventWith(event.EventIDEQ(ev.EventID)),
				attendance.HasUserWith(user.AddressEQ(viewerAddress)),
			).
			Count(ctx)

		if count > 0 {
			isRegistered = true
		}
	}

	// 3. Mapping ke DTO Bersih (Sama seperti getEvents)
	// Kita pakai struct dari 'swagdto' atau struct lokal 'EventResponse' di handlers.go
	// (Asumsi Anda menaruh struct EventResponse di handlers.go atau import dari swagdto)

	// Konversi Host
	var hostResponse *swagdto.HostResponse
	if ev.Edges.Host != nil {
		hostResponse = &swagdto.HostResponse{
			ID:      ev.Edges.Host.ID,
			Address: ev.Edges.Host.Address,
		}
	}

	var attendanceResponses []*swagdto.AttendanceResponse
	for _, att := range ev.Edges.Attendances {

		// Ambil address user jika ada
		userAddr := ""
		if att.Edges.User != nil {
			userAddr = att.Edges.User.Address
		}

		attendanceResponses = append(attendanceResponses, &swagdto.AttendanceResponse{
			ID:               att.ID,
			CheckedIn:        att.CheckedIn,
			RegistrationTime: att.RegistrationTime.String(),
			UserAddress:      userAddr,
		})
	}

	response := &swagdto.EventResponse{
		ID:           ev.ID,
		EventID:      ev.EventID,
		Name:         ev.Name,
		Description:  ev.Description,
		Thumbnail:    ev.Thumbnail,
		Location:     ev.Location,
		StartDate:    ev.StartDate,
		EndDate:      ev.EndDate,
		Quota:        ev.Quota,
		IsRegistered: isRegistered,
		Edges: swagdto.EventEdges{
			Host:        hostResponse,
			Attendances: attendanceResponses,
		},
	}

	// 4. Return Single Object
	return c.JSON(http.StatusOK, APIResponse{
		Data: response,
	})
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

// @Summary     Ambil Daftar Event Pass (SBT)
// @Description Mengambil daftar Event Pass (Proof of Attendance). Mendukung filter owner_address untuk melihat koleksi user tertentu.
// @Tags        EventPass
// @Accept      json
// @Produce     json
// @Param       owner_address query    string  false  "Filter berdasarkan alamat pemilik (misal: 0x...)"
// @Param       page          query    int     false  "Nomor Halaman (default: 1)"
// @Param       pageSize      query    int     false  "Jumlah item per halaman (default: 20)"
// @Success     200 {object} my-project/backend/swagdto.GetEventPassesResponse "Data berhasil diambil"
// @Failure     500 {object} APIResponse "Internal Server Error"
// @Router      /event-passes [get]
func (h *Handler) getEventPasses(c echo.Context) error {
	ctx := c.Request().Context()
	limit, offset, page, pageSize := getPagination(c)

	query := h.DB.EventPass.Query()

	// 1. Filter by Owner Address
	ownerAddress := c.QueryParam("owner_address")
	if ownerAddress != "" {
		query = query.Where(
			eventpass.HasOwnerWith(user.AddressEQ(ownerAddress)),
		)
	}

	// 2. Hitung Total
	totalItems, err := query.Count(ctx)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, APIResponse{Error: err.Error()})
	}

	// 3. Query Data dengan Eager Loading
	passes, err := query.
		WithOwner().
		WithEvent().
		WithMoment(). // Cek apakah sudah dipakai minting moment
		Limit(limit).
		Offset(offset).
		Order(ent.Desc("id")). // Terbaru dulu
		All(ctx)

	if err != nil {
		return c.JSON(http.StatusInternalServerError, APIResponse{Error: err.Error()})
	}

	// 4. Mapping ke DTO (swagdto)
	// (Kita lakukan manual mapping agar swagger konsisten)
	dtos := make([]*swagdto.DTOEventPass, len(passes))
	for i, p := range passes {
		var ownerDto *swagdto.DTOUser
		if p.Edges.Owner != nil {
			ownerDto = &swagdto.DTOUser{ID: p.Edges.Owner.ID, Address: p.Edges.Owner.Address}
		}

		var eventDto *swagdto.EventResponse
		if p.Edges.Event != nil {
			eventDto = &swagdto.EventResponse{
				ID:        p.Edges.Event.ID,
				EventID:   p.Edges.Event.EventID,
				Name:      p.Edges.Event.Name,
				Thumbnail: p.Edges.Event.Thumbnail,
				StartDate: p.Edges.Event.StartDate,
				Quota:     p.Edges.Event.Quota,
			}
		}

		var momentDto *swagdto.MomentResponse
		if p.Edges.Moment != nil {
			momentDto = &swagdto.MomentResponse{
				ID:        p.Edges.Moment.ID,
				NftID:     p.Edges.Moment.NftID,
				Name:      p.Edges.Moment.Name,
				Thumbnail: p.Edges.Moment.Thumbnail,
			}
		}

		dtos[i] = &swagdto.DTOEventPass{
			ID:          p.ID,
			PassID:      p.PassID,
			Name:        p.Name,
			Description: p.Description,
			Thumbnail:   p.Thumbnail,
			EventType:   p.EventType,
			IsRedeemed:  p.IsUsed,
			Edges: swagdto.DTOEventPassEdges{
				Owner:  ownerDto,
				Event:  eventDto,
				Moment: momentDto,
			},
		}
	}

	// 5. Return Response
	return c.JSON(http.StatusOK, swagdto.GetEventPassesResponse{
		Data: dtos,
		Pagination: &swagdto.Pagination{
			TotalItems:  totalItems,
			TotalPages:  int(math.Ceil(float64(totalItems) / float64(pageSize))),
			CurrentPage: page,
			PageSize:    pageSize,
		},
	})
}

// @Summary     Ambil Detail Event Pass
// @Description Mengambil detail satu Event Pass berdasarkan 'pass_id' (ID On-Chain).
// @Tags        EventPass
// @Accept      json
// @Produce     json
// @Param       id   path      int  true  "Pass ID (On-Chain ID)"
// @Success     200 {object} my-project/backend/swagdto.GetEventPassDetailResponse "Detail pass berhasil diambil"
// @Failure     404 {object} APIResponse "Event Pass tidak ditemukan"
// @Failure     500 {object} APIResponse "Internal Server Error"
// @Router      /event-passes/{id} [get]

func (h *Handler) getEventPassByID(c echo.Context) error {
	ctx := c.Request().Context()
	idStr := c.Param("id")

	// Parse ID (PassID on-chain adalah uint64)
	passID, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, APIResponse{Error: "Invalid Pass ID format"})
	}

	// Query
	p, err := h.DB.EventPass.Query().
		Where(eventpass.PassIDEQ(passID)). // Cari berdasarkan PassID on-chain
		WithOwner().
		WithEvent().
		WithMoment().
		Only(ctx)

	if err != nil {
		if ent.IsNotFound(err) {
			return c.JSON(http.StatusNotFound, APIResponse{Error: "Event Pass not found"})
		}
		return c.JSON(http.StatusInternalServerError, APIResponse{Error: err.Error()})
	}

	// Mapping Single DTO
	var ownerDto *swagdto.DTOUser
	if p.Edges.Owner != nil {
		ownerDto = &swagdto.DTOUser{ID: p.Edges.Owner.ID, Address: p.Edges.Owner.Address}
	}

	var eventDto *swagdto.EventResponse
	if p.Edges.Event != nil {
		eventDto = &swagdto.EventResponse{
			ID:        p.Edges.Event.ID,
			EventID:   p.Edges.Event.EventID,
			Name:      p.Edges.Event.Name,
			Thumbnail: p.Edges.Event.Thumbnail,
			StartDate: p.Edges.Event.StartDate,
		}
	}

	var momentDto *swagdto.MomentResponse
	if p.Edges.Moment != nil {
		momentDto = &swagdto.MomentResponse{
			ID:        p.Edges.Moment.ID,
			NftID:     p.Edges.Moment.NftID,
			Name:      p.Edges.Moment.Name,
			Thumbnail: p.Edges.Moment.Thumbnail,
		}
	}

	response := &swagdto.DTOEventPass{
		ID:         p.ID,
		PassID:     p.PassID,
		IsRedeemed: p.IsUsed,
		Edges: swagdto.DTOEventPassEdges{
			Owner:  ownerDto,
			Event:  eventDto,
			Moment: momentDto,
		},
	}

	return c.JSON(http.StatusOK, swagdto.GetEventPassDetailResponse{
		Data: response,
	})
}

func mapUserToDTO(u *ent.User) *swagdto.DTOUserProfile {

	// 1. Map Moments
	var moments []*swagdto.MomentResponse
	for _, m := range u.Edges.Moments {
		moments = append(moments, &swagdto.MomentResponse{
			ID:        m.ID,
			NftID:     m.NftID,
			Name:      m.Name,
			Thumbnail: m.Thumbnail,
			// (Edges moment bisa disederhanakan di sini untuk mencegah circular loop atau load berlebih)
		})
	}

	// 2. Map Accessories
	var accessories []*swagdto.DTOAccessory
	for _, a := range u.Edges.Accessories {
		accessories = append(accessories, &swagdto.DTOAccessory{
			ID:        a.ID,
			NftID:     a.NftID,
			Name:      a.Name,
			Thumbnail: a.Thumbnail,
		})
	}

	// 3. Map EventPasses
	var passes []*swagdto.DTOEventPass
	for _, p := range u.Edges.EventPasses {
		passes = append(passes, &swagdto.DTOEventPass{
			ID:         p.ID,
			PassID:     p.PassID,
			IsRedeemed: p.IsUsed,
		})
	}

	// 4. Map Hosted Events
	var hostedEvents []*swagdto.EventResponse
	for _, e := range u.Edges.HostedEvents {
		hostedEvents = append(hostedEvents, &swagdto.EventResponse{
			ID:        e.ID,
			EventID:   e.EventID,
			Name:      e.Name,
			Thumbnail: e.Thumbnail,
			StartDate: e.StartDate,
		})
	}

	// 5. Construct DTO User
	return &swagdto.DTOUserProfile{
		ID:                      u.ID,
		Address:                 u.Address,
		Nickname:                u.Nickname,
		Bio:                     u.Bio,
		Pfp:                     u.Pfp,
		ShortDescription:        u.ShortDescription,
		BgImage:                 u.BgImage,
		HighlightedEventPassIds: u.HighlightedEventPassIds,
		HighlightedMomentID:     u.HighlightedMomentID,
		Socials:                 u.Socials,
		IsFreeMinted:            u.IsFreeMinted,
		Edges: swagdto.DTOUserProfileEdges{
			Moments:      moments,
			Accessories:  accessories,
			EventPasses:  passes,
			HostedEvents: hostedEvents,
			// Listings: ... (tambahkan jika perlu)
		},
	}
}

// --- HANDLERS ---

// @Summary     Ambil Daftar User (Search People)
// @Description Mengambil daftar pengguna di platform. Mendukung pagination dan pencarian sederhana by address.
// @Tags        Profiles
// @Accept      json
// @Produce     json
// @Param       address    query    string  false  "Cari berdasarkan sebagian alamat (misal: 0x12...)"
// @Param       page       query    int     false  "Nomor Halaman (default: 1)"
// @Param       pageSize   query    int     false  "Jumlah item per halaman (default: 20)"
// @Success     200 {object} swagdto.GetUsersResponse "Daftar user berhasil diambil"
// @Failure     500 {object} APIResponse "Internal Server Error"
// @Router      /users [get]
func (h *Handler) getUsers(c echo.Context) error {
	ctx := c.Request().Context()
	limit, offset, page, pageSize := getPagination(c)

	query := h.DB.User.Query()

	// Filter sederhana (Search by Address)
	addressSearch := c.QueryParam("address")
	if addressSearch != "" {
		// Contains (case-insensitive biasanya ditangani DB, tapi address flow case-sensitive)
		query = query.Where(user.AddressContains(addressSearch))
	}

	// Hitung Total
	totalItems, err := query.Count(ctx)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, APIResponse{Error: err.Error()})
	}

	// Query Data (Dengan Eager Loading Relasi)
	users, err := query.
		WithMoments().
		WithAccessories().
		WithEventPasses().
		WithHostedEvents().
		Limit(limit).
		Offset(offset).
		Order(ent.Desc("id")). // User terbaru dulu
		All(ctx)

	if err != nil {
		return c.JSON(http.StatusInternalServerError, APIResponse{Error: err.Error()})
	}

	// Mapping ke DTO
	dtos := make([]*swagdto.DTOUserProfile, len(users))
	for i, u := range users {
		dtos[i] = mapUserToDTO(u)
	}

	// Response
	return c.JSON(http.StatusOK, swagdto.GetUsersResponse{
		Data: dtos,
		Pagination: &swagdto.Pagination{
			TotalItems:  totalItems,
			TotalPages:  int(math.Ceil(float64(totalItems) / float64(pageSize))),
			CurrentPage: page,
			PageSize:    pageSize,
		},
	})
}

// @Summary     Ambil Detail Profil User (By Address)
// @Description Mengambil detail profil pengguna berdasarkan alamat wallet.
// @Tags        Profiles
// @Accept      json
// @Produce     json
// @Param       address    path     string  true   "Alamat Wallet User (0x...)"
// @Success     200 {object} swagdto.GetUserProfileResponse "User ditemukan"
// @Failure     404 {object} APIResponse "User tidak ditemukan"
// @Failure     500 {object} APIResponse "Internal Server Error"
// @Router      /users/{address} [get]
func (h *Handler) getUserByAddress(c echo.Context) error {
	ctx := c.Request().Context()
	address := c.Param("address")

	if address == "" {
		return c.JSON(http.StatusBadRequest, APIResponse{Error: "Address wajib diisi"})
	}

	// Query Single User
	u, err := h.DB.User.Query().
		Where(user.AddressEQ(address)).
		WithMoments().
		WithAccessories().
		WithEventPasses().
		WithHostedEvents().
		Only(ctx)

	if err != nil {
		if ent.IsNotFound(err) {
			return c.JSON(http.StatusNotFound, APIResponse{Error: "User tidak ditemukan"})
		}
		return c.JSON(http.StatusInternalServerError, APIResponse{Error: err.Error()})
	}

	// Mapping & Response
	return c.JSON(http.StatusOK, swagdto.GetUserProfileResponse{
		Data: mapUserToDTO(u),
	})
}

// @Summary     Cari User (Search Bar)
// @Description Mencari user berdasarkan sebagian Address ATAU Nickname. Cocok untuk fitur 'live search' dengan debounce.
// @Tags        Profiles
// @Accept      json
// @Produce     json
// @Param       q          query    string  true   "Kata kunci pencarian (0x... atau nama)"
// @Param       page       query    int     false  "Nomor Halaman (default: 1)"
// @Param       pageSize   query    int     false  "Jumlah item per halaman (default: 10)"
// @Success     200 {object} swagdto.GetUsersResponse "Hasil pencarian"
// @Failure     400 {object} APIResponse "Query kosong"
// @Failure     500 {object} APIResponse "Internal Server Error"
// @Router      /users/search [get]
func (h *Handler) searchUsers(c echo.Context) error {
	ctx := c.Request().Context()
	limit, offset, page, pageSize := getPagination(c)

	// 1. Ambil query param 'q'
	searchTerm := c.QueryParam("q")
	if searchTerm == "" {
		// Jika kosong, kembalikan list kosong (atau error, tergantung selera UX)
		return c.JSON(http.StatusOK, swagdto.GetUsersResponse{
			Data:       []*swagdto.DTOUserProfile{},
			Pagination: &swagdto.Pagination{CurrentPage: 1, PageSize: pageSize},
		})
	}

	// 2. Siapkan Query Dasar
	query := h.DB.User.Query().
		Where(
			// LOGIKA PENCARIAN: Address COCOK -ATAU- Nickname COCOK
			user.Or(
				user.AddressContains(searchTerm),      // Case-sensitive (biasanya address flow lowercase)
				user.NicknameContainsFold(searchTerm), // Case-INSENSITIVE (untuk nama)
			),
		)

	// 3. Hitung Total (untuk pagination)
	totalItems, err := query.Count(ctx)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, APIResponse{Error: err.Error()})
	}

	// 4. Ambil Data dengan Relasi
	users, err := query.
		WithMoments().
		WithAccessories().
		WithEventPasses().
		WithHostedEvents().
		Limit(limit).
		Offset(offset).
		Order(ent.Desc("id")). // Relevansi bisa diatur, tapi ID desc cukup untuk sekarang
		All(ctx)

	if err != nil {
		return c.JSON(http.StatusInternalServerError, APIResponse{Error: err.Error()})
	}

	// 5. Mapping ke DTO (Gunakan helper yang sudah kita buat)
	dtos := make([]*swagdto.DTOUserProfile, len(users))
	for i, u := range users {
		dtos[i] = mapUserToDTO(u)
	}

	// 6. Return Response
	return c.JSON(http.StatusOK, swagdto.GetUsersResponse{
		Data: dtos,
		Pagination: &swagdto.Pagination{
			TotalItems:  totalItems,
			TotalPages:  int(math.Ceil(float64(totalItems) / float64(pageSize))),
			CurrentPage: page,
			PageSize:    pageSize,
		},
	})
}

// @Summary     Toggle Like Moment
// @Description Like atau Unlike sebuah moment.
// @Tags        Social
// @Accept      json
// @Produce     json
// @Param       id   path      int  true  "Moment ID (Internal ID)"
// @Param       user query     string true  "User Address (0x...)"
// @Success     200 {object} APIResponse "Success"
// @Router      /moments/{id}/like [post]
func (h *Handler) toggleLike(c echo.Context) error {
	ctx := c.Request().Context()
	idStr := c.Param("id")
	userAddress := c.QueryParam("user")

	if userAddress == "" {
		return c.JSON(http.StatusBadRequest, APIResponse{Error: "User address is required"})
	}

	momentID, err := strconv.Atoi(idStr)
	if err != nil {
		return c.JSON(http.StatusBadRequest, APIResponse{Error: "Invalid Moment ID"})
	}

	// 1. Get User ID
	u, err := h.DB.User.Query().Where(user.AddressEQ(userAddress)).Only(ctx)
	if err != nil {
		return c.JSON(http.StatusNotFound, APIResponse{Error: "User not found"})
	}

	// 2. Check if already liked
	existingLike, err := h.DB.Like.Query().
		Where(
			like.HasUserWith(user.IDEQ(u.ID)),
			like.HasMomentWith(nftmoment.IDEQ(momentID)),
		).
		Only(ctx)

	if err != nil && !ent.IsNotFound(err) {
		return c.JSON(http.StatusInternalServerError, APIResponse{Error: err.Error()})
	}

	if existingLike != nil {
		// Unlike
		err = h.DB.Like.DeleteOne(existingLike).Exec(ctx)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, APIResponse{Error: err.Error()})
		}
		return c.JSON(http.StatusOK, APIResponse{Data: map[string]bool{"liked": false}})
	} else {
		// Like
		_, err = h.DB.Like.Create().
			SetUser(u).
			SetMomentID(momentID).
			Save(ctx)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, APIResponse{Error: err.Error()})
		}
		return c.JSON(http.StatusOK, APIResponse{Data: map[string]bool{"liked": true}})
	}
}

// @Summary     Create Comment
// @Description Membuat komentar baru pada sebuah moment.
// @Tags        Social
// @Accept      json
// @Produce     json
// @Param       id   path      int  true  "Moment ID (Internal ID)"
// @Param       body body      CreateCommentRequest true "Comment Content & User Address"
// @Success     201 {object} APIResponse "Comment created"
// @Router      /moments/{id}/comments [post]
func (h *Handler) createComment(c echo.Context) error {
	ctx := c.Request().Context()
	idStr := c.Param("id")
	momentID, err := strconv.Atoi(idStr)
	if err != nil {
		return c.JSON(http.StatusBadRequest, APIResponse{Error: "Invalid Moment ID"})
	}

	var req struct {
		UserAddress string `json:"userAddress"`
		Content     string `json:"content"`
	}
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, APIResponse{Error: "Invalid request body"})
	}

	if req.UserAddress == "" || req.Content == "" {
		return c.JSON(http.StatusBadRequest, APIResponse{Error: "User address and content are required"})
	}

	// 1. Get User
	u, err := h.DB.User.Query().Where(user.AddressEQ(req.UserAddress)).Only(ctx)
	if err != nil {
		return c.JSON(http.StatusNotFound, APIResponse{Error: "User not found"})
	}

	// 2. Create Comment
	comment, err := h.DB.Comment.Create().
		SetContent(req.Content).
		SetUser(u).
		SetMomentID(momentID).
		Save(ctx)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, APIResponse{Error: err.Error()})
	}

	return c.JSON(http.StatusCreated, APIResponse{Data: comment})
}

// @Summary     Get Comments
// @Description Mengambil daftar komentar untuk sebuah moment.
// @Tags        Social
// @Accept      json
// @Produce     json
// @Param       id   path      int  true  "Moment ID (Internal ID)"
// @Param       page query     int  false "Page number"
// @Param       pageSize query int  false "Page size"
// @Success     200 {object} APIResponse "List of comments"
// @Router      /moments/{id}/comments [get]
func (h *Handler) getComments(c echo.Context) error {
	ctx := c.Request().Context()
	idStr := c.Param("id")
	momentID, err := strconv.Atoi(idStr)
	if err != nil {
		return c.JSON(http.StatusBadRequest, APIResponse{Error: "Invalid Moment ID"})
	}

	limit, offset, page, pageSize := getPagination(c)

	query := h.DB.Comment.Query().
		Where(comment.HasMomentWith(nftmoment.IDEQ(momentID)))

	totalItems, err := query.Count(ctx)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, APIResponse{Error: err.Error()})
	}

	comments, err := query.
		WithUser().
		Limit(limit).
		Offset(offset).
		Order(ent.Desc("created_at")).
		All(ctx)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, APIResponse{Error: err.Error()})
	}

	var data []map[string]interface{}
	for _, cm := range comments {
		userDto := map[string]interface{}{
			"address":  cm.Edges.User.Address,
			"nickname": cm.Edges.User.Nickname,
			"pfp":      cm.Edges.User.Pfp,
		}
		data = append(data, map[string]interface{}{
			"id":         cm.ID,
			"content":    cm.Content,
			"created_at": cm.CreatedAt,
			"user":       userDto,
		})
	}

	totalPages := int(math.Ceil(float64(totalItems) / float64(pageSize)))
	pagination := &Pagination{
		TotalItems:  totalItems,
		TotalPages:  totalPages,
		CurrentPage: page,
		PageSize:    pageSize,
	}

	return c.JSON(http.StatusOK, APIResponse{
		Data:       data,
		Pagination: pagination,
	})
}

package main

type MintMomentRequest struct {
	Recipient   string `json:"recipient" form:"recipient" validate:"required"`
	Name        string `json:"name" form:"name" validate:"required"`
	Description string `json:"description" form:"description" validate:"required"`
	Thumbnail   string `json:"thumbnail" form:"thumbnail" validate:"required"`
}

type CheckInRequest struct {
	UserAddress string `json:"userAddress" form:"userAddress"`
	EventID     string `json:"eventID"     form:"eventID"`
}

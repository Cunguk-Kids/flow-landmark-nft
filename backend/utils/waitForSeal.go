package utils

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/onflow/flow-go-sdk"
	"github.com/onflow/flow-go-sdk/access"
)

func WaitForSeal(ctx context.Context, c access.Client, id flow.Identifier) (*flow.TransactionResult, error) {
	log.Printf("Waiting for transaction %s to be sealed...\n", id) // Use log.Printf for consistency

	var result *flow.TransactionResult
	var err error

	for { // Loop indefinitely until sealed or definitive error
		result, err = c.GetTransactionResult(ctx, id)
		// --- Handle GetTransactionResult errors ---
		if err != nil {
			// Could be a network error, or tx not found yet.
			// Depending on the error type, you might want to retry or give up.
			// For simplicity here, we return the error immediately.
			log.Printf("Error fetching transaction result for %s: %v\n", id, err)
			return nil, fmt.Errorf("failed fetching tx result: %w", err) // Return the Go error
		}

		// --- Check transaction status ---
		if result.Status == flow.TransactionStatusSealed {
			fmt.Println() // Newline after the dots
			log.Printf("Transaction %s sealed\n", id)
			// Check for ON-CHAIN errors *after* sealing
			if result.Error != nil {
				log.Printf("Transaction %s failed on-chain: %v\n", id, result.Error)
				// Return the Cadence error wrapped in a Go error
				return result, fmt.Errorf("transaction failed on-chain: %w", result.Error)
			}
			// Success!
			return result, nil // Return result and nil error
		}

		// If not sealed yet, wait and try again
		fmt.Print(".") // Progress indicator
		time.Sleep(1 * time.Second)

		// Check context cancellation (e.g., if the API request timed out)
		if ctx.Err() != nil {
			fmt.Println()
			log.Printf("Context cancelled while waiting for tx %s: %v", id, ctx.Err())
			return nil, ctx.Err()
		}
	}
}
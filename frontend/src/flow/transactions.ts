// Transaction to increment the counter
// Use with useMutation hook from @onflow/react-sdk
export const INCREMENT_COUNTER = `
import "Counter"

transaction {
  prepare(acct: &Account) {
    // Authorization
  }

  execute {
    Counter.increment()
    log("Counter incremented!")
  }
}
`;

// Transaction to decrement the counter
// Use with useMutation hook from @onflow/react-sdk
export const DECREMENT_COUNTER = `
import "Counter" 

transaction {
  prepare(acct: &Account) {
    // Authorization
  }

  execute {
    Counter.decrement()
    log("Counter decremented!")
  }
}
`;

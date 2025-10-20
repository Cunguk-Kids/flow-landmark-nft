// Script to get the current counter value
// Use with useScript hook from @onflow/react-sdk
export const GET_COUNTER = `
import Counter from 0xCounter

access(all)
fun main(): Int {
  return Counter.getCount()
}
`;

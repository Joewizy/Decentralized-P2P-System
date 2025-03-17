#[test_only]
module defihub::add_test {
    use sui::test_scenario;
   // use defihub::addition::{Self, add, deposit};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::tx_context;
    use sui::object;

    // Assume these constants are imported or defined:
    const INSUFFICIENT_FUNDS: u64 = 1;
    const MIN_CARD_COST: u64 = 2;

    #[test]
    fun test_create() {
        let owner = @0xA;
        let user1 = @0xB;
        let user2 = @0xC;

        // Begin test scenario with the owner as the sender.
        let mut scenario_val = test_scenario::begin(owner);
        let scenario = &mut scenario_val;

        // First transaction: 
        test_scenario::next_tx(scenario, owner);
        {
            let x = 10;
            let y = 5;
            let amount = x+y;

            assert!(amount == 10);
        };
        test_scenario::end(scenario_val);
        
}
}
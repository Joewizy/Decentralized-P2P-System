#[test_only]
module defihub::escrow_test{
    use sui::test_scenario;
    use defihub::Escrow::{create_escrow, create_user_profile, confirm_payment};

#[test]
fun test_create() {
    let owner = @0xA;
    let buyer = @0xB;
    let seller = @0xC;

    // Begin test scenario with the owner as the sender.
    let mut scenario_val = test_scenario::begin(owner);
        let scenario = &mut scenario_val;

        test_scenario::next_tx(scenario, owner);
        {   
        };
        test_scenario::end(scenario_val);
        
}
}
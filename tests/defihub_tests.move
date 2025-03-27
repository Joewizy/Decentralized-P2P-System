#[test_only]
module defihub::escrow_test {
    use sui::test_scenario;
    use defihub::Escrow::{init_for_testing, ProfileRegistry, is_user_profiles_empty};

    #[test]
    fun test_create() {
        let owner = @0xA;

        let mut scenario = test_scenario::begin(owner);

        scenario.next_tx(owner);
        {   
            init_for_testing(scenario.ctx());
        };

        scenario.next_tx(owner);
        {
            let profile_registry = scenario.take_shared<ProfileRegistry>();
            //let profile_registry = test_scenario::take_shared<ProfileRegistry>(scenario);
            assert!(is_user_profiles_empty(&profile_registry));
            test_scenario::return_shared(profile_registry);
        };
        scenario.end();
    }
}
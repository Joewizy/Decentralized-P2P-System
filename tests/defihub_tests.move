#[test_only]
module defihub::escrow_test {
    use defihub::Escrow;
    use std::debug;
    use sui::sui::SUI;
    use sui::coin::{Self, Coin};
    use sui::tx_context::{Self, TxContext};
    use sui::table::{Self, Table};
    use sui::test_scenario;

    #[test]
    fun test_all_shared_objects_are_created() {
        let owner = @0xCA;

        let mut scenario = test_scenario::begin(owner);

        scenario.next_tx(owner);
        {   
            Escrow::init_for_testing(scenario.ctx());
        };

        scenario.next_tx(owner);
        {
            let profile_registry = scenario.take_shared<Escrow::ProfileRegistry>();
            let escrow_registry = scenario.take_shared<Escrow::EscrowRegistry>();
            let office_registry = scenario.take_shared<Escrow::OfferRegistry>();

            assert!(Escrow::is_user_profiles_empty(&profile_registry), 0);
            assert!(Escrow::is_user_escrows_empty(&escrow_registry), 0);
            assert!(Escrow::is_user_offers_empty(&office_registry), 0);

            test_scenario::return_shared(profile_registry);
            test_scenario::return_shared(office_registry);
            test_scenario::return_shared(escrow_registry);
        };
        scenario.end();
    }
    
    #[test]
    fun test_create_user_profile() {
        let owner = @0xCA;
        let user = @0x12;

        let mut scenario = test_scenario::begin(owner);

        scenario.next_tx(owner);
        {   
            Escrow::init_for_testing(scenario.ctx());
        };

        scenario.next_tx(user);
        {
            let name: vector<u8> = b"Joe";
            let contact: vector<u8> = b"12345";
            let email: vector<u8> = b"test@gmail.com";

            let mut profile_registry = scenario.take_shared<Escrow::ProfileRegistry>();

            Escrow::create_user_profile(name, contact, email, &mut profile_registry, scenario.ctx());
            
            let (name, contact, email, owner, joined_date, total_trades, disputes, completed_trades, average_settlement_time) =
                Escrow::get_user_profile_details(&profile_registry, user);

            assert!(name == name);
            assert!(contact == contact);
            assert!(email == email);
            assert!(owner == user);
            assert!(total_trades == 0);
            assert!(disputes == 0);
            assert!(completed_trades == 0);
            assert!(average_settlement_time == 0);
            assert!(joined_date == 0);

            test_scenario::return_shared(profile_registry);
        };

        scenario.end();
    }

    #[test]
    fun test_create_offer_and_escrow() {
        let owner = @0xCA;
        let seller = @0x13;
        let buyer = @0x14;

        let mut scenario = test_scenario::begin(owner);

        scenario.next_tx(owner);
        {   
            Escrow::init_for_testing(scenario.ctx());
        };

        scenario.next_tx(seller);
        {
            let name: vector<u8> = b"Joe";
            let contact: vector<u8> = b"12345";
            let email: vector<u8> = b"test@gmail.com";

            let mut profile_registry = scenario.take_shared<Escrow::ProfileRegistry>();

            Escrow::create_user_profile(name, contact, email, &mut profile_registry, scenario.ctx());
            test_scenario::return_shared(profile_registry);
        };

        // Mint sui coins for the Seller
        scenario.next_tx(seller);
        {
            let mut coin = coin::mint_for_testing<Coin<SUI>>(1000, scenario.ctx());
            transfer::public_transfer(coin, seller);
        };

        scenario.next_tx(seller);
        {   
            let price = 1000;
            let sui_coin = test_scenario::take_from_sender<Coin<SUI>>(&scenario);
            let currency_code: vector<u8> = b"Joe";
            let payment_type: vector<u8> = b"BankTransfer";

            let profile_registry = scenario.take_shared<Escrow::ProfileRegistry>();
            let mut offer_registry = scenario.take_shared<Escrow::OfferRegistry>();

            Escrow::create_offer(currency_code, price, payment_type, sui_coin, &mut offer_registry, &profile_registry, scenario.ctx());
            test_scenario::return_shared(profile_registry);
            test_scenario::return_shared(offer_registry);
        };

        scenario.next_tx(buyer);
        {
            let sui_to_buy = 100;
            let mut offer = scenario.take_shared<Escrow::Offer>();
            let mut escrow_registry = scenario.take_shared<Escrow::EscrowRegistry>();

            Escrow::create_escrow(sui_to_buy, &mut offer, &mut escrow_registry, scenario.ctx());
            assert!(offer.get_offer_price() == 1000);
            test_scenario::return_shared(offer);
            test_scenario::return_shared(escrow_registry);
        };
        scenario.end();
    }
}


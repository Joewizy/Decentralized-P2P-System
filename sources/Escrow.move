module defihub::Escrow {
    use sui::tx_context::{Self, TxContext};
    use sui::object::{Self, UID, ID};
    use sui::balance::{Self, Balance};
    use sui::transfer;
    use sui::coin::{Self, Coin};
    use sui::event;
    use sui::sui::SUI;
    use std::string::{Self, String};
    use sui::table::{Self, Table};

    // ======== ERRORS ========
    const E_NOT_OWNER: u64 = 1;
    const E_NOT_SELLER: u64 = 2;
    const E_NOT_BUYER: u64 = 3;
    const E_INVALID_STATE: u64 = 4;
    const E_INVALID_AMOUNT: u64 = 5;
    const E_ALREADY_EXISTS: u64 = 6;
    const E_INVALID_OFFER: u64 = 7;

    // ======== STRUCTURES ========
    public struct ProfileRegistry has key {
        id: UID,
        user_profiles: Table<address, UserProfile>
    }

    public struct Deployer has key, store {
        id: UID,
    }

    public struct UserProfile has store {
        name: String,
        contact: String,
        email: String,
        owner: address,
        joined_date: u64,
        total_trades: u64,
        disputes: u64,
        completed_trades: u64,
        average_settlement_time: u64,
    }

    public struct Escrow has key, store {
        id: UID,
        offer_id: ID,
        seller: address,
        buyer: address,
        locked_coin: Balance<SUI>,
        fiat_amount: u64,
        status: String, // "PENDING" // "DISPUTE" // "COMPLETED" // "CANCELLED"
        created_at: u64,
    }

    public struct Offer has key, store {
        id: UID,
        owner: address,
        currency_code: String,
        locked_amount: Balance<SUI>,
        active_escrows: u64,
        price: u64,
        payment_type: String,
    }

    // ======== EVENTS ========
    public struct EscrowCreated has copy, drop {
        escrow_id: ID,
        seller: address,
        buyer: address,
        amount: u64,
    }

    public struct PaymentConfirmed has copy, drop {
        escrow_id: ID,
        confirmed_by: address,
    }

    public struct DisputeRaised has copy, drop {
        escrow_id: ID,
        seller: address,
        buyer: address,
    }

    public struct PaymentConfirmedDuringDispute has copy, drop {
        escrow_id: ID,
        seller: address,
    }

    // ======== Initialization ========
    fun init(ctx: &mut TxContext) {
        let registry = ProfileRegistry {
            id: object::new(ctx),
            user_profiles: table::new<address, UserProfile>(ctx),
        };

        transfer::share_object(registry);

        let deployer = Deployer {
            id: object::new(ctx)
        };
        let publisher = tx_context::sender(ctx);
        transfer::transfer(deployer, publisher);
    }

    // ======== FUNCTIONS ========
    public entry fun create_user_profile(
        name: vector<u8>,
        contact: vector<u8>,
        email: vector<u8>,
        registry: &mut ProfileRegistry,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(!table::contains(&registry.user_profiles, sender), E_ALREADY_EXISTS);

        let user_profile = UserProfile {
            name: string::utf8(name),
            contact: string::utf8(contact),
            email: string::utf8(email),
            owner: sender,
            joined_date: tx_context::epoch_timestamp_ms(ctx),
            total_trades: 0,
            disputes: 0,
            completed_trades: 0,
            average_settlement_time: 0,
        };

        table::add(&mut registry.user_profiles, sender, user_profile);
    }

    public entry fun create_offer(
        currency_code: vector<u8>,
        price: u64,
        payment_type: vector<u8>,
        sui_coin: Coin<SUI>,
        _: &ProfileRegistry,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);

        let locked_balance = coin::into_balance(sui_coin);

        let offer = Offer {
            id: object::new(ctx),
            locked_amount: locked_balance,
            owner: sender,
            currency_code: string::utf8(currency_code),
            active_escrows: 0,
            price,
            payment_type: string::utf8(payment_type),
        };
        transfer::share_object(offer);
    }

    public entry fun create_escrow(
        sui_to_buy: u64,
        offer: &mut Offer,
        ctx: &mut TxContext
    ) {
        let buyer = tx_context::sender(ctx);
        let total_sui = balance::value(&offer.locked_amount);
        let fiat_amount = offer.price * sui_to_buy;

        assert!(sui_to_buy > 0 && sui_to_buy <= total_sui, E_INVALID_AMOUNT);
        let escrow_sui = balance::split(&mut offer.locked_amount, sui_to_buy);
        offer.active_escrows = offer.active_escrows + 1;

        let escrow = Escrow {
            id: object::new(ctx),
            offer_id: object::uid_to_inner(&offer.id),
            seller: offer.owner,
            buyer,
            locked_coin: escrow_sui,
            fiat_amount,
            status: string::utf8(b"PENDING"),
            created_at: tx_context::epoch_timestamp_ms(ctx),
        };

        event::emit(EscrowCreated {
            escrow_id: object::uid_to_inner(&escrow.id),
            seller: offer.owner,
            buyer,
            amount: sui_to_buy,
        });

        transfer::share_object(escrow);
    }

    public entry fun confirm_payment(
        user_profile: &mut ProfileRegistry,
        escrow: &mut Escrow,
        offer: &mut Offer,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(escrow.seller == sender, E_NOT_SELLER);
        assert!(escrow.status == string::utf8(b"PENDING"), E_INVALID_STATE);
        assert!(object::uid_to_inner(&offer.id) == escrow.offer_id, E_INVALID_OFFER);

        let user_registry = table::borrow_mut(&mut user_profile.user_profiles, sender);
        assert!(user_registry.owner == sender, E_NOT_OWNER);

        let total = balance::value(&escrow.locked_coin);
        let payout_balance = balance::split(&mut escrow.locked_coin, total);
        let payout_coin = coin::from_balance(payout_balance, ctx);

        transfer::public_transfer(payout_coin, escrow.buyer);

        escrow.status = string::utf8(b"COMPLETED");
        offer.active_escrows = offer.active_escrows - 1;

        user_registry.completed_trades = user_registry.completed_trades + 1;
        let settlement_time = tx_context::epoch_timestamp_ms(ctx) - escrow.created_at;
        let total_time = user_registry.average_settlement_time * (user_registry.completed_trades - 1);
        user_registry.average_settlement_time =
            (total_time + settlement_time) / user_registry.completed_trades;

        event::emit(PaymentConfirmed {
            escrow_id: object::uid_to_inner(&escrow.id),
            confirmed_by: sender,
        });
    }

    public entry fun cancel_escrow(
        escrow: &mut Escrow,
        offer: &mut Offer,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);

        assert!(escrow.buyer == sender, E_NOT_BUYER);
        assert!(escrow.status == string::utf8(b"PENDING"), E_INVALID_STATE);
        assert!(object::uid_to_inner(&offer.id) == escrow.offer_id, E_INVALID_OFFER);

        let total = balance::value(&escrow.locked_coin);
        let to_return = balance::split(&mut escrow.locked_coin, total);
        balance::join(&mut offer.locked_amount, to_return);

        escrow.status = string::utf8(b"CANCELLED");
        offer.active_escrows = offer.active_escrows - 1;
    }

    public entry fun delete_offer(offer: Offer, ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);

        assert!(offer.owner == sender, E_NOT_OWNER);
        assert!(offer.active_escrows == 0, E_INVALID_STATE);

        let Offer { id, locked_amount, owner: _, currency_code: _, active_escrows: _, price: _, payment_type: _ } = offer;

        if (balance::value(&locked_amount) > 0) {
            let coin_to_return = coin::from_balance(locked_amount, ctx);
            transfer::public_transfer(coin_to_return, sender);
        } else {
            balance::destroy_zero(locked_amount);
        };

        object::delete(id);
    }

    public entry fun make_dispute(
        escrow: &mut Escrow,
        user_profile: &mut ProfileRegistry,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);

        let user_registry = table::borrow_mut(&mut user_profile.user_profiles, sender);
        assert!(user_registry.owner == sender, E_NOT_OWNER);
        assert!(escrow.status == string::utf8(b"PENDING"), E_INVALID_STATE);

        escrow.status = string::utf8(b"DISPUTE");
        user_registry.disputes = user_registry.disputes + 1;

        event::emit(DisputeRaised {
            escrow_id: object::uid_to_inner(&escrow.id),
            seller: escrow.seller,
            buyer: escrow.buyer,
        });
    }

    public entry fun force_complete_trade(
        _: &Deployer,
        escrow: &mut Escrow,
        offer: &mut Offer,
        profile_registry: &mut ProfileRegistry,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(escrow.status == string::utf8(b"DISPUTE"), E_INVALID_STATE);
        assert!(object::uid_to_inner(&offer.id) == escrow.offer_id, E_INVALID_OFFER);

        let total = balance::value(&escrow.locked_coin);
        let payout_balance = balance::split(&mut escrow.locked_coin, total);
        let payout_coin = coin::from_balance(payout_balance, ctx);

        transfer::public_transfer(payout_coin, escrow.buyer);

        escrow.status = string::utf8(b"COMPLETED");
        offer.active_escrows = offer.active_escrows - 1;

        let seller_profile = table::borrow_mut(&mut profile_registry.user_profiles, escrow.seller);
        seller_profile.completed_trades = seller_profile.completed_trades + 1;
        let settlement_time = tx_context::epoch_timestamp_ms(ctx) - escrow.created_at;
        let total_time = seller_profile.average_settlement_time * (seller_profile.completed_trades - 1);
        seller_profile.average_settlement_time = (total_time + settlement_time) / seller_profile.completed_trades;

    }

    public entry fun refund_seller(
        _: &Deployer,
        escrow: &mut Escrow,
        offer: &mut Offer,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(escrow.status == string::utf8(b"DISPUTE"), E_INVALID_STATE);
        assert!(object::uid_to_inner(&offer.id) == escrow.offer_id, E_INVALID_OFFER);

        let total = balance::value(&escrow.locked_coin);
        let to_return = balance::split(&mut escrow.locked_coin, total);
        balance::join(&mut offer.locked_amount, to_return);

        escrow.status = string::utf8(b"CANCELLED");
        offer.active_escrows = offer.active_escrows - 1;
    }

    public entry fun resolve_dispute(escrow: &mut Escrow, ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);

        assert!(escrow.seller == sender, E_NOT_SELLER);
        assert!(escrow.status == string::utf8(b"DISPUTE"), E_INVALID_STATE);

        event::emit(PaymentConfirmedDuringDispute {
            escrow_id: object::uid_to_inner(&escrow.id),
            seller: sender,
        });
    }
}
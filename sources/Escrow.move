module defihub::Escrow {
    use sui::tx_context::{Self, TxContext};
    use sui::object::{Self, UID, ID};
    use sui::balance::{Self, Balance};
    use sui::transfer;
    use sui::coin::{Self, Coin};
    use sui::event;
    use sui::sui::SUI;
    use std::string::{Self, String};

    // ======== ERRORS ========
    const E_NOT_OWNER: u64 = 0;
    const E_ALREADY_TRADER: u64 = 1;
    const E_NOT_TRADER: u64 = 2;
    const E_INVALID_STATE: u64 = 3;
    const E_NOT_SELLER: u64 = 4;

    // ======== STRUCTURES ========
    public struct UserInfo has key, store {
        id: UID,
        name: String,
        joined_date: u64,
        trader: TraderProfile,
    }

    public struct TraderProfile has store {
        id: ID,
        owner: address, 
        total_trades: u64, 
        disputes: u64,
        completed_trades: u64, 
        average_settlement_time: u64,
        is_active: bool, 
    }

    public struct Escrow has key, store {
        id: UID,
        seller: address,
        buyer: address,
        locked_coin: Balance<SUI>,
        fiat_amount: u64,
        currency_code: String,
        status: String, // "PENDING" or "COMPLETED"
        created_at: u64,
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

    // ======== FUNCTIONS ========

    public entry fun create_user_profile(name: vector<u8>, ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);

        let id = object::new(ctx);
        let inner_id = object::uid_to_inner(&id);

        let user_profile = UserInfo {
            id: id,
            name: string::utf8(name),
            joined_date: tx_context::epoch_timestamp_ms(ctx),
            trader: TraderProfile {
                id: inner_id,
                owner: sender,
                total_trades: 0,
                disputes: 0,
                completed_trades: 0,
                average_settlement_time: 0,
                is_active: false, 
            },
        };

        transfer::transfer(user_profile, sender);
    }

    /// Create an escrow transaction
    public entry fun create_escrow(
        buyer: address, // emeka is buying 5sui
        fiat_amount: u64, // N10,000
        currency_code: vector<u8>, // NGN
        seller_coin: Coin<SUI>, // 5sui [assuming 1Sui = N2000] 
        user_info: &mut UserInfo,
        escrow: &mut Escrow,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx); // John sells 5Sui to emeka
        assert!(user_info.trader.is_active, E_NOT_TRADER);

        // Convert Coin to Balance for storage
        let escrow_balance = coin::into_balance(seller_coin);
        let amount = balance::value(&escrow_balance);

        user_info.trader.total_trades = user_info.trader.total_trades + 1;
        let id = object::new(ctx);

        let escrow = Escrow {
            id,
            seller: sender,
            buyer,
            locked_coin: escrow_balance,
            fiat_amount,
            currency_code: string::utf8(currency_code),
            status: string::utf8(b"PENDING"),
            created_at: tx_context::epoch_timestamp_ms(ctx),
        };

        event::emit(EscrowCreated {
            escrow_id: object::uid_to_inner(&escrow.id),
            seller: sender,
            buyer,
            amount,
        });

        transfer::share_object(escrow);
    }

    public entry fun confirm_payment(
        user_info: &mut UserInfo,
        escrow: &mut Escrow,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(escrow.seller == sender, E_NOT_SELLER);
        assert!(escrow.status == string::utf8(b"PENDING"), E_INVALID_STATE);

        // Get the balance value
        let coin_value = balance::value(&escrow.locked_coin);
        
        // Split and convert to Coin
        let payout_balance = balance::split(&mut escrow.locked_coin, coin_value);
        let payout_coin = coin::from_balance<SUI>(payout_balance, ctx);
        
        // Transfer to buyer
        transfer::public_transfer(payout_coin, escrow.buyer);

        escrow.status = string::utf8(b"COMPLETED");

        // Update trader stats
        let settlement_time = tx_context::epoch_timestamp_ms(ctx) - escrow.created_at;
        user_info.trader.completed_trades = user_info.trader.completed_trades + 1;
        
        let total_time = user_info.trader.average_settlement_time * (user_info.trader.completed_trades - 1);
        user_info.trader.average_settlement_time = (total_time + settlement_time) / user_info.trader.completed_trades;

        event::emit(PaymentConfirmed {
            escrow_id: object::uid_to_inner(&escrow.id),
            confirmed_by: sender,
        });
    }

    public entry fun make_dispute(escrow: &mut Escrow, user_info: &mut UserInfo, ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);
        assert!(escrow.seller == sender, E_NOT_TRADER);
        assert!(escrow.status == string::utf8(b"PENDING"), E_INVALID_STATE);

        user_info.trader.disputes = user_info.trader.disputes + 1;
    }

    public entry fun resolve_dispute(escrow: &mut Escrow, user_info: &mut UserInfo, ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);
        assert!(escrow.seller == sender, E_NOT_TRADER);
        assert!(escrow.status == string::utf8(b"PENDING"), E_INVALID_STATE);
        escrow.status = string::utf8(b"COMPLETED");
    }

    public entry fun activate_trader_profile(user_info: &mut UserInfo, ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);
        assert!(!user_info.trader.is_active, E_ALREADY_TRADER);
        user_info.trader.is_active = true;
    }

    public entry fun deactivate_trader(user_info: &mut UserInfo, ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);
        assert!(user_info.trader.is_active, E_NOT_TRADER);
        user_info.trader.is_active = false;
    }

    // ======== GETTER FUNCTIONS ========
    // public fun get_user_profile(user_info: &UserInfo) : UserInfo {
    //     user_info
    // }
}
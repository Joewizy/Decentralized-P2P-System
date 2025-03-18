module defihub::Escrow {
    use sui::tx_context::{Self, TxContext};
    use sui::object::{Self, UID, ID};
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
        completion_rate: u64,
        average_settlement_time: u64,
        is_active: bool, 
    }

    public struct Escrow has key {
        id: UID,
        seller: address,
        buyer: address,
        locked_coin: Coin<SUI>,
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

    /// Create a user profile
    public entry fun create_user_profile(name: vector<u8>, ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);
        let id = object::new(ctx);

        let user_profile = UserInfo {
            id,
            name: string::utf8(name),
            joined_date: tx_context::epoch_timestamp_ms(ctx),
            trader: TraderProfile {
                id: object::uid_to_inner(&id),
                owner: sender,
                total_trades: 0,
                disputes: 0,
                completion_rate: 0,
                average_settlement_time: 0,
                is_active: false, 
            },
        };

        transfer::transfer(user_profile, sender);
    }

    /// Create an escrow transaction
    public entry fun create_escrow(
        buyer: address,
        fiat_amount: u64,
        currency_code: vector<u8>,
        locked_coin: Coin<SUI>,
        user_info: &mut UserInfo,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        (object::id(user_info));
        assert!(object::borrow_id(user_info) == &sender, E_NOT_OWNER);
        assert!(user_info.trader.is_active, E_NOT_TRADER);

        let id = object::new(ctx);
        let amount = coin::value(&locked_coin);

        let escrow = Escrow {
            id,
            seller: sender,
            buyer,
            locked_coin,
            fiat_amount,
            currency_code: string::utf8(currency_code),
            status: string::utf8(b"PENDING"),
            created_at: tx_context::epoch_timestamp_ms(ctx),
        };

        event::emit(EscrowCreated {
            escrow_id: object::uid_to_inner(&id),
            seller: sender,
            buyer,
            amount,
        });

        transfer::share_object(escrow); // Share escrow so buyer/seller can interact
    }

    /// Confirm payment and release SUI to buyer
    public entry fun confirm_payment(escrow: &mut Escrow, ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);
        assert!(escrow.seller == sender, E_NOT_SELLER);
        assert!(escrow.status == string::utf8(b"PENDING"), E_INVALID_STATE);

        // Transfer locked SUI to buyer
        transfer::transfer(escrow.locked_coin, escrow.buyer);

        // Update status to COMPLETED
        escrow.status = string::utf8(b"COMPLETED");

        event::emit(PaymentConfirmed {
            escrow_id: object::uid_to_inner(&escrow.id),
            confirmed_by: sender,
        });

        // Optionally update trader stats here (e.g., total_trades += 1)
    }

    public entry fun activate_trader_profile(user_info: &mut UserInfo, ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);
        assert!(object::borrow_id(user_info) == &sender, E_NOT_OWNER);
        assert!(!user_info.trader.is_active, E_ALREADY_TRADER);
        user_info.trader.is_active = true;
    }

    public entry fun deactivate_trader(user_info: &mut UserInfo, ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);
        assert!(object::borrow_id(user_info) == &sender, E_NOT_OWNER);
        assert!(user_info.trader.is_active, E_NOT_TRADER);
        user_info.trader.is_active = false;
    }
}
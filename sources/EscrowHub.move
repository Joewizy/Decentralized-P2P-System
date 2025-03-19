module defihub::EscrowContract {
    use std::string::{Self, String};
    use sui::object::{UID, ID};
    use sui::balance::{Self, Balance};
    use sui::transfer;
    use sui::coin::{Self, Coin};
    use sui::event;
    use sui::object_table::{Self, ObjectTable};
    use sui::tx_context::TxContext;
    use sui::sui::SUI;

    // ======== ERRORS ========
    const E_NOT_OWNER: u64 = 0;
    const E_ALREADY_TRADER: u64 = 1;
    const E_NOT_TRADER: u64 = 2;
    const E_INVALID_STATE: u64 = 3;
    const E_NOT_SELLER: u64 = 4;
    const E_ESCROW_NOT_FOUND: u64 = 5;

    // ======== STRUCTURES ========
    public struct TraderProfile has key, store {
        id: UID,
        owner: address,
        total_trades: u64,
        disputes: u64,
        completed_trades: u64,
        average_settlement_time: u64,
        is_active: bool,
        escrows: ObjectTable<u64, Escrow>,
        escrow_counter: u64
    }

    public struct Escrow has key, store {
        id: UID,
        seller: address,
        buyer: address,
        locked_coin: Balance<SUI>,
        fiat_amount: u64,
        currency_code: String,
        status: String,
        created_at: u64,
    }

    public struct EscrowHub has key {
        id: UID,
        traders: ObjectTable<address, TraderProfile>
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

    // ======== INITIALIZATION ========
    fun init(ctx: &mut TxContext) {
        transfer::share_object(EscrowHub {
            id: object::new(ctx),
            traders: object_table::new(ctx)
        });
    }

    // ======== FUNCTIONS ========
    public entry fun create_trader_profile(
        escrow_hub: &mut EscrowHub,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let trader = TraderProfile {
            id: object::new(ctx),
            owner: sender,
            total_trades: 0,
            disputes: 0,
            completed_trades: 0,
            average_settlement_time: 0,
            is_active: false,
            escrows: object_table::new(ctx),
            escrow_counter: 0
        };

        object_table::add(&mut escrow_hub.traders, sender, trader);
    }

public entry fun create_escrow(
    escrow_hub: &mut EscrowHub,
    buyer: address,
    fiat_amount: u64,
    currency_code: vector<u8>,
    seller_coin: Coin<SUI>,
    ctx: &mut TxContext
) {
    let sender = tx_context::sender(ctx);
    let trader = object_table::borrow_mut(&mut escrow_hub.traders, sender);
    assert!(trader.is_active, E_NOT_TRADER);

    let escrow_balance = coin::into_balance(seller_coin);
    let amount = balance::value(&escrow_balance);

    trader.escrow_counter = trader.escrow_counter + 1;
    trader.total_trades = trader.total_trades + 1;

    // Create UID first
    let escrow_id = object::new(ctx);
    
    // Extract ID before moving UID
    let escrow_id_inner = object::uid_to_inner(&escrow_id);

    // Create escrow after getting the ID
    let escrow = Escrow {
        id: escrow_id,  // UID is moved here
        seller: sender,
        buyer,
        locked_coin: escrow_balance,
        fiat_amount,
        currency_code: string::utf8(currency_code),
        status: string::utf8(b"PENDING"),
        created_at: tx_context::epoch_timestamp_ms(ctx),
    };

    object_table::add(&mut trader.escrows, trader.escrow_counter, escrow);

    // Emit event using the captured ID
    event::emit(EscrowCreated {
        escrow_id: escrow_id_inner,
        seller: sender,
        buyer,
        amount,
    });
}

    public entry fun confirm_payment(
        escrow_hub: &mut EscrowHub,
        escrow_id: u64,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let trader = object_table::borrow_mut(&mut escrow_hub.traders, sender);
        let escrow = object_table::borrow_mut(&mut trader.escrows, escrow_id);

        assert!(escrow.seller == sender, E_NOT_SELLER);
        assert!(escrow.status == string::utf8(b"PENDING"), E_INVALID_STATE);

        let coin_value = balance::value(&escrow.locked_coin);
        let payout_balance = balance::split(&mut escrow.locked_coin, coin_value);
        let payout_coin = coin::from_balance<SUI>(payout_balance, ctx);
        
        transfer::public_transfer(payout_coin, escrow.buyer);
        escrow.status = string::utf8(b"COMPLETED");

        let settlement_time = tx_context::epoch_timestamp_ms(ctx) - escrow.created_at;
        trader.completed_trades = trader.completed_trades + 1;
        
        let total_time = trader.average_settlement_time * (trader.completed_trades - 1);
        trader.average_settlement_time = (total_time + settlement_time) / trader.completed_trades;

        event::emit(PaymentConfirmed {
            escrow_id: object::uid_to_inner(&escrow.id),
            confirmed_by: sender,
        });
    }

    // ... other functions with similar object_table access patterns ...
}
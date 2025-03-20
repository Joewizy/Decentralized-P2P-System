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
    const E_NOT_SELLER: u64 = 4;
    const E_NOT_BUYER: u64 = 5;
    const E_INVALID_STATE: u64 = 3;
    const E_INVALID_AMOUNT: u64 = 6;

    // ======== STRUCTURES ========
    public struct UserProfile has key, store {
        id: UID,
        name: String,
        owner: address,
        joined_date: u64,
        total_trades: u64,
        disputes: u64,
        completed_trades: u64,
        average_settlement_time: u64,
    }

    public struct Escrow has key, store {
        id: UID,
        seller: address,
        buyer: address,
        locked_coin: Balance<SUI>,
        fiat_amount: u64,
        status: String, // "PENDING" // "COMPLETED" // "CANCELLED"
        created_at: u64,
    }

    public struct Offer has key, store {
        id: UID,
        owner: address,
        currency_code: String,
        locked_amount: Balance<SUI>,
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
        let user_profile = UserProfile {
            id,
            name: string::utf8(name),
            owner: sender,
            joined_date: tx_context::epoch_timestamp_ms(ctx),
            total_trades: 0,
            disputes: 0,
            completed_trades: 0,
            average_settlement_time: 0,
        };

        transfer::transfer(user_profile, sender);
    }

    public entry fun create_offer(
        sui_coin: Coin<SUI>,
        currency_code: vector<u8>,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let locked_balance = coin::into_balance(sui_coin);
        let offer = Offer {
            id: object::new(ctx),
            locked_amount: locked_balance,
            owner: sender,
            currency_code: string::utf8(currency_code),
        };

        transfer::share_object(offer);
    }

    public entry fun create_escrow(
        offer: &mut Offer,
        sui_to_buy: u64,
        fiat_amount: u64,
        ctx: &mut TxContext
    ) {
        let buyer = tx_context::sender(ctx);
        let total_sui = balance::value(&offer.locked_amount);

        assert!(sui_to_buy > 0 && sui_to_buy <= total_sui, E_INVALID_AMOUNT);
        let escrow_sui = balance::split(&mut offer.locked_amount, sui_to_buy);

        let escrow = Escrow {
            id: object::new(ctx),
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
        escrow: &mut Escrow,
        user_profile: &mut UserProfile,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(escrow.seller == sender, E_NOT_SELLER);
        assert!(user_profile.owner == sender, E_NOT_OWNER);
        assert!(escrow.status == string::utf8(b"PENDING"), E_INVALID_STATE);

        // Split the entire locked_coin for payout
        let total = balance::value(&escrow.locked_coin);
        let payout_balance = balance::split(&mut escrow.locked_coin, total);
        let payout_coin = coin::from_balance(payout_balance, ctx);
        transfer::public_transfer(payout_coin, escrow.buyer);

        // Update escrow status
        escrow.status = string::utf8(b"COMPLETED");

        // Update user profile stats
        user_profile.completed_trades = user_profile.completed_trades + 1;
        let settlement_time = tx_context::epoch_timestamp_ms(ctx) - escrow.created_at;
        let total_time = user_profile.average_settlement_time * (user_profile.completed_trades - 1);
        user_profile.average_settlement_time =
            (total_time + settlement_time) / user_profile.completed_trades;

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

        // Split the entire locked_coin back to offer
        let total = balance::value(&escrow.locked_coin);
        let to_return = balance::split(&mut escrow.locked_coin, total);
        balance::join(&mut offer.locked_amount, to_return);

        // Update escrow status
        escrow.status = string::utf8(b"CANCELLED");
    }

    public entry fun make_dispute(
        escrow: &mut Escrow,
        user_profile: &mut UserProfile,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(escrow.seller == sender, E_NOT_SELLER);
        assert!(user_profile.owner == sender, E_NOT_OWNER);
        assert!(escrow.status == string::utf8(b"PENDING"), E_INVALID_STATE);
        user_profile.disputes = user_profile.disputes + 1;
    }

    public entry fun resolve_dispute(
        escrow: &mut Escrow,
        user_profile: &mut UserProfile,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(escrow.seller == sender, E_NOT_SELLER);
        assert!(user_profile.owner == sender, E_NOT_OWNER);
        assert!(escrow.status == string::utf8(b"PENDING"), E_INVALID_STATE);
        escrow.status = string::utf8(b"COMPLETED");
    }
}

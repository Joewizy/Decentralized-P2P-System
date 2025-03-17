module defihub::dex {
    use sui::coin::{Coin}; // i remove the unused value of **value here
    // use sui::transfer;  ths is not necesary as it is available by default assert!(amount == 10);
    // │    │             ^^^^^^^^^^^^^^^^^^^^^ Test was not expected to error, but it aborted originating in the module defihub::add_test rooted here
    // use sui::object::{Self, UID};
    // use sui::tx_context::{TxContext};

    /// A liquidity pool for swapping between two coin types.
    public struct LiquidityPool<phantom T1, phantom T2> has key {
        id: UID,
        coin_x: Coin<T1>,
        coin_y: Coin<T2>,
        fee: u64
    }

    public entry fun create_pool<T1, T2>(coin_x: Coin<T1>, coin_y: Coin<T2>, fee: u64, ctx: &mut TxContext) {
        let pool = LiquidityPool<T1, T2> {
            id: sui::object::new(ctx),
            coin_x,
            coin_y,
            fee,
        };
        transfer::share_object(pool);
    }

    public entry fun swap<T1, T2>(pool: &mut LiquidityPool<T1, T2>, input_coin: Coin<T1>, ctx: &mut TxContext) {
        let input_amount: u64 = sui::coin::value(&input_coin);
        let fee_amount: u64 = input_amount * pool.fee / 10000;
        let swap_amount: u64 = input_amount - fee_amount;
        
        let pool_coin_x_value: u64 = sui::coin::value(&pool.coin_x);
        let pool_coin_y_value: u64 = sui::coin::value(&pool.coin_y);
        
        // Check if there is enough liquidity in coin_x.
        assert!(pool_coin_x_value > 0, 100);

        let output_amount: u64 = swap_amount * pool_coin_y_value / pool_coin_x_value;
        pool.coin_x.join(input_coin);
        
        // Check that the pool has sufficient coin_y.
        assert!(pool_coin_y_value >= output_amount, 101);
        
        let output_coin: Coin<T2> = pool.coin_y.split(output_amount, ctx);
        transfer::public_transfer(output_coin, ctx.sender());
    }
}

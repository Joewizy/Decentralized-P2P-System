module defihub::devcard {
    use std::string::{Self, String};
    // use std::option::{Self, Option};  ^^^^ Unnecessary alias 'option' for module 'std::option'. This alias is provided by default

    use sui::object_table::{Self, ObjectTable};
    // use sui::transfer; Unnecessary alias 'transfer' for module 'sui::transfer'. This alias is provided by default
    // use sui::object::{Self, UID, ID}; ^^^ Unnecessary alias 'UID' for module member 'sui::object::UID'. This alias is provided by default
    // use sui::tx_context::{Self, TxContext}; ^^^^ Unnecessary alias 'tx_context' for module 'sui::tx_context'. This alias is provided by default
    use sui::url::{Self, Url};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::event;

    // ERRORS
    const NOT_THE_OWNER: u64 = 0;
    const INSUFFICIENT_FUNDS: u64 = 1;
    const MIN_CARD_COST: u64 = 2;

    // STRUCTS [OBJECTS] OF THE NFT
    #[allow(unused_field)]
    public struct Trader has key {
        id: UID,
        completion: u64,
        offer: u64
    }
    
    public struct DevCard has key, store {
        id: UID,
        name: String,
        owner: address,
        title: String,
        img_url: Url,
        description: Option<String>, // make it editable
        years_of_exp: u8,
        technologies: String,
        portfolio: String,
        contact: String,
        open_to_work: bool,
    }

    public struct DevHub has key {
        id: UID,
        owner: address,
        counter: u64,
        cards: ObjectTable<u64, DevCard>, // shared Object
    }

    // EVENTS
    public struct CardCreated has copy, drop {
        id: ID,
        name: String,
        owner: address,
        title: String,
        contact: String,
    }

    public struct DescriptionUpdated has copy, drop {
        name: String,
        owner: address,
        new_description: String,
    }

    public struct PortfolioUpdated has copy, drop {
        name: String,
        owner: address,
        new_portfolio: String,
    }

    fun init(ctx: &mut TxContext) {
        transfer::share_object(
            DevHub {
                id: object::new(ctx),
                owner: tx_context::sender(ctx),
                counter: 0,
                cards: object_table::new(ctx),
            }
        );
    }

    public entry fun create_card(
        name: vector<u8>,
        title: vector<u8>,
        img_url: vector<u8>,
        years_of_exp: u8,
        technologies: vector<u8>,
        portfolio: vector<u8>,
        contact: vector<u8>,
        payment: Coin<SUI>,
        devhub: &mut DevHub,
        ctx: &mut TxContext
        ) {
            let value = coin::value(&payment);
            assert!(value == MIN_CARD_COST, INSUFFICIENT_FUNDS);
            transfer::public_transfer(payment, devhub.owner);

            devhub.counter = devhub.counter + 1;

            let id = object::new(ctx); //UID

            event::emit({
                CardCreated {
                    id: *object::uid_as_inner(&id),
                    name: string::utf8(name),
                    owner: tx_context::sender(ctx),
                    title: string::utf8(title),
                    contact: string::utf8(contact),
                }
            });

            let devcard = DevCard {
                id: id,
                name: string::utf8(name),
                owner: tx_context::sender(ctx),
                title: string::utf8(title),
                img_url: url::new_unsafe_from_bytes(img_url),
                description: option::none(),
                years_of_exp,
                technologies: string::utf8(technologies),
                portfolio: string::utf8(portfolio),
                contact: string::utf8(contact),
                open_to_work: true,
            };

            object_table::add(&mut devhub.cards, devhub.counter, devcard);
        }

        public entry fun update_card_description(devhub: &mut DevHub, new_description: vector<u8>, id: u64, ctx: &mut TxContext){
            let user_card  = object_table::borrow_mut(&mut devhub.cards, id);
            // Check the user updating the card description is the owner
            assert!(tx_context::sender(ctx) == user_card.owner, NOT_THE_OWNER);

            let old_value = option::swap_or_fill(&mut user_card.description, string::utf8(new_description));

            event::emit(
                DescriptionUpdated {
                    name: user_card.name,
                    owner: user_card.owner,
                    new_description: string::utf8(new_description),
                }
            );

            // delete
            _= old_value;
        }

        public entry fun deactivate_card(devhub: &mut DevHub, id: u64, ctx: &mut TxContext) {
            let user_card = object_table::borrow_mut(&mut devhub.cards, id);
            // Check the user deactivating the card is the owner
            assert!(tx_context::sender(ctx) == user_card.owner, NOT_THE_OWNER);

            user_card.open_to_work = false;
        }

        public entry fun update_portfolio(devhub: &mut DevHub, id: u64, new_portfolio: vector<u8>, ctx: &mut TxContext) {
            let user_card = object_table::borrow_mut(&mut devhub.cards, id);
            // Check the user updating the portfolio the card is the owner
            assert!(tx_context::sender(ctx) == user_card.owner, NOT_THE_OWNER);

            user_card.portfolio = string::utf8(new_portfolio);

            event::emit(
                PortfolioUpdated{
                    name: user_card.name,
                    owner: user_card.owner,
                    new_portfolio: string::utf8(new_portfolio),
                }
            );

        }

        public entry fun delete_dev_card(devcard: DevCard, ctx: &mut TxContext) {
            assert!(devcard.owner == tx_context::sender(ctx), NOT_THE_OWNER);
            let DevCard {
                id,
                name: _,
                owner: _,
                title: _,
                img_url: _,
                description: _,
                years_of_exp: _,
                technologies: _,
                portfolio: _,
                contact: _,
                open_to_work: _, } = devcard;
            // delete the DevCard of the user who called the function
            object::delete(id);
        }
        
        //Finally you will create a public function which will return the card information based on the given id.
        public fun get_card_info(devhub: &DevHub, id: u64): &DevCard {
            object_table::borrow(&devhub.cards, id)
        }
}
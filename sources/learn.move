// module defihub::rewards {
//     use std::string::{Self, String};
//     // use sui::transfer; unnecesary it is available as a prelude
//     // use sui::tx_context::{Self, TxContext}; unnecesary
//     use sui::url::{Self, Url};
//     use sui::event;

//     public struct Admin has key {
//         id: UID,
//     }

//     public struct LearnNft has key, store {
//         id: UID,
//         name: String,
//         description: String, // Intro to SUI 101.
//         url: Url,
//     }

//     // Events
//     public struct NftMinted has copy, drop {
//         id: ID,
//         name: String,
//         creator: address,
//     }
    
//     // TODO: Whitelist function for users to able to mint nft after course completion
//     public entry fun mint_reward_nft(_: &Admin, name: vector<u8>, description: vector<u8>, url: vector<u8>, ctx: &mut TxContext) {
//         let sender = ctx.sender();
//         let nft = LearnNft {
//             id: object::new(ctx),
//             name: string::utf8(name),
//             description: string::utf8(description),
//             url: url::new_unsafe_from_bytes(url),
//         };

//         event::emit(NftMinted {
//             id: object::id(&nft),
//             name: nft.name,
//             creator: sender,
//         });

//         transfer::public_transfer(nft, sender);
//     }

//     //VIEW FUNCTIONS 
//     public fun get_nft_details(nft: &LearnNft) :&LearnNft {
//         return nft
//     }

// }
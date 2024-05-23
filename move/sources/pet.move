#[allow(implicit_const_copy, unused_function, unused_variable, unused_mut_parameter, unused_const)]
module deployer::pet {
    use sui::url::{Self, Url};
    use std::string::{Self, String};
    use sui::object::{Self, ID, UID};
    use sui::event;
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use std::vector;
    use sui::address;
    use sui::table::{Self, Table};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::clock::{Self, Clock};
    use std::debug;

    use deployer::role::{Self, Roles};

    #[test_only]
    use sui::test_scenario;
    #[test_only]
    use sui::test_utils::assert_eq;

    //==============================================================================================
    // Constants
    //==============================================================================================
    const PRICE: u64 = 1000000; //1SUI

    //==============================================================================================
    // Error codes
    //==============================================================================================
    /// Insufficient funds
    const ERROR_INSUFFICIENT_FUNDS: u64 = 1;
    const ERROR_SIGNER_NOT_APPROVED_ADOPTER: u64 = 2;
    const ERROR_SIGNER_NOT_VET: u64 = 3;
    const ERROR_SIGNER_NOT_ADMIN_OR_OPERATOR: u64 = 4;
    const ERROR_NOT_AVAILABLE_FOR_ADOPTION: u64 = 5;

    //==============================================================================================
    // Structs 
    //==============================================================================================
    struct State has key {
        id: UID,
        //no of minted nft from this contract collection
        minted: u64,
        // list of pets waiting for adoption
        adoption: Table<u64, TempPetPassport>
    }

    struct PetPassport has key {
        id: UID,
        /// Name for the pet
        name: String,
        /// species, breed, color
        description: String,
        // photo
        url: Url,
        royalty_numerator: u64,
        // <name, species, breed, gender, dob, color/markings>
        pet_info: Table<String,String>,
        // <name, address, contact details>
        owner_info: Table<String,String>,
        // <microchip number, date of chipping, location of microchip>
        microchip_info: Table<String,String>,
        // each table: <date of vaccination, vaccination ref number, date valid from and expiry date, cert image uri, veterinarian signature>
        vaccination_rec: vector<Table<String,String>>,
        // each record <date&time of clinical report, string of clinical report>
        clinical_rec: vector<Table<String,String>>,
    }

    //for those waiting for adoption
    struct TempPetPassport has store, drop {
        id: u64,
        // photo
        url: String,
        royalty_numerator: u64,
        // <name, species, breed, gender, dob, color/markings>
        pet_info: vector<String>,
        // <microchip number, date of chipping, location of microchip>
        microchip_info: vector<String>
    }

    //==============================================================================================
    // Event Structs 
    //==============================================================================================

    struct PassportCreated has copy, drop {
        // The Object ID of the NFT
        object_id: ID,
        // The owner of the NFT
        owner: address,
        // The name of the NFT
        name: String
    }

    //==============================================================================================
    // Init
    //==============================================================================================

    fun init(ctx: &mut TxContext) {
        transfer::share_object(State{id: object::new(ctx), minted: 0, adoption: table::new<u64, TempPetPassport>(ctx)});
    }

    //==============================================================================================
    // Entry Functions 
    //==============================================================================================

    /// Create a new nft
    public entry fun mint_passport(
        // <name, species, breed, gender, dob, color/markings>
        pet_info: vector<String>,
        // photo
        url: String,
        // <name, contact details>
        owner_info: vector<String>,
        receiver: address,
        // <microchip number, date of chipping, location of microchip>
        microchip_info: vector<String>,
        payment: Coin<SUI>, 
        state: &mut State,
        ctx: &mut TxContext
    ) {
        assert_correct_payment(coin::value(&payment));
        transfer::public_transfer(payment, @treasury);
        let desc = *vector::borrow(&pet_info, 1);
        string::append_utf8(&mut desc, b", ");
        string::append(&mut desc, *vector::borrow(&pet_info, 2));
        string::append_utf8(&mut desc, b", ");
        string::append(&mut desc, *vector::borrow(&pet_info, 4));
        let name = string::utf8(b"Pet_#");
        string::append(&mut name, num_to_string(state.minted + 1));
        string::append_utf8(&mut name, b": ");
        string::append(&mut name, *vector::borrow(&pet_info, 0));
        let (pet_info_table, owner_info_table, microchip_info_table) = create_pet_passport_tables(pet_info, owner_info, receiver, microchip_info, ctx);

        let nft = PetPassport{
            id: object::new(ctx),
            name,
            description: desc,
            url: url::new_unsafe_from_bytes(*string::bytes(&url)),
            royalty_numerator: 5,
            pet_info: pet_info_table,
            owner_info: owner_info_table,
            microchip_info: microchip_info_table,
            vaccination_rec: vector::empty(),
            clinical_rec: vector::empty(),
        };
        state.minted = state.minted + 1;
        event::emit(PassportCreated {
            object_id: object::id(&nft),
            owner: receiver,
            name: nft.name,
        });
        transfer::transfer(nft, receiver);
        
    }

    /// Create a new nft
    public entry fun list_adoption(
        // <name, species, breed, gender, dob, color/markings>
        pet_info: vector<String>,
        // photo
        url: String,
        // <microchip number, date of chipping, location of microchip>
        microchip_info: vector<String>,
        state: &mut State,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let id = clock::timestamp_ms(clock);
        let temp = TempPetPassport{
            id,
            url,
            royalty_numerator: 5,
            pet_info,
            microchip_info
        };
        table::add(&mut state.adoption, id, temp);
    }

    /// Transfer `nft` to `recipient`
    public entry fun transfer(
        nft: PetPassport, recipient: address, _: &mut TxContext
    ) {
        transfer::transfer(nft, recipient)
    }

    /// Vet adds vaccnication record
    public entry fun add_vac(
        nft: &mut PetPassport,
        //<date of vaccination, vaccination ref number, date valid from and expiry date, cert image uri, veterinarian signature>
        //<vac_date, vac_ref_no, date_valid_from, expiry_date, cert_image_uri, vet_sign>
        vac_date: String,
        vac_ref_no: String,
        date_valid_from: String,
        expiry_date: String,
        cert_image_uri: String,
        roles: &mut Roles,
        ctx: &mut TxContext  
    ){
        let sender = tx_context::sender(ctx);
        assert_vet(sender, roles);
        let new_vac_rec = table::new<String, String>(ctx);
        table::add(&mut new_vac_rec, string::utf8(b"vac_date"), vac_date);
        table::add(&mut new_vac_rec, string::utf8(b"vac_ref_no"), vac_ref_no);
        table::add(&mut new_vac_rec, string::utf8(b"date_valid_from"), date_valid_from);
        table::add(&mut new_vac_rec, string::utf8(b"expiry_date"), expiry_date);
        table::add(&mut new_vac_rec, string::utf8(b"cert_image_uri"), cert_image_uri);
        table::add(&mut new_vac_rec, string::utf8(b"vet_sign"), address::to_string(sender));
        vector::push_back(&mut nft.vaccination_rec, new_vac_rec);
    }

    /// Vet adds clinic record
    public entry fun add_clinical_rec(
        nft: &mut PetPassport,
        date_time: String, //date and time of report
        clinical_report: String,
        roles: &mut Roles,
        ctx: &mut TxContext  
    ){
        let sender = tx_context::sender(ctx);
        assert_vet(sender, roles);
        let new_clinical_rec = table::new<String, String>(ctx);
        table::add(&mut new_clinical_rec, date_time, clinical_report);
        vector::push_back(&mut nft.clinical_rec, new_clinical_rec);
    }

    /// user adopts a pet
    public entry fun adopt(
        pet_id: u64,
        // <name, contact details>
        owner_info: vector<String>,
        payment: Coin<SUI>, 
        roles: &mut Roles,
        state: &mut State,
        ctx: &mut TxContext  
    ){
        assert_available_for_adoption(&state.adoption, pet_id);
        let sender = tx_context::sender(ctx);
        assert_adopter(sender, roles);
        let pet = table::borrow(&state.adoption, pet_id);
        mint_passport(pet.pet_info, pet.url, owner_info, sender, pet.microchip_info, payment, state, ctx);
        table::remove(&mut state.adoption, pet_id);
    }

    //==============================================================================================
    // Public View Functions 
    //==============================================================================================


    //==============================================================================================
    // Helper Functions 
    //==============================================================================================

    fun num_to_string(num: u64): String {
        use std::string;
        let num_vec = vector::empty<u8>();
        if (num == 0) {
            vector::push_back(&mut num_vec, 48);
        } else {
            while (num != 0) {
                let mod = num % 10 + 48;
                vector::push_back(&mut num_vec, (mod as u8));
                num = num / 10;
            };
        };

        vector::reverse(&mut num_vec);
        string::utf8(num_vec)
    }

    fun assert_correct_payment(payment: u64){
        assert!(payment == PRICE, ERROR_INSUFFICIENT_FUNDS);
    }

    fun assert_available_for_adoption(for_adoption: &Table<u64, TempPetPassport>, pet_id: u64){
        assert!(table::contains(for_adoption, pet_id), ERROR_NOT_AVAILABLE_FOR_ADOPTION);
    }

    fun create_pet_passport_tables(
        pet_info: vector<String>,
        owner_info: vector<String>,
        receiver: address,
        microchip_info: vector<String>,
        ctx: &mut TxContext 
    ): (Table<String, String>, Table<String, String>, Table<String, String>){
        let owner_info_table = table::new<String, String>(ctx);
        table::add(&mut owner_info_table, string::utf8(b"name"), *vector::borrow(&owner_info, 0));
        table::add(&mut owner_info_table, string::utf8(b"address"), address::to_string(receiver));
        table::add(&mut owner_info_table, string::utf8(b"contact"), *vector::borrow(&owner_info, 1));
        let pet_info_table = table::new<String, String>(ctx);
        table::add(&mut pet_info_table, string::utf8(b"name"), *vector::borrow(&pet_info, 0));
        table::add(&mut pet_info_table, string::utf8(b"species"), *vector::borrow(&pet_info, 1));
        table::add(&mut pet_info_table, string::utf8(b"breed"), *vector::borrow(&pet_info, 2));
        table::add(&mut pet_info_table, string::utf8(b"gender"), *vector::borrow(&pet_info, 3));
        table::add(&mut pet_info_table, string::utf8(b"dob"), *vector::borrow(&pet_info, 4));
        table::add(&mut pet_info_table, string::utf8(b"color/markings"), *vector::borrow(&pet_info, 5));
        let microchip_info_table = table::new<String, String>(ctx);
        table::add(&mut microchip_info_table, string::utf8(b"name"), *vector::borrow(&microchip_info, 0));
        table::add(&mut microchip_info_table, string::utf8(b"address"), *vector::borrow(&microchip_info, 1));
        table::add(&mut microchip_info_table, string::utf8(b"contact"), *vector::borrow(&microchip_info, 2));
        (pet_info_table, owner_info_table, microchip_info_table)
    }

    //==============================================================================================
    // Role Validation Functions
    //==============================================================================================

    fun assert_adopter(user: address, roles: &mut Roles) {
        assert!(role::is_adopter(user, roles) , ERROR_SIGNER_NOT_APPROVED_ADOPTER);
    }

    fun assert_vet(user: address, roles: &mut Roles) {
        assert!(role::is_vet(user, roles) , ERROR_SIGNER_NOT_VET);
    }

    fun assert_admin_or_operator(user: address, roles: &mut Roles) {
        assert!(user == @admin || role::is_operator(user, roles), ERROR_SIGNER_NOT_ADMIN_OR_OPERATOR);
    }

    //==============================================================================================
    // Tests 
    //==============================================================================================
    #[test]
    fun test_init_success() {
        let module_owner = @0xa;

        let scenario_val = test_scenario::begin(module_owner);
        let scenario = &mut scenario_val;

        {
            init(test_scenario::ctx(scenario));
        };
        let tx = test_scenario::next_tx(scenario, module_owner);
        let expected_events_emitted = 0;
        let expected_created_objects = 1;
        assert_eq(
            test_scenario::num_user_events(&tx), 
            expected_events_emitted
        );
        assert_eq(
            vector::length(&test_scenario::created(&tx)),
            expected_created_objects
        );
        test_scenario::end(scenario_val);
    }

    #[test]
    fun test_mint_nft_success() {
        let module_owner = @0x0;
        let user = @0xa;
        
        let scenario_val = test_scenario::begin(module_owner);
        let scenario = &mut scenario_val;
        test_scenario::next_tx(scenario, user);
        init(test_scenario::ctx(scenario));
        test_scenario::next_tx(scenario, user);
        let pet_info = vector[
            string::utf8(b"spot"), 
            string::utf8(b"dog"), 
            string::utf8(b"corgy"), 
            string::utf8(b"male"), 
            string::utf8(b"1/1/23"), 
            string::utf8(b"brown, white spots")
        ];
        let url = string::utf8(b"test_url");
        let owner_info = vector[
            string::utf8(b"bob"), 
            string::utf8(b"bob@bobmail.com")
        ];
        let microchip_info = vector[
            string::utf8(b"123"), 
            string::utf8(b"1/1/24"), 
            string::utf8(b"shoulder")
        ];
        {
            let state = test_scenario::take_shared<State>(scenario);
            let payment = coin::mint_for_testing<SUI>(PRICE, test_scenario::ctx(scenario));
            mint_passport(
                pet_info,
                url,
                owner_info,
                user,
                microchip_info,
                payment, 
                &mut state,
                test_scenario::ctx(scenario)
            );
            test_scenario::return_shared(state);
        };
        
        let tx = test_scenario::next_tx(scenario, user);
        let expected_events_emitted = 1;
        assert_eq(
            test_scenario::num_user_events(&tx), 
            expected_events_emitted
        );

        {
            let nft = test_scenario::take_from_sender<PetPassport>(scenario);

            assert_eq(
                nft.name, 
                string::utf8(b"Pet_#1: spot")
            );

            test_scenario::return_to_sender(scenario, nft);
        };
        
        test_scenario::end(scenario_val);
    }

    #[test]
    fun test_add_vac_record_success() {
        let module_owner = @0x0;
        let user = @0xa; 
        let vet = @0xb;
        let admin = @0xb51c29c74c5e348dc58ad0a2e138299474b2463077ba150076907ff62885c900;
        
        let scenario_val = test_scenario::begin(module_owner);
        let scenario = &mut scenario_val;
        test_scenario::next_tx(scenario, user);
        init(test_scenario::ctx(scenario));
        test_scenario::next_tx(scenario, user);
        let pet_info = vector[
            string::utf8(b"spot"), 
            string::utf8(b"dog"), 
            string::utf8(b"corgy"), 
            string::utf8(b"male"), 
            string::utf8(b"1/1/23"), 
            string::utf8(b"brown, white spots")
        ];
        let url = string::utf8(b"test_url");
        let owner_info = vector[
            string::utf8(b"bob"), 
            string::utf8(b"bob@bobmail.com")
        ];
        let microchip_info = vector[
            string::utf8(b"123"), 
            string::utf8(b"1/1/24"), 
            string::utf8(b"shoulder")
        ];
        {
            let state = test_scenario::take_shared<State>(scenario);
            let payment = coin::mint_for_testing<SUI>(PRICE, test_scenario::ctx(scenario));
            mint_passport(
                pet_info,
                url,
                owner_info,
                user,
                microchip_info,
                payment, 
                &mut state,
                test_scenario::ctx(scenario)
            );
            test_scenario::return_shared(state);
        };
        role::init_for_testing(test_scenario::ctx(scenario));
        test_scenario::next_tx(scenario, admin);
        {
            let roles = test_scenario::take_shared<Roles>(scenario);
            role::grant_role(vet, string::utf8(b"vet"), &mut roles, test_scenario::ctx(scenario));
            test_scenario::return_shared(roles);
        };
        test_scenario::next_tx(scenario, vet);
        {
            let nft = test_scenario::take_from_address<PetPassport>(scenario, user);
            let roles = test_scenario::take_shared<Roles>(scenario);
            add_vac(
                &mut nft,
                string::utf8(b"vac_date"),
                string::utf8(b"vac_ref_no"),
                string::utf8(b"date_valid_from"),
                string::utf8(b"expiry_date"),
                string::utf8(b"cert_image_uri"),
                &mut roles,
                test_scenario::ctx(scenario)  
            );
            test_scenario::return_to_address(user, nft);
            test_scenario::return_shared(roles);
        };
        test_scenario::next_tx(scenario, user);
        {
            let nft = test_scenario::take_from_sender<PetPassport>(scenario);
            assert_eq(
                vector::length(&nft.vaccination_rec), 
                1
            );
            test_scenario::return_to_sender(scenario, nft);
        };
        
        test_scenario::end(scenario_val);
    }

        #[test]
    fun test_add_clinical_record_success() {
        let module_owner = @0x0;
        let user = @0xa; 
        let vet = @0xb;
        let admin = @0xb51c29c74c5e348dc58ad0a2e138299474b2463077ba150076907ff62885c900;
        
        let scenario_val = test_scenario::begin(module_owner);
        let scenario = &mut scenario_val;
        test_scenario::next_tx(scenario, user);
        init(test_scenario::ctx(scenario));
        test_scenario::next_tx(scenario, user);
        let pet_info = vector[
            string::utf8(b"spot"), 
            string::utf8(b"dog"), 
            string::utf8(b"corgy"), 
            string::utf8(b"male"), 
            string::utf8(b"1/1/23"), 
            string::utf8(b"brown, white spots")
        ];
        let url = string::utf8(b"test_url");
        let owner_info = vector[
            string::utf8(b"bob"), 
            string::utf8(b"bob@bobmail.com")
        ];
        let microchip_info = vector[
            string::utf8(b"123"), 
            string::utf8(b"1/1/24"), 
            string::utf8(b"shoulder")
        ];
        {
            let state = test_scenario::take_shared<State>(scenario);
            let payment = coin::mint_for_testing<SUI>(PRICE, test_scenario::ctx(scenario));
            mint_passport(
                pet_info,
                url,
                owner_info,
                user,
                microchip_info,
                payment, 
                &mut state,
                test_scenario::ctx(scenario)
            );
            test_scenario::return_shared(state);
        };
        role::init_for_testing(test_scenario::ctx(scenario));
        test_scenario::next_tx(scenario, admin);
        {
            let roles = test_scenario::take_shared<Roles>(scenario);
            role::grant_role(vet, string::utf8(b"vet"), &mut roles, test_scenario::ctx(scenario));
            test_scenario::return_shared(roles);
        };
        test_scenario::next_tx(scenario, vet);
        {
            let nft = test_scenario::take_from_address<PetPassport>(scenario, user);
            let roles = test_scenario::take_shared<Roles>(scenario);
            add_clinical_rec(
                &mut nft,
                string::utf8(b"date_time"),
                string::utf8(b"records"),
                &mut roles,
                test_scenario::ctx(scenario)  
            );
            test_scenario::return_to_address(user, nft);
            test_scenario::return_shared(roles);
        };
        test_scenario::next_tx(scenario, user);
        {
            let nft = test_scenario::take_from_sender<PetPassport>(scenario);
            assert_eq(
                vector::length(&nft.clinical_rec), 
                1
            );
            test_scenario::return_to_sender(scenario, nft);
        };
        
        test_scenario::end(scenario_val);
    }

    #[test]
    fun test_adopt_success() {
        let module_owner = @0x0;
        let user = @0xa;
        let admin = @0xb51c29c74c5e348dc58ad0a2e138299474b2463077ba150076907ff62885c900;
        
        let scenario_val = test_scenario::begin(module_owner);
        let scenario = &mut scenario_val;
        {
            clock::share_for_testing(clock::create_for_testing(test_scenario::ctx(scenario)));
        };
        test_scenario::next_tx(scenario, user);
        init(test_scenario::ctx(scenario));
        test_scenario::next_tx(scenario, user);
        let pet_info = vector[
            string::utf8(b"spot"), 
            string::utf8(b"dog"), 
            string::utf8(b"corgy"), 
            string::utf8(b"male"), 
            string::utf8(b"1/1/23"), 
            string::utf8(b"brown, white spots")
        ];
        let url = string::utf8(b"test_url");
        let owner_info = vector[
            string::utf8(b"bob"), 
            string::utf8(b"bob@bobmail.com")
        ];
        let microchip_info = vector[
            string::utf8(b"123"), 
            string::utf8(b"1/1/24"), 
            string::utf8(b"shoulder")
        ];
        let now;
        {
            let state = test_scenario::take_shared<State>(scenario);
            let clock = test_scenario::take_shared<Clock>(scenario);
            list_adoption(
                pet_info,
                url,
                microchip_info,
                &mut state,
                &clock,
                test_scenario::ctx(scenario)
            );
            now = clock::timestamp_ms(&clock);
            test_scenario::return_shared(state);
            test_scenario::return_shared(clock);
        };
        
        role::init_for_testing(test_scenario::ctx(scenario));
        test_scenario::next_tx(scenario, admin);
        {
            let roles = test_scenario::take_shared<Roles>(scenario);
            role::grant_role(user, string::utf8(b"adopter"), &mut roles, test_scenario::ctx(scenario));
            test_scenario::return_shared(roles);
        };
        test_scenario::next_tx(scenario, user);
        {
            let roles = test_scenario::take_shared<Roles>(scenario);
            let state = test_scenario::take_shared<State>(scenario);
            let payment = coin::mint_for_testing<SUI>(PRICE, test_scenario::ctx(scenario));
            adopt(now, owner_info, payment, &mut roles, &mut state, test_scenario::ctx(scenario));
            test_scenario::return_shared(roles);
            test_scenario::return_shared(state);
        };
        test_scenario::end(scenario_val);
    }

}
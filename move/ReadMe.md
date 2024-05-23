# Pet Passport Contract

## Entry Functions:
### 1. mint_passport
 - For registering a pet you own
 - args:
    
    pet_info: vector<name, species, breed, gender, dob, color or markings>,
    url: String,
    owner_info: vector<name, contact details>,
    receiver: address,
    microchip_info: vector<microchip number, date of chipping, location of microchip>,
    payment: Coin<SUI>, 
    state: 0x6a79e24c586658d90f6d97eb3416c162a3c5bbfeb748ace6598eb8eef64d02b5

### 2. list_adoption 
- For registering a pet up for adoption
- args:

    pet_info: vector<name, species, breed, gender, dob, color or markings>,
    url: String,
    microchip_info: vector<microchip number, date of chipping, location of microchip>,
    state: 0x6a79e24c586658d90f6d97eb3416c162a3c5bbfeb748ace6598eb8eef64d02b5,
    clock: 0x6

### 3. transfer 
- To transfer a pet ownership
- Can only be called by PetPassport owner
- args:

    nft: PetPassport, recipient: address

### 4. add_vac 
- Add vaccination record
- Can only be called by user with "vet" role
- args:

    nft: PetPassport
    vac_date: String,
    vac_ref_no: String,
    date_valid_from: String,
    expiry_date: String,
    cert_image_uri: String,
    roles: 0xf0d6324a6443fcc9ce3ab686e1d93b69a918f699848c3d7baedca1c6fcfc21d9

### 5. add_clinical_rec
- Add clinical record
- Can only be called by user with "vet" role
- args:

    nft: PetPassport,
    date_time: String, //date and time of report
    clinical_report: String,
    roles: 0xf0d6324a6443fcc9ce3ab686e1d93b69a918f699848c3d7baedca1c6fcfc21d9

### 6. adopt
- To adopt up-for-adoption pets
- Can only be called by user with "adopter" role
- args:

    pet_id: u64,
    owner_info: vector<name, contact details>,
    payment: Coin<SUI>, 
    roles: 0xf0d6324a6443fcc9ce3ab686e1d93b69a918f699848c3d7baedca1c6fcfc21d9,
    state: 0x6a79e24c586658d90f6d97eb3416c162a3c5bbfeb748ace6598eb8eef64d02b5


-------------------------------------------------------------------

# Role Contract

## Entry Functions:
### 1. grant_role
- Can only be called by "admin" or "operator"
- Only "admin" can grant new "operator" roles
- "Operator" can grant new "vet" and "adopter" roles
- args:

    user: address,
    role: String,
    roles: 0xf0d6324a6443fcc9ce3ab686e1d93b69a918f699848c3d7baedca1c6fcfc21d9

### 2. revoke_role
- Can only be called by "admin" or "operator"
- Only "admin" can revoke "operator" roles
- "Operator" can revoke "vet" and "adopter" roles
- args:

    user: address,
    roles: 0xf0d6324a6443fcc9ce3ab686e1d93b69a918f699848c3d7baedca1c6fcfc21d9


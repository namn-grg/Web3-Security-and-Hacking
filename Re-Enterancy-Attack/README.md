There are basically 2 ways for preventtion either use the Openzapplin library which comes named "nonReentrant" with code like this:

<br/>

```
modifier nonReentrant() {
    require(!locked, "No re-entrancy");
    locked = true;
    _;
    locked = false;
}
```

or simply write correct code, like do the ` balances[msg.sender] = 0; ` thing before fallback.

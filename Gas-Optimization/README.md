# IMPORTANT GAS OPTIMIZATION TIPS:-

### 1. It is better to declare function as external/ internal when it is. Pulic fns use more gas.

### 2. Using internal functions in the modifiers. Modifiers use the same stack space as a function (upto 16).

### 3. Using libraries is also very gas efficient. Eg. libraries from openzappelin do not add upto gas cost.

### 4. When using (||) or (&&) better to add terminate the statement as soon as possible. (T F F) is better than (F F T).

### 5. Use 'delete' keyword when you don't need a variable, this refunds the gas!!

### 6. Dont update the value of Storage variables often. Instead use temp variable and finally assign the value.

### 7. Make sure that the error strings in your require statements are of very short length, the more the length of the string, the more gas it will cost.

### 8. Fixed length variables are better than variable length.

### 9. Use the concept of variable packing 🚀.

### 10. Make your contract as specific as possible.

### 11. Using 'constant' keyword.

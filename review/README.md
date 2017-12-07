# Assignment A - Project Euler 4
### Directions

1. Instructions should be pretty simple. They can be found [here](https://projecteuler.net/problem=4).
    - The palindrome is the hardest part. I've got a hint below that you'll have to hover over to see.
> ! Casting and coercion

# Assignment B  - Monster Class

### Directions

1. Create a new `Monster` class in a new header file with the properties `m_type`, `m_health`, `m_inventory`, `m_hitRate`, and `m_attackDamage`.
    - Normally, you'd create an item class for items within the monster's inventory, but for now, just make it a 10-element array. I'll leave it to you to determine the correct data type for each element.
2. Within the class, create a private enum class `MonsterType` with types `ORC`, `DRAGON`, `LIGER`, `FSM`, and `VEGAN_CHEESE_BEAST`
3. Create a monster constructor that provides default values for all the member variables.
4. Create a `print()` method that prints the Monster in the form: `Monster(<NAME OF THE MONSTER>)`
5. Create a `status()` method that prints the Monster's health, attack damage, and inventory.
6. Create a `fight(<Other Monster>)` method that takes in another monster to fight. The function will randomly decide which monster will go first. 
    - Once this decision is made, the function will alternate between each monster and have it attack the other monster **(note, you can break this function into multiple helper funcitons)**. 
    - If some randomly generated value between 0 and 1 is ≤ the monster's `m_hitRate`, it should attack. Otherwise, the attack missed. 
    - Print the name of the monster that won and the item that the monster dropped.
6. Test your function in main. Your test code should test the constructor, `print()`, and `fight()`


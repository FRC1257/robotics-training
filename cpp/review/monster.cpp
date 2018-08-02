#include "monster.h"

int main()
{
    monster fighter(FSM, 20, 3, 1); // monster(type, health, attack, speed)
    fighter.printName(); // prints Monster(type)
    fighter.printStatus(); // prints health, attack, and inventory
    monster defender(CTHULHU, 20, 3, 3);
    fighter.fight(defender);
    return 0;
}
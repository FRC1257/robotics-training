#include <iostream>
using namespace std;

// Defining a Color enum
// Each value gets an integer value
enum Color
{
    RED,
    BLUE,
    GREEN = 100, // You can explicitly assign integer values, like this
    MAGENTA,
    HOT_DOG_RED,
    VEGAN_CHEESE_YELLOW
};

enum Monster
{
    ORC,
    ZOMBIE,
    DRAGON,
    GOBLIN,
    FSM,
    CTHULHU,
    MR_SANSERVINO
};

int main()
{
    // Declare myFavoriteColor as RED
    Color myFavoriteColor = RED;

    // What does it print out?
    cout << "myFavoriteColor: " << myFavoriteColor << endl;

    // Delcare a new monster with a value of ORC
    Monster jeff = ORC;

    // What happens here?
    if (myFavoriteColor == jeff)
    {
        // This one prints because both jeff and myFavoriteColor equal 0
        // (They are both the zeroeth element in the list for the enum values)
        cout << "Colors and monsters can be equal" << endl;
    }
    else
    {
        cout << "Colors and monsters can't be equal" << endl;
    }

    return 0;
}
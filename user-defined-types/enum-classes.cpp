#include <iostream>
using namespace std;

// Defining a Color enum
// Each value gets an integer value
enum class Color
{
    RED,
    BLUE,
    GREEN = 100, // You can explicitly assign integer values, like this
    MAGENTA,
    HOT_DOG_RED,
    VEGAN_CHEESE_YELLOW
};

enum class Monster
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
    // Declare myFavoriteColor as VEGAN_CHEESE_YELLOW
    Color myFavoriteColor = Color::RED;
    // Declare jeff as an ORC
    Monster jeff = Monster::ORC;

    // What does it print out?
    cout << "myFavoriteColor: " << (int)myFavoriteColor << endl;

    // The program won't run because the == operator doesn't know how to compare a Color and a Monster
    /*
    if (myFavoriteColor == jeff)
    {
        // This one prints because both jeff and myFavoriteColor equal 0
        cout << "Colors and monsters can be equal" << endl;
    }
    else
    {
        cout << "Colors and monsters can't be equal" << endl;
    }
    */

    return 0;
}
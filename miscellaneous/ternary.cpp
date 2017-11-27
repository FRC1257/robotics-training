#include <iostream>

using namespace std;

int main()
{
    //ternary operator (condition) ? true : false
    int num = (1==1) ? 0 : -1;
    if (1 == 1)
    {
        int num = 0;
    }
    else
    {
        int num = -1;
    }
    // num is 0, 1 is equal to 1
    int newnum = (num == 1) ? 7 : 5;
    if (num == 1)
    {
        int newnum = 7;
    }
    else
    {
        int newnum = 5;
    }
    // set newnum to 5, 0 != 1
    cout << ((newnum > 6) ? "Hello" : "Goodbye") << endl; // ternary operators within functions
    if (newnum > 6)
    {
        cout << "Hello" << endl;
    }
    else
    {
        cout << "Goodbye" << endl;
    }
    // newnum is 5 which is less than 6 so prints goodbye
    
    // cout << (newnum > 6) ? "Hello" : "Goodbye" << endl;
    // without parenthesis the << endl; is included as part of the ternary
    
    return 0;
}
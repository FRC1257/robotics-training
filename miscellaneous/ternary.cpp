#include <iostream>

using namespace std;

int main()
{
    //ternary operator (condition) ? true : false
    int num = (1==1) ? 0 : -1;
    /*
    return num; // exits with code 0, 1 is equal to 1
    */
    int newnum = (num == 1) ? 7 : 5;
    
    cout << ((newnum > 6) ? "Hello" : "Goodbye") << endl;
    return num;
}
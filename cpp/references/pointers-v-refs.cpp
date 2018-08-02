#include <iostream>
using namespace std;

int main()
{
    int x = 3;
    int y = 9;
    
    cout << "x = " << x << endl;
    cout << "y = " << y << endl;
    
    //Does this work?
    int *ptr = &x;
    ptr = &y;
    
    cout << "*ptr = " << *ptr << endl;
    
    //How about this?
    int &ref = y;
    ref = x;
    
    cout << "ref = " << ref << endl;
    cout << "x = " << x << endl; // n 
    cout << "y = " << y << endl; 
    
    
    return 1;
}
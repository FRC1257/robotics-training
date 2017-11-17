#include <iostream>
#include <typeinfo>
using namespace std;

void printInfo(int num, int &referenceToNum)
{
    cout << "num = " << num << endl;
    cout << "referenceToNum = " << referenceToNum << endl << endl;
}

int main()
{
    int num = 9;
    // Creates a reference to num
    // A reference is just like an alias
    int &referenceToNum = num;
    printInfo(num, referenceToNum);
    
    // Change the value of the reference
    // What happens to num?
    referenceToNum = 5;
    printInfo(num, referenceToNum);
    
    // What if we change num?
    num = 3;
    printInfo(num, referenceToNum);
    
    return 0;
}
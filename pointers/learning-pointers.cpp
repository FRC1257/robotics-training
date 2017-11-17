#include <iostream>
#include <typeinfo>
using namespace std;

int main()
{
    int num = 4;
    
    // Declare a pointer to num
    int *pointerToNum = &num;
    
    
    // cout << num  << endl; // Prints out 4
    // cout << &num << endl; // Prints out the address of num
    // cout << pointerToNum << endl;
    // num++;
    // // Changing num doesn't change the address of num, just the value inside it
    // cout << num << endl;
    // cout << &num << endl;
    
    // Declaring another pointer
    short smallNum = 4;
    short *ptrToSmallNum = &smallNum;
    
    // cout << "Pointer to letter info: " << endl;
    // cout << smallNum << endl;
    // cout << ptrToSmallNum << endl;
    // // Dereferencing a value
    // cout << *ptrToSmallNum << endl;
    // cout << *&smallNum << endl;
    
    // // Assigning a value of 100 to 'smallNum'
    // *ptrToSmallNum = 100;
    // cout << smallNum << endl;
    
    // How are arrays and pointers related?
    short testGrades[] = {80, 40, 100};
    
    cout << testGrades << endl; // Arrays actually point to the first value in the array
    cout << *testGrades << endl; // Prints out 80
    
    //Pointer arithmetic
    cout << *(testGrades + 1) << endl; // Prints out the memory address of 40
    cout << *(testGrades + 2) << endl; // Prints out the memory address of 100
    
    cout << *testGrades * *(testGrades + 1) << endl;
    cout << *testGrades + 2 << endl;
    
    return 0;
}
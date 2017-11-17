#include <iostream>
using namespace std;

// Print every value in an array
void printArrayVals(int array[], unsigned int size)
{
    for(int i = 0; i < size; i++)
    {
        cout << array[i] << endl;
    }
}

int main()
{
    //Declare an array (fixed-width)
    int numbers[3];
    numbers[0] = 17; // Sets the first value in the numbers array to 17
    numbers[1] = 15; // Sets the second value to 15
    numbers[2] = -100; //Sets the thrid value to -100
    
    // Printing out -100
    cout << numbers[2] << endl;
    
    
    // What happens when we try to access an array out of bounds?
    //cout << numbers[-100];
    
    // What's the size of the numbers array?
    int numbersLength = sizeof(numbers) / sizeof(numbers[0]);
    
    
    // Creates a list of 10 zeroes
    int scores[10] = {};
    
    // Creates a list of names
    const int numNames = 5;
    string names[numNames] = {
        "Jeff",
        "Zach",
        "Harsh",
        "Karen",
        "Kenya"
    };
    return 0;
}
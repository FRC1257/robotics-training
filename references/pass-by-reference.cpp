#include <iostream>
#include <cstdlib>
#include <vector>
using namespace std;

void assignRandomVals(vector<int> &array, int size)
{
    int randNum;
    for(int i = 0; i < size; i++)
    {
        //Define my random value
        randNum = rand();
        //Append it to the end of the array
        array.push_back(randNum);
    }
}

void printArray(vector<int> &array) 
{
    for(int i = 0; i < array.size() - 1; i++)
    {
        cout << array[i] << ", ";    
    }
    cout << array[array.size() - 1];
}

int main()
{
    // Start the random number generator using a seed of 900
    srand(900);
    
    vector<int> largeArray;
    
    // How do we call this function?
    assignRandomVals(largeArray, 1000);
    printArray(largeArray);
    
    return 0;
}
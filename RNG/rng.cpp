#include <iostream>
#include <cstdlib>
#include <ctime>
using namespace std;

// This function returns a random number that is below a given upper bound
int randLessThan(int upperBound) 
{
    // This will provide a full range of values from 1 to upperBound
    // Note that I don't have to reseed rand, I just use it normally
    // and make sure to seed the RNG in int main() before this function
    // is called.
    return (rand() % upperBound) + 1;
}

int main() 
{
    // Random number generation
    // Start by grabbing the system time of the computer
    unsigned int sysTime = (unsigned int)time(0);
    
    // Plug in the system time as our random seed
    // Basically, random number generators work by performing some algorithm
    // on the previous value produced by the generator. When you first run the
    // RNG, there is no "previous value" to begin with, so you have to provide
    // a "seed" so that subsequent values can be generated.
    srand(sysTime);
    
    // After you've called srand once, which you do in int main(), you never have to
    // reseed the generator. Just call rand() anywhere in your code.
    int firstRandNum = rand();
    int secondRandNum = rand();
    int thirdRandNum = randLessThan(100); // See the function definition
    
    return 0;    
}
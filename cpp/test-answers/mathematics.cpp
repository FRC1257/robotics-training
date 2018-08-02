#include "math.h"
#define PRIME_COUNT 3000

int main()
{
    int sum = 0; int testCase = 2; int numPrimes = 0;
    while (numPrimes < PRIME_COUNT)
    {
        if (isPrime(testCase))
        {
            sum += testCase;
            ++numPrimes;
            printf("Prime %d: %d\n", numPrimes, testCase);
        }
        ++testCase;
    }
    printf("The sum of the first %d primes is %d", PRIME_COUNT, sum);
}
/*In it, define a function, isPrime(), that takes in a number and returns whether or not it is prime.
Note 1 : Just a reminder: 1 is not a prime number, 2 is prime, 3 is prime, 5 is prime, etc.
Note 2 : If you get a floating point error, it is likely due to an issue with division by 0.
Note 3 : Make sure to test that your function works as expected and works in the edge cases (2 and 3 mainly).
In a file called mathematics.cpp, use your isPrime() function to complete the following task:
Write a program that prints the sum of the first 3000 prime numbers*/
#ifndef MY_HEADER_FILE
#define MY_HEADER_FILE
#include <cstdio>

    bool isPrime (int n)
    {
        if (n == 2 || n == 3) return true;
        if (n % 2 == 0) return false;
        for (int i = 3; i < n; i += 2)
        {
            if (n % i == 0) return false;
        }
        return true;
    }
    
#endif
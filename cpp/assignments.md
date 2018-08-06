# Today's Assignments

Mostly just reviewing

1. Advanced - Project Euler Problem 4
2. Functions, Loops, and Conditionals - Project Euler Problem 9
3. Functions - Project Euler 19
4. Arrays - Sorting Algorithms

## Selection Sort
We're going to start off learning about selection sort, because its simple and robust. tPlus, you already know all of the programming concepts needed to implement it.

Let's start with the following code:

```cpp
const int length = 5;
int array[length] = { 30, 50, 20, 10, 40 };
```

So here's how the algorithm works:

* Start at index 0

{ 30, 50, 20, **10**, 40 }

 * Find the smallest array value

{ **10**, 50, 20, **30**, 40 }

 * Swap the smalles array value using `std::swap(array[startingIndex], array[lowestIndex])`

 * Continue sorting from the second array index and find the lowest value

{ 10, 50, **20**, 30, 40 }

 * Swap 20 with the value in the second array value

{ 10, **20**, **50**, 30, 40 }

 * Continue this process until the array is sorted.

# Arrays

A few lessons back, we learned what variables were: a way to store data. While creating only one variable seems like a concise and efficient way to store data, things can get very messy once hundreds or thousands of variables need to be created. To deal with this issue, Java has a very useful feature which is called an array.

## What exactly are arrays?

The standard definition of an array is "a collection of variables from the same data type." From this collection variables we can access the variable that is needed very easily.

## Declaring an array

In Java, there are quite a few ways to declare arrays. Nevertheless, I will cover the most straightforawrd way first.
```java
public class Main {
    public static void main(String[] args) {
        int[] myArray = new int[5];
    }
}
```
This array just created is an array of ints as the first word in the line was `int`. If the first word was `double`, the array would have `double`s in it.

* Then, `int` is followed by two brackets. This is signifies that what your are declaring is an array.

* After the brackets is the variable name. In this example the name is "myArray" but just like all variable names they can be whatever the programmer desires.

* Then comes the equal sign which is always used when assigning a variable to something.
The next word is not very relevant currently but in a few lessons it will be explored. For the the purposes of this lesson `new` just means that a new array will be made.

* The last two things is the int followed by a number in brackets. Just like the `int` in the very beginning of the declaraton, it could be changed to `double` or `float` if the contents of the array were doubles or floats.

* On the other hand, the number inside the brackets has nothing to do with data types in the array. It actually has to do with the number of "elements" or number of variables in the array. This number can not be changed so it is important to know beforehand the number of variables in an array. In the example there are five `int` variables in this array.

## Assigning Variable Values To An Array

Although we created an array with five `int` variables in them, the varibles are undefined. Below the varibales will be assigned a value.

```java
public class Main {
    public static void main(String[] args) {
        int[] myArray = new int[5];
        
        myArray[0] = 4;
        myArray[1] = 8;
        myArray[2] = -7;
        myArray[3] = 2;
        myArray[4] = 1;
    }
}
```
To change the value of a variable we need to first access it by refering to it by its name. In arrays, we use the array name followed by brackets with its element number. In arrays the first element made has a number of 0 and the second has a number of 1. As a result, in an array with 5 variable the last element number will be 4.

Once the variable is accessed the variable can be assigned a value with an equal sign followed by something from the same data type. For the data type `int`, we can only use whole numbers.

## What Else Can Be Done With Variables In Arrays?

Just like any normal variables the variables within arrays can be assigned a new value be added to or subtracted from. They can also be outputed. Below are examples of each instance happenning.

```java
public class Main {
    public static void main(String[] args) {
        int[] myArray = new int[5];
        
        myArray[0] = 4;
        myArray[1] = 8;
        myArray[2] = -7;
        myArray[3] = 2;
        myArray[4] = 1;
        
        myArray[2] = 5; //Assigns the third element to 5.
        myArray[3] += 2; // Adds to fourth element. It becomes 4.
        System.out.println(myArray[4]); // Prints out the fifth element of the array.
    }
}
```

## Alternate Ways of Declaring Arrays
This section is optional to read but if you are interested, enjoy.

```java
public class Main {
    public static void main(String[] args) {
        int[] myArray = new int[] {1, 4, 8, 9, -2}; // declares array
    }
}
```

Here, instead of declaring in one line and assigning in the subsequent lines, we are doing everything in the same line. There is also no need for a number in the brackets to represent the number of elements because all of them are listed out. While this is a concise way of declaring an array, the values of the numbers have to be given immediately which may not be ideal in certain situations.

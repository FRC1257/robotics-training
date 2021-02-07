# Arrays

## What Are Arrays?

Arrays are another type of variable that are used to hold a list of variables. For instance, we can make an `int` array that stores several integers all in a single variable.

## Making an Array

In Java, there are two different ways of creating an array. The more simple version is shown below:

```java
public class Main {
    public static void main(String[] args) {
        int[] myArray = new int[5];
    }
}
```

Let's break down exactly what this does:

* Arrays are just like any variable, so we must put the type: `int[]`
  * The `[]` part is what tells us that this is an array of `int`s, not just a normal `int` variable
* Next, we put the variable name: `myFirstVariable`
* Finally, we have `= new int[5]`, where `5` is the length of the array, or how many elements it can contain
  * An array has a fixed length that we have to set when we create the array

## Assigning Variable Values To An Array

Once we've created our `int` array, we can access each of the `int` elements inside of it using the following notation:

`myArray[` + index + `]`

The index is used to determine which of the 5 elements of the array we want to use. One thing to note about indices is that they start from `0`, meaning that `myArray[0]` refers to the first element in the array. `myArray[1]` refers to the second, `myArray[2]` refers to the third, and so on.

Once we have accessed an element in the array, we can use it just like a normal `int` variable.

```java
public class Main {
    public static void main(String[] args) {
        int[] myArray = new int[5];
        
        myArray[0] = 4;
        myArray[1] = 8;
        myArray[2] = -7;
        myArray[3] = 2;
        myArray[4] = 1;
        
        myArray[2] = 5; // Assigns the third element to 5
        myArray[3] += 2; // Adds to the fourth element, which becomes 4
        System.out.println(myArray[4]); // Prints out the fifth element of the array
    }
}
```

## Making an Array with Initializer List

When we want to create an array, sometimes we already know all of the values we're going to be storing, and it's very tedious to have to put all of them in on separate lines. To speed this up, there is a way to just create an array with all of the values inside of it using an initializer list:

```java
public class Main {
    public static void main(String[] args) {
        int[] myArray = new int[] {4, 8, -7, 2, 1}; // Creates the same array as from before
    }
}
```

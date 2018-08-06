# Console Input
In our first program, we dealt with console output, where we printed out some text of our choosing. Now, we will learn how to enable the user to enter in some text.

# Scanner
Scanner is a file included with Java that we can use in our programs. It enables the program to read input from the user, whether it is through files, the console, or other objects. In this case, we will be discussing how to use it with the console.

# Import Statements
In order for our program to use Scanner, we must write something called an import statement at the top of our file: `import java.util.Scanner`. This statement essentially enables our program to use other files. Without it, the program would not know what the Scanner file is, and we would not be able to use it.
* `import` tells the program that we want to import something
* `java.util.` tells the program where the file that we want to import is
* `Scanenr` is the name of the file that we want to import

# Creating a Scanner Variable
To utilize the scanner file that we just imported, we first have to create a Scanner variable. Similar to how we can create an int: `int testInt = 3;`, we can make a variable of type Scanner: `Scanner testScanner = new Scanner(System.in)`. 
* `Scanner testScanner = ` - This is familiar, we create a variable called `testScanner` of the type `Scanner`
* `new Scanner()` - This line is how you create a new type of variable called Scanner. We will discuss the exact syntaz later when we talk about objects.
* `(System.in)` - This is a parameter we pass into our Scanner variable to tell it where to search for input. Again, we will discuss this mroe in depth when we talk about objects. For now, know that System.in tells us to take input from the command line. 

# Using a Scanner Variable
Now that we have created a variable called 'testScanner', we can use it get console input. There are few main things to learn here:
* `int testInt = testScanner.nextInt();` - In this case, we are setting the value of the variable `testInt` to the next integer the Scanner detects from the user
* `double testDouble = testScanner.nextDouble();` - In this case, we are setting the value of the variable `testInt` to the next integer the Scanner detects from the user
* `String testString = testScanner.nextLine();` - In this case, we are setting the value of the variable `testString` to the next line of text the Scanner detects from the user
  
As you can see with `int` and `double`, there is a pattern here. You can also use `testScanner.nextByte()`, `testScanner.nextChar()`, etc. For Strings, it is a bit different, since there are various formatting options. You can go online to find all of the various options you have.
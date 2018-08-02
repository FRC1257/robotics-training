# First Program

## Java Overview
Java is an object-oriented, platform independent programming language. It is similar to languages like C++, C#, Python, Javascript, and other languages, so if you have experience with those, learning Java will be easier for you.

## Our First Java Program
All of our Java programs will have a similar basic structure. This structure can be seen in the file "HelloWorld.java", and it involves several components that may seem confusing at first.

* `public class HelloWorld {`
    * This line creates something known as a **class** in Java. We will cover this in depth later in the year, but for now, just know that all of the files we create in Java have to contain this line.
    * Note that the class name "HelloWorld" should match the name of the file. i.e. HelloWorld.java has the class HelloWorld, Main.java has the class Main
    * The opening curly bracket `{` tells us where the class begins and ends. Everything inside of the brackets is part of the class "HelloWorld", and everything outside of the brackets is not
* `public static void main(String[] args) {`
    * This is the main part of the program. Everything inside of the curly brackets will be executed as code once we hit the run button
    * This has some complicated syntax and words in it, but you will have to memorize it for now. If we have time, we can break this down later in the year once we have acquired more knowledge
    * Note that this is contained inside of the brackets for `public class Hello World`, so this is inside of that class
* `System.out.println("Hello World!");`
    * This is the main line in our program. Everything else is just setup/framework that is necessarry in every program we write, but this is the line that actually does what we want
    * This line prints out the words "Hello World!" to the console
    * There are two parts of this piece of code:
        * First we have the name of the function `System.out.println();`
            * This essentially tells the computer that we want to print something out
        * Next, we have the parameters `"Hello World!"`
            * This tells the computer what we want to print out.
            * We can change this part to anything else, and the computer will print out what we want
    * In general, everything in Java will be one of two things, either a calculation like 2+2, or a function call. This is a function call
        * A function has a name, in this case `System.out.println`
        * and some parameters that depends on the function, in this case the text we want to print out `"Hello World"`
            * Note that we put "Hello World" in quotes, which tells the computer that this is a block of text, not some other name. We will see why this is necessarry when we cover variables
* `}`
    * We are closing our brackets for the `public static void main(String[] args) {` section
    * Notice that everything inside of the brackets was indented. This helps make our code look neat and make it clear exactly what is inside brackets and what isn't
* `}`
    * We are closing our brackets for the `public class HelloWorld {` section 

This was a lot of information, but through experimentation and enough practice, writing a program like this will become easy for you.

One thing to notice, our `System.out.println("Text");` line ends with a semicolon `;`. All statements in Java end with a semicolon, including variable assignments, calling functions, etc. Over time, you will learn which lines require semicolons and which don't, just note that they are required. 
# If Statements

At this point, we know how to make a very linear program that executes certain statements. However, to add actual logic into our program, we can start with something known as **if statements**.

If statements allow us to change how our program executes depending on a certain condition. **If** certain conditions are true, we can choose to run some block of code. Otherwise, that block of code will not be run. For instance, the following are examples of if statements:

```java
Scanner scanner = new Scanner(System.in);

int number = scanner.nextInt();
if(number == 4) {
    System.out.println("The number is 4");
}

if(number != 4) {
    System.out.println("The number is not 4");
}

if(number > 4){
    System.out.println("The number is greater than 4");
}

if(number < 4){
    System.out.println("The number is less than 4");
}

if(number >= 4){
    System.out.println("The number is greater than or equal to 4");
}

if(number <= 4){
    System.out.println("The number is less than or equal to 4");
}
```

As you can see, there are various operators that are used with if statements. These are called relational operators, and they are described above. Note that to check for equality, we use two equal signs: ‘==’. This is important, as using just a single one will not work.

Note that these relational operators are not exclusive to if statements. We can also use them to create boolean variables. For instance, take the following example:

```java
int number = 4;
boolean isFour = number == 4;
boolean greaterThanFour= number > 4;
```

## Booleans With If Statements

Many times, we will also use boolean (true/false) variables with if statements. One way of doing this is the following:

```java
boolean test = true;

if(test == true) {
    // Do something cool
}
if(test == false) {
    // Do something different
}
```

However, programmers have developed a shortcut. Instead, you can just do `if(boolVar)` or `if(!boolVar)`, which correspond to the above respectively.

```java
boolean test = true;

if(test) {
    // Do something cool
}
if(!test) {
    // Do something different
}
```

In programming, `!` is an inverting symbol. It turns `true` into `false` and `false` into `true`.

```java
boolean test = true;
boolean antiTest = !test;

System.out.println(test); // prints "true"
System.out.println(antiTest); // prints "false"
```

## Comparing Strings

When comparing strings, there is a slight difference. Sometimes, ‘==’ does not work with strings, so instead we must always use something different. To compare a String variable to another String, we must use ‘.equals()’.

```java
String testString = "This is a test";

if(testString == "This is a test") { // Bad
    System.out.println("This will not work 100% of the time");
}
if(testString.equals("This is a test")) { // Good
    System.out.println("This will work 100% of the time");
}
```

To check if `String`s are not equal, we must use the `!` operator.

```java
String testString = "This is a test";

if(!testString.equals("This is a test")) {
    System.out.println("The strings do not match");
}
```

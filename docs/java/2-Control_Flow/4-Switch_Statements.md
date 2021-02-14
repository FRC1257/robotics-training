# Switch Statements

Sometimes, we have a long chain of `if` and `else if` statements that check what value a variable currently has and executes something differently depending on what it is.

```java
String dayOfTheWeek = "Thursday";

if(dayOfTheWeek.equals("Sunday")) {
    System.out.println("1st Day of the Week");
} else if(dayOfTheWeek.equals("Monday")) {
    System.out.println("2nd Day of the Week");
} else if(dayOfTheWeek.equals("Tuesday")) {
    System.out.println("3rd Day of the Week");
} else if(dayOfTheWeek.equals("Wednesday")) {
    System.out.println("4th Day of the Week");
} else if(dayOfTheWeek.equals("Thursday")) {
    System.out.println("5th Day of the Week");
} else if(dayOfTheWeek.equals("Friday")) {
    System.out.println("6th Day of the Week");
} else if(dayOfTheWeek.equals("Saturday")) {
    System.out.println("7th Day of the Week");
}
```

We can actually condense into something called a **`switch`** statement. It takes in a single variable, and does various different actions depending on different values of that variable. It does this by having the programmer define various possible values for that variable, and then defining what should be done in those cases. For instance, take the example below.

```java
String dayOfTheWeek = "Monday";

switch(dayOfTheWeek) {
    case "Sunday":
        System.out.println("1st Day of the Week");
        break;
    case "Monday":
        System.out.println("2nd Day of the Week");
        break;
    case "Tuesday":
        System.out.println("3rd Day of the Week");
        break;
    case "Wednesday":
        System.out.println("4th Day of the Week");
        break;
    case "Thursday":
        System.out.println("5th Day of the Week");
        break;
    case "Friday":
        System.out.println("6th Day of the Week");
        break;
    case "Saturday":
        System.out.println("7th Day of the Week");
        break;
    default:
        System.out.println("Error, unknown day of the week");
        break;
}
```

Let's break this down:

* We first use `switch()` to define which variable we want to check.
* For each value we want to check against, we put `case VALUE:`
  * After this colon, we put the code we want to execute if the variable matches that VALUE. Note that this is not contained within brackets.
* We terminate the case we are currently on by putting the line `break;`.
  * This ends the case and allows us to move on. Do not forget to put the `break;` statement. Doing so will break your switch statement and cause unexpected results.
* After all of our cases, we have `default:` at the end.
  * The code in this case executes in case the value of the variable does not match one of the cases. Most of the time, this code shouldn’t be run, since you should account for all cases.

Switch statements are a lot to digest, especially compared to `if`, `else`, and `else if` statements. You can always use `if`/`else if` statements instead of `switch` statements, but sometimes, `switch` statements look nicer. We occasionally use `switch` statements in robot code, so it’s important to know how to read them.

# Else Statements

When doing `if` statements, we frequently want to do something if a condition is true, and something else if the condition is not true. For instance, we want to check if a number is even, and if it is, we want to print that. Otherwise, we want to print that the number is odd. To do this, we can use something called **`else`** statements.

```java
int number = 5;

if(number % 2 == 0) { // Number is even
    System.out.println("The number " + number + " is even!");
} else { // The number is not even, so it must be odd
    System.out.println("The number " + number + " is odd!");
}
```

To extend on this topic, we can introduce something known as **`else if`** statements. Using these, we can check if a condition is true. If it is, we execute a statement. If it isn’t, we can check it against a different condition and do something if that is true. If it isn’t, we can check yet another statement.

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

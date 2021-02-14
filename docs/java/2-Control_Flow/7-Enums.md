# Enums

Up until now, all of the variable types that we have used so far have been built into Java. For instance, we have used `int`, which can take on any value between -2147483647 and 2147483647.

However, what if we want to create our own variable types? For instance, let's say we wanted to make a variable type to represent the current day of the week. The datatype could take on any of 7 values: Sunday, Monday, Tuesday, Wednesday, Thursday, or Saturday.

To do this in code, we can use an **`enum`**. We first define the datatype in the area above `main()`

```java
public class Main {
    enum Day {
        SUNDAY,
        MONDAY,
        TUESDAY,
        WEDNESDAY,
        THURSDAY,
        FRIDAY,
        SATURDAY;
    }

    public static void main(String[] args) {
        Day today = Day.SUNDAY;
        Day tomorrow = Day.MONDAY;

        System.out.println(today.name()); // Prints SUNDAY
    }
}
```

At first, we have to define the `enum` and what values it can be. Then, we can use it just like a normal variable. In order to actually give the variable a value, we can use something like `Day.SUNDAY` or `Day.THURSDAY`.

In order to print out the value of that variable, we can use `today.name()` to access a `String` version of the enum.

We generally use `enum`s for representing variable types that should be restricted to a very select set of values. For instance, there are only 7 days of the week, so we can create an `enum` that contain all of these possible values.

## Switch Statements

We can combine enums with `switch` statements. Consider the below example:

```java
public class Main {
    enum Day {
        SUNDAY,
        MONDAY,
        TUESDAY,
        WEDNESDAY,
        THURSDAY,
        FRIDAY,
        SATURDAY;
    }

    public static void main(String[] args) {
        Day today = Day.SUNDAY;

        switch(today) {
            case SUNDAY:
                System.out.println("domingo");
                break;
            case MONDAY:
                System.out.println("lunes");
                break;
            case TUESDAY:
                System.out.println("martes");
                break;
            case WEDNESDAY:
                System.out.println("miercoles");
                break;
            case THURSDAY:
                System.out.println("jueves");
                break;
            case FRIDAY:
                System.out.println("viernes");
                break;
            case SATURDAY:
                System.out.println("sabado");
                break;
        }
    }
}
```

Since `enum`s have a certain amount of values it can be, we can easily use a `switch` statement with cases for each of those values. One particularly nice thing about `switch` statements and `enum` is that when we put the value after `case`, we don't have to put `Day.SUNDAY`. Instead, we can just put `SUNDAY`, which helps make our code more concise.

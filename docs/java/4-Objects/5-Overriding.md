# Overriding

When we use inheritance in Java, we inherit exact versions of features from the parent class. For instance, in our previous example, `Firefighter` inherited the exact same code from `Person` for the `greet()` function. However, we can use **overriding** to actually change the behavior we inherit. Let's take a look at the code from the previous page about inheritance:

```java
public class Person {

    private String name;
    private int age;
    private String job;

    public Person(String name, int age, String job) {
        this.name = name;
        this.age = age;
        this.job = job;
    }
  
    public void greet() {
        System.out.println(name + " says hi! They are " + age + " years old and are a " + job + ".");
    }
  
    public void greet(Person person) {
        System.out.println(name + " says hi to " + person.getName());
    }
  
    public String getName() {
        return this.name;
    }
  
    // other getters and setters
}
```

```java
public class Firefighter extends Person {

    private int numberOfHousesSaved;
  
    public Firefighter(String name, int age) {
        super(name, age, "firefighter");
        this.numberOfHousesSaved = 0;
    }
  
    public void fightFire(Person person) {
        this.numberOfHousesSaved++;
        System.out.println(getName() + " saved " + person.getName() + "'s house from burning");
    }
  
    public int getNumberOfHousesSaved() {
        return this.numberOfHousesSaved;
    }
}
```

```java
public static void main(String[] args) {
    Person person1 = new Person("Bob", 32, "farmer");
    Firefighter person2 = new Firefighter("Bill", 42);

    person1.greet();

    person2.greet();
    person2.greet(person1);
    person2.fightFire(person2);
}
```

Whenever we call `greet()` on our `Firefighter`, it runs the exact same code as in `Person`, but let's say that we want to add onto this by also having the `Firefighter` say how many houses they have saved. To do so, we can use **overriding**.

To override a function inherited from a parent class, we have to take the original function declaration with its return type and arguments:
`public void greet()`

Then, we copy this directly into `Firefighter`:

```java
public class Firefighter extends Person {

    private int numberOfHousesSaved;
  
    public Firefighter(String name, int age) {
        super(name, age, "firefighter");
        this.numberOfHousesSaved = 0;
    }
  
    public void fightFire(Person person) {
        this.numberOfHousesSaved++;
        System.out.println(getName() + " saved " + person.getName() + "'s house from burning");
    }

    // NEW CODE

    public void greet() {

    }

    // END OF NEW CODE
  
    public int getNumberOfHousesSaved() {
        return this.numberOfHousesSaved;
    }
}
```

Now that we have done this, we can put any code we want inside of `greet()` and it will run instead of the original `greet()` function inside of its parent.

```java
public void greet() {
    System.out.println("They have saved " + numberOfHousesSaved + " houses.");
}
```

## Calling Parent Class' Original Function

However, if you try and run this, you will notice that the original `greet()` function inside of `Person` is not run and instead we only have the new code being run. However, sometimes we want to run the parent's version as well. To do this, we can use `super.greet()` to call the parent class' version.

```java
public void greet(Person person) {
    super.greet(person);
    System.out.println("They have saved " + numberOfHousesSaved + " houses.");
}
```

Now, if we run the `greet()` function on the `Firefighter`, then we will see that alongside running the original `greet()` function, it runs our extra code.

## @Override

Whenever we want to override a function, the formatting is very similar to creating a function inside of our class. However, let's say that we want to override a function, but we misspell it or put the wrong arguments.

```java
public void greets(Person person) { // we put "greets" here instead of "greet"
    System.out.println("They have saved " + numberOfHousesSaved + " houses.");
}
```

In this case, we won't override anything and actually just create a brand new function. This can lead to a lot of bugs. However, there is a way to prevent these bugs. By putting `@Override` the line right before we create our function, we tell Java that the next function should override something. If it doesn't due to incorrect arguments or misspellings, then Java should throw an error and tell us that there is an issue.

```java
@Override
public void greets(Person person) { // we put "greets" here instead of "greet"
    System.out.println("They have saved " + numberOfHousesSaved + " houses.");
}
```

Now, when we run the above, then Java will prevent our program from running since `greets(Person person)` does not override anything.


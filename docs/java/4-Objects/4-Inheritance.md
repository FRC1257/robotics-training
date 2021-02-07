# Inheritance

**Inheritance** is a feature in Java that allows children classes to “inherit” features from parent classes. These children will have all of the features from their parents and can have their own unique features. As an example to demonstrate this, let's say that we have a class called `Person` as follows:

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

We have this `Person` class to represent a person, but what if we wanted to make a class to represent a specific type of `Person` such as a `Firefighter`. We could make a `Firefighter` class as follows:

```java
public class Firefighter {

    private String name;
    private int age;
    private String job;

    private int numberOfHousesSaved;

    public Person(String name, int age) {
        this.name = name;
        this.age = age;
        this.job = "Firefighter";
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

    public void fightFire(Person person) {
        this.numberOfHousesSaved++;
        System.out.println(getName() + " saved " + person.getName() + "'s house from burning");
    }
  
    public int getNumberOfHousesSaved() {
        return this.numberOfHousesSaved;
    }
}
```

Note that the `Firefighter` class shares a lot in common with the `Person` class. After all, a `Firefighter` is a type of `Person` and anything a `Person` has, a `Firefighter` will have too. Whenever we have this type of relationship where one class **is** a type of another object, we can use **inheritance** to have `Firefighter` inherit all of the features from `Parent`. To demonstrate how this works, we're going to rebuild the `Firefighter` class from the beginning, but this time utilizing inheritance.

## Creating Firefighter.java

To make `Firefighter` inherit features from `Person`, we have to use the `extends` keyword:

```java
public class Firefighter extends Person {

}
```

Once we do this, all of the features from `Person` are now stored inherited and also present in `Firefighter`. Let's make our constructor for the `Firefighter` class.

```java
public class Firefighter extends Person {
  
    public Firefighter(String name, int age) {
        super(name, age, "firefighter");
    }
}
```

Here we defined a constructor for our `Firefighter` class that takes in the `name` and `age` of the firefighter. Next, we use `super()` which is used to call the constructor of our parent class. Whenever we make a child class, we **must** call a constructor of the parent class. Here, we pass in the arguments from this constructor into the parent constructor as well as "firefighter" as the job.

Once we satisfy this constructor constraint, we can actually use our `Firefighter` class, and it will have all of the features from our `Person` class.

```java
public static void main(String[] args) {
    Firefighter bob = new Firefighter("Bob", 42);
    bob.greet(); // will print "Bob says hi! They are 42 years old and are a firefighter."
}
```

However, the main power of child classes comes when we can not only inherit functionality, but also add on extra functionality. For instance, let's add a few functions that are specific to `Firefighter`.

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

Now, we can use a lot of our `Firefighter` specific features along with our other `Person` features.

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

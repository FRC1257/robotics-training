# Polymorphism

**`Polymorphism`** is a key concept in programming that is not very frequently used in robot programming, but can be extremely helpful for learning about how WPILib is structured.

Polymorphism refers to the ability for objects to be represented by their parent classes. The best way to see this topic is through an example.

Say we have the following classes that we've used in the past:

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
    
    @Override
    public void greet(Person person) {
        super.greet(person);
        System.out.println("They have saved " + numberOfHousesSaved + " houses.");
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
}
```

Here, note that our `greet()` function accepts a variable of type `Person`. However, `Firefighter` is a child class of `Person`. As a result of polymorphism, we can actually pass `Firefighter` into the `greet()` function.

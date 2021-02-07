# Abstract Classes

> [!NOTE]
> This section will be rewritten in the future to match the rest of the tutorials

We've seen now how we can use `polymorphism`. Note that in the previous example, we never created a `Person` object. We made the variables of type `Person`, but we never actually created a direct `Person` object using `new Person()`. Instead, we always used `new Doctor()` or `new Librarian()`. In a world with only doctors and librarians, we would never want to create just people. We would want to force the programmer to only create Doctors and Librarians, since any person would have to be one of those two roles.

Another example of this would be if you were making a videogame. Perhaps you have the parent class of `Enemy`, and multiple different types of enemies, like `Moblin`, `Peahat`, `Armos`, or `Octorok`. We would never want to create just a bland `Enemy` object, we would always want to give it a specific type, like `Moblin` or `Armos`. The `Enemy` class just exists to serve as a structure in our program to organize our enemies. Therefore, we want to make it so that we can never declare `Enemy` objects, since they are an **`abstract`** concept.

Going back to the example of `Person`, we can make the `Person` class **`abstract`**.

```java
public abstract class Person
{
    String m_name;
    int m_age;

    Person(String name, int age)
    {
        m_name = name;
        m_age = age;
    }

    void walk()
    {
        System.out.println("Person " + name + " is walking.");
    }
}
```

```java
public static void main(String[] args)
{
    // This no longer works
    Person person = new Person("Peter", 214124);


    // This still works
    Person[] people = new Person[3];
    people[0] = new Librarian("Bob", 23, "Aa");
    people[1] = new Librarian("Beth", 21, "Bb");
    people[2] = new Doctor("Jay", 34, "Astronomy");

    for(int i = 0; i < people.length; i++)
    {
        people[i].walk();
        printPerson(people[i]);
    }
    /*
    Output:
    Librarian Bob is walking.
    Bob 23
    Librarian Beth is walking.
    Beth 21
    Dr. Jay is walking.
    Jay 34
    */
}
```

## Abstract Methods

The thing that you will see in robot programming the most is probably `abstract methods`. Abstract methods are methods that are defined in `abstract classes` without a body (without any code inside of it), and thus forces all children class to implement that method.

```java
public abstract class Person
{
    String m_name;
    int m_age;

    Person(String name, int age)
    {
        m_name = name;
        m_age = age;
    }

    abstract void walk();
}
```

Once we have made a method abstract, we can no longer have a body, so we had to remove the `System.out.println();` we originally had. Now, in all of our other classes, `Doctor` and `Librarian`, we are now forced to define the `walk()` method. Otherwise, the program will not run, since there is no definition of the `walk()` method found anywhere else;

```java
public class Doctor extends Person
{
    String m_field;

    Doctor(String name, int age, String field)
    {
        super(name, age);
        m_field = field;
    }

    @Override // We MUST define this
    void walk()
    {
        System.out.println("Dr. " + name + " is walking.");
    }
}
```

```java
public class Librarian extends Person
{
    String m_libraryName;

    Librarian(String name, int age, String libraryName)
    {
        super(name, age);
        m_libraryName = libraryName;
    }

    @Override // We MUST define this
    void walk()
    {
        System.out.println("Librarian " + name + " is walking.");
    }
}
```

## Usefulness

Why is this important? Well, a lot of classes in WPILib utilize abstract classes. This is so that they can guarantee that you will implement key functions like getting sensor info or updating the robot. For instance, when we make a sensor, we are forced to add in methods for how to read the sensor and how to adjust it. As a result, we must know at least how to recognize these abstract methods and implement them when necessary.

There are, of course, very good explanations for why WPILib and many libraries utilize this structure. To see some of these, I've left a few excerpts below:

*Abstract classes let you define some behaviors; they force your subclasses to provide others. For example, if you have an application framework, an abstract class may provide default services such as event and message handling. Those services allow your application to plug in to your application framework. However, there is some application-specific functionality that only your application can perform. Such functionality might include startup and shutdown tasks, which are often application-dependent.* 

*So instead of trying to define that behavior itself, the abstract base class can declare abstract shutdown and startup methods. The base class knows that it needs those methods, but an abstract class lets your class admit that it doesn't know how to perform those actions; it only knows that it must initiate the actions. When it is time to start up, the abstract class can call the startup method. When the base class calls this method, Java calls the method defined by the child class.* -
[Java World](https://www.javaworld.com/article/2077421/learn-java/abstract-classes-vs-interfaces.html)

[What is the Purpose of an Abstract Class in Java?](https://www.quora.com/What-is-the-purpose-of-Abstract-Class-in-Java)

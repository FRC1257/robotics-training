# Overriding

Before, we introduced `inheritance` with the following examples:

```java
public class Person
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
public class Doctor extends Person
{
    String m_field;

    Doctor(String name, int age, String field)
    {
        super(name, age);
        m_field = field;
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
}
```

```java
public static void main(String[] args)
{
    Doctor doctor = new Doctor("Mike", 31, "Computer Science");
    doctor.walk();
}
```

When we run `doctor.walk()`, it outputs "Person Mike is walking". However, since this is a doctor, we might want to change it to "Dr. Mike is walking", but only for doctors. Let's see how we would've done this without using `inheritance`.

```java
public class Doctor
{
    String m_name;
    int m_age;
    String m_field;

    Doctor(String name, int age, String field)
    {
        m_name = name;
        m_age = age;
        m_field = field;
    }

    void walk()
    {
        System.out.println("Dr. " + name + " is walking.");
    }
}
```

We would've just replaced the `walk()` method implementation with the word "Dr." instead of "Person". In this case, we went back to the code that was originally a part of `Person`, and changed it to what we needed it to be specifically for `Doctor`s. With `inheritance`, we can do the same thing to rewrite, or `**override**` some of the inherited functions. The way we do this in Java is by actually rewriting the function in our child class.

```java
public class Doctor extends Person
{
    String m_field;

    Doctor(String name, int age, String field)
    {
        super(name, age);
        m_field = field;
    }

    void walk()
    {
        System.out.println("Dr. " + name + " is walking.");
    }
}
```

This will `override` the original parent functionality of the `walk()` function with the `Doctor` walk function. Note that you have to spell the name the exact same and with the same arguments. Otherwise, you will be simply creating a new function and not actually doing overriding anything. To check to make sure the rewritten function is actually working, we can put `@Override` above the rewritten function. This will make it so that if you misspelled the function and it is not actually `overriding` anything, the program will throw an error and tell you.

```java
public class Doctor extends Person
{
    String m_field;

    Doctor(String name, int age, String field)
    {
        super(name, age);
        m_field = field;
    }

    @Override // This would throw an error
    void wall()
    {
        System.out.println("Dr. " + name + " is walking.");
    }
}
```

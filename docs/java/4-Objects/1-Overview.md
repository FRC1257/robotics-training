# Objects Overview

## Real Life Objects

Think about all of the things in the world. For instance, take a chair. What can we say about a chair? What makes a chair a chair? We may say that all chairs can be sat on and stand by themselves. Additionally, we may say that all chairs have a certain number of legs, a material that they are made from, or its country of origin. As we can see, objects in our real world have actions associated with them and properties.

Let's take another example, a person. Each person can do multiple actions, such as talk, eat, sleep, or drink. Additionally, they have properties like their name, age, or their birthday.

Clearly, we can represent a lot of objects in our world with actions that they can perform and their properties.

## Programming Objects

This type of thinking can be expanded to programming. For instance, a `String` is an object. It has properties, such as its contents and its length. Additionally, Strings have actions, such as combining text, getting substrings, or finding characters.

All of the datatypes that we create will be objects. Using this, we can represent a lot of different types of things with objects in programming.

## Custom Datatypes

The whole point of this discussion about objects is to get you started making your own datatypes. For instance, right now, we currently use datatypes for variables like `int`, `double`, and `String`. These can do a lot of things, but what if we want to be able to represent something like a chair? We want to be able to perform certain actions with that datatype and store some variables. While we could do this by storing each property of the chair separately, this is very messy and not very expandable:

```java
String chair1Country = "USA";
int chair1NumLegs = 4;
String chair1Material = "Wood";

public static void chair1Sit() {
    System.out.println("Sitting in the " + chair1Material + " chair from " + chair1Country + " with " + chair1NumLegs + " legs.");
}

String chair2Country = "China";
int chair2NumLegs = 3;
String chair2Material = "Metal";

public static void chair2Sit() {
    System.out.println("Sitting in the " + chair2Material + " chair from " + chair2Country + " with " + chair2NumLegs + " legs.");
}
```

As a result, we may want to create our own datatype called `Chair`, and then be able to really easily set these properties and sit in it. We will look at how to do this next time, when we discuss progrmaming syntax of objects.

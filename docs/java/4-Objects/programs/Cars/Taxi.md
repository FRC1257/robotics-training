```java
public class Taxi extends Car {
    
    public int passengers;

    public Taxi(int passengers) {
        super("Taxi Company", "Taxi v2", 0, 10); // call the constructor in Car

        this.passengers = passengers;
    }

    @Override
    public void printInfo() {
        System.out.println("Taxi for " + passengers + " at " + maxSpeed + 
            " for " + miles + ".");
    }
}
```
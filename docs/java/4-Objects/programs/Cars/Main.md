```java
public class Main {
    
    public static void main(String[] args) {
        Car car = new Car("Honda", "Accord", 16, 12);
        car.printInfo();
        car.addMiles(12);
        car.printInfo();

        Taxi taxi = new Taxi(2);
        taxi.printInfo();
        taxi.addMiles(1000);
        taxi.printInfo();
    }
}
```
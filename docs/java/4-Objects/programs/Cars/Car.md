```java
public class Car {
    
    public String manufacturer;
    public String model;
    public int miles;
    public double maxSpeed;

    public Car(String manufacturer, String model, int miles, double maxSpeed) {
        this.manufacturer = manufacturer;
        this.model = model;
        this.miles = miles;
        this.maxSpeed = maxSpeed;
    }

    public void addMiles(int additionalMiles) {
        this.miles += additionalMiles;
    }

    public void printInfo() {
        System.out.println(manufacturer + " " + model + " driven for " + 
            miles + " with a max speed of " + maxSpeed + ".");
    }
}
```
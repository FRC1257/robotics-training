```java
import java.util.Scanner;

public class EvenOdd {
    
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.print("Type in an Integer: ");
        int number = scanner.nextInt();
        
        if(number % 2 == 0) {
            System.out.println("The number " + number + " is even.");
        }
        else if(number % 2 == 1) {
            System.out.println("The number " + number + " is odd.");
        }

        scanner.close();
    }
}
```
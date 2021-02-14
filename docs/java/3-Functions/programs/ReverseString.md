```java
import java.util.Scanner;

public class ReverseString {
    
	public static void main(String[] args) {
        System.out.println("Hello!");
        System.out.println(reverse("Hello"));

        System.out.println("Enter your name!");

        Scanner scanner = new Scanner(System.in);
        String name = scanner.next();

        System.out.println("This is your name: " + name);
        System.out.println("This is your name reversed: " + reverse(name));

        System.out.println("Bye!");
        System.out.println(reverse("Bye"));

        scanner.close();
    }
    
    public static String reverse(String input) {
        String output = "";

        // Loop through String backwards and add to output
        for(int i = input.length() - 1; i >= 0; i--) {
            output += input.charAt(i); // .charAt(index) returns the ith 0-indexed character of the string
        }

        return output;
    }
}
```
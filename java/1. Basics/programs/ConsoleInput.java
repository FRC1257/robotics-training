import java.util.Scanner;

public class ConsoleInput
{
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.print("Type in an Integer: ");
        int testInt = scanner.nextInt();
        System.out.println("Here is your integer multiplied by 2: " + (testInt * 2));

        scanner.nextLine();

        System.out.print("Type a String: ");
        String testString = scanner.next();
        System.out.println("Here is your string twice: " + testString + testString);

        scanner.close();
    }
}
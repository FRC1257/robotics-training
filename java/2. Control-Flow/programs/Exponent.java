import java.util.Scanner;

public class Exponent {
    
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        System.out.println("Enter the exponent base: ");
        int base = scanner.nextInt();

        System.out.println("Enter the exponent: ");
        int exponent = scanner.nextInt();

        long result = 1; // We use a long here because with exponents, the result can get very large
        for(int i = 0; i < exponent; i++) {
            result *= base;
        }

        System.out.println("The result is: " + result);

        scanner.close();
    }
}
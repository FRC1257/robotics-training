import java.util.Scanner;

public class UserArray {
	public static void main(String[] args) {
        System.out.println("Enter the number of elements: ");

        Scanner scanner = new Scanner(System.in);
        int numElements = scanner.nextInt();

        int[] array = new int[numElements];

        System.out.println("Enter your " + numElements + " elements");
        for(int i = 0; i < numElements; i++) {
            int element = scanner.nextInt();
            array[i] = element;
        }

        System.out.println("Here are your elements: ");
        for(int i = 0; i < numElements; i++) {
            System.out.println(i + ": " + array[i]);
        }
	}
}
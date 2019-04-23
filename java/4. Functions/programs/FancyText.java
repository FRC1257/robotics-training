import java.util.Scanner;

public class FancyText {
    
	public static void main(String[] args) {
        printFancy("Enter your text!");

        Scanner scanner = new Scanner(System.in);
        String input = scanner.next();

        printFancy(input);

        scanner.close();
    }
    
    public static void printFancy(String text) {
        String dash = "";
        // Create a String of '-' the length of the text
        for(int i = 0; i < text.length(); i++) {
            dash += "-";
        }

        System.out.println("|" + dash + "|");
        System.out.println("|" + text + "|");
        System.out.println("|" + dash + "|");
    }
}
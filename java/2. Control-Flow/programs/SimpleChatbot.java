import java.util.Scanner;

public class SimpleChatbot {
    
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        
        System.out.println("Hi! What's your name?");
        String name = scanner.next();

        System.out.println("Hi " + name + "!");
        System.out.println("What grade are you in? (Please enter a number from 9-12)");
        int grade = scanner.nextInt();

        switch(grade) {
            case 9:
                System.out.println("You must be a freshman! Welcome to UCVTS!");
            break;

            case 10:
                System.out.println("You must be a sophomore! Welcome back to UCVTS!");
            break;

            case 11:
                System.out.println("You must be a junior! Welcome back to UCVTS!");
            break;
            
            case 12:
                System.out.println("You must be a senior! Welcome back to UCVTS!");
            break;

            default:
                System.out.println("I'm sorry, I didn't recognize that grade.");
            break;
        }

        System.out.println("How was your day? Good, fine, or bad?");
        // We use toLowerCase() to remove capitlization from the string. Then, we can recognize good, Good, GOOD, etc. as the same thing
        String response = scanner.next().toLowerCase();
        if(response.equals("good")) {
            System.out.println("Great! I hope you continue having a good day!");
        }
        else if(response.equals("fine")) {
            System.out.println("That's good! I hope your day stays fine!");
        }
        else if(response.equals("bad")) {
            System.out.println("Oh no! Why's your day bad?");
            String badResponse = scanner.next();
            System.out.println("That sucks, I hope your day gets better!");
        }

        scanner.close();
    }
}
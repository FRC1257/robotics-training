```java
import java.util.Scanner;

class Formulas{
    
    public static double squareArea(double length1, double length2)
    {
        double answer = length1 * length2;
        return answer;
    }

    public static double circleArea(double radius)
    {
        double answer = radius * radius * 3.14;
        return answer;
    }

    public static double triangleArea(double length1, double length2)
    {
        double answer = length1 * length2 * 0.5;
        return answer;
    }
    
    public static void main(String[] args) 
    {
        Scanner scanner = new Scanner(System.in);
        boolean again = true;
        while(again)
        {
            System.out.println("Type in the formula that you want that you want the calculator to use");
            System.out.println("Type in 'squareArea','circleArea' or 'triangleArea'");

            String choiceFormula = scanner.next();

            switch(choiceFormula)
            {
                case "squareArea":
                {
                    System.out.println("Enter the length of the two sides");
                    double sidesLength1 = scanner.nextDouble();
                    double sidesLength2 = scanner.nextDouble();
                    System.out.println("The area of the square is " +squareArea(sidesLength1,sidesLength2)); 
                    break;
                }
                case "circleArea":
                {
                    System.out.println("Enter the length of the radius");
                    double radius = scanner.nextDouble();
                    System.out.println("The area of the circle is " +circleArea(radius));  
                    break;      
                }
                case "triangleArea":
                {
                    System.out.println("Enter the length of the base and the length of the height");
                    double baseLength = scanner.nextDouble();
                    double heightLength = scanner.nextDouble();

                    System.out.println("The area of the triangle is " +triangleArea(heightLength,baseLength));   
                    break;     
                }
                default:
                {
                    System.out.println("You didn't type in one of the options");
                    break;
                }
            }
            System.out.println("Do you want to run this code again? Type 'yes' or 'no'");
            String choose = scanner.next();
            if(choose.equals("yes"))
            {
                continue;
            }
            else
            {
                System.out.println("Ok the code is terminated");
                break;
            }
        }
        scanner.close();
    }
}
```
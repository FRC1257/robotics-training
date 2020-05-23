```java
public class PrintArray {
    
	public static void main(String[] args) {
        int[] array = new int[] {1, 2, 3, 41, 23, 1, 283};

        printArray(array);
        System.out.println("Sum: " + arraySum(array));
    }
    
    public static void printArray(int[] array) {
        for(int i = 0; i < array.length; i++) {
            System.out.print(array[i] + " ");
        }
        System.out.println();
    }

    public static int arraySum(int[] array) {
        int sum = 0;
        for(int i = 0; i < array.length; i++) {
            sum += array[i];
        }

        return sum;
    }
}
```
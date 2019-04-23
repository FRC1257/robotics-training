public class ReverseArray {
    
	public static void main(String[] args) {
        int[] array = new int[] {1, 2, 3, 4};

        for(int i = array.length - 1; i >= 0; i--) {
            System.out.println(i + ": " + array[i]);
        }
	}
}
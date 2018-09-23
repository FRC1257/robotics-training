public class Variables {
    public static void main(String[] args) {
        boolean testBoolean = false;
        System.out.println("This is a boolean: " + testBoolean);

        char testChar = 'a';
        System.out.println("This is a char: " + testChar);
                
        byte testByte = 38;
        System.out.println("This is a byte: " + testByte);
                
        short testShort = 31838;
        System.out.println("This is a short: " + testShort);
                
        int testInt = 4284298;
        System.out.println("This is a int: " + testInt);
                
        long testLong = 428981491238L;
        System.out.println("This is a long: " + testLong);

        float testFloat = 2.1313f;
        System.out.println("This is a float: " + testFloat);

        double testDouble = 4.13113131313;
        System.out.println("This is a double: " + testDouble);

        //DOES NOT WORK
        //int test = testInt + testDouble;

        //THIS WORKS
        int test = (int) (testInt + testDouble);
        System.out.println(test);
    }
}
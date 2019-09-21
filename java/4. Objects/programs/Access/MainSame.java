public class MainSame {
    
    public static void main(String[] args) {
        Other o = new Other();
        System.out.println(o.privateNumber); // This will not work, nothing outside of the class Other can access private
        System.out.println(o.defaultNumber); // This will work, since MainSame is in the same folder
        System.out.println(o.publicNumber); // This will work, since anything can access public

        o.privatePrint(); // This will not work, nothing outside of the class Other can access private
        o.defaultPrint(); // This will work, since MainSame is in the same folder
        o.publicPrint(); // This will work, since anything can access public
    }
}
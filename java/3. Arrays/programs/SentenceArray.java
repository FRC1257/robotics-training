public class SentenceArray {
    
	public static void main(String[] args) {
        String[] words = new String[] {"The", "quick", "brown", "fox", "jumps", "over", "the", "lazy", "dog"};

        String sentence = "";
        for(int i = 0; i < words.length; i++) {
            sentence += words[i] + " ";
        }
        System.out.println(sentence);
	}
}
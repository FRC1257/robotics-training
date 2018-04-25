#include <iostream>
using namespace std;

int main(){
    int randomNums[10] = {10, 6, 7, 3, 2, 8, 9, 1, 4, 5};
    int temp;
    bool swapped = false;
    
    for(int j = 0; j < 10; j++){
        cout << randomNums[j] << ", ";
    }
    cout << endl;
    
    do{
        swapped = false;
        for(int i = 0; i < 9; i++){
            if(randomNums[i] > randomNums[i + 1]){
                temp = randomNums[i];
                randomNums[i] = randomNums[i + 1];
                randomNums[i + 1] = temp;
                swapped = true;
                
                for(int j = 0; j < 10; j++){
                    cout << randomNums[j] << ", ";
                }
                cout << endl;
            }
        }
    }while(swapped == true);
    
    for(int j = 0; j < 10; j++){
        cout << randomNums[j] << ", ";
    }
    cout << endl;
    
    return 1;
}

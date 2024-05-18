
import axios from 'axios';
import ManyData from './interfaces/ManyData';






function processData(data: ManyData): void {
    // console.log(data);
    console.log(data);
    // data.articles.forEach(element => {
    //     console.log(element);
    // });
//        let itemCount:number = 0;
        
//        for(let article in data.articles){
      
//         console.log(article);
//          if(itemCount == 2){
//             break
//          }
//         ++itemCount;
        
//    }

   
}



export default async function downloadData() {
   

 
    let url: string = "https://api.pro.coinbase.com/products";


    
    let data:ManyData = (await axios.get(url)).data;

    
    processData(data);
}

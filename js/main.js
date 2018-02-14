function getdata(){
  var xhttp = new XMLHttpRequest();
  var url="http:/localhost:3000/db";

  xhttp.open("GET",url, true);
  xhttp.send();
	
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var myArr=JSON.parse(this.responseText);      //taking json data from url and parsing to myArr

      //showing data on index.html in table format
      var show=document.getElementById('msg1');
      show.innerHTML="<table width='500' border='1'><tr><th>Parameter</th><th>Source Document</th><th>Your Document</th></tr>"
      +"<tr><td><strong>File Name</strong></td><td>"+myArr.srcFile.name+"</td><td>"+myArr.tarFile.name+"</td></tr>"
      +"<tr><td><strong>Word Count</strong></td><td>"+myArr.srcFile.wordCount+"</td><td>"+myArr.tarFile.wordCount+"</td></tr>"
      +"<tr><td><strong>Noun Count</strong></td><td>"+myArr.srcFile.nounCount+"</td><td>"+myArr.tarFile.nounCount+"</td></tr>"
      +"<tr><td><strong>Verb Count</strong></td><td>"+myArr.srcFile.verbCount+"</td><td>"+myArr.tarFile.verbCount+"</td></tr>"
      +"<tr><td><strong>Adjective Count</strong></td><td>"+myArr.srcFile.adjCount+"</td><td>"+myArr.tarFile.adjCount+"</td></tr></table>"

      /*"<h2>Source Document </h2>"+"File name : "+"<b>"+myArr.srcFile.name+"</b>"+
      "</br>Word Count : "+"<b>"+myArr.srcFile.wordCount+"</b>"+"</br>Noun Count : "+"<b>"+
      myArr.srcFile.nounCount+"</b>"+"</br>Verb Count : "+"<b>"+myArr.srcFile.verbCount+"</b>"+"</br>Adjective Count : "+"<b>"+myArr.srcFile.adjCount+"</b>"+
      
      "<h2>Your Document </h2>"+"File name : "+"<b>"+myArr.tarFile.name+"</b>"+
      "</br>Word Count : "+"<b>"+myArr.tarFile.wordCount+"</b>"+"</br>Noun Count : "+"<b>"+
      myArr.tarFile.nounCount+"</b>"+"</br>Verb Count : "+"<b>"+myArr.tarFile.verbCount+"</b>"+"</br>Adjective Count : "+"<b>"+myArr.tarFile.adjCount*/

      +"</b>"+

      // Showing final result to index.html
      "<h3>Final Result </h3>"+"Status : "+"<b>"+myArr.result.status+"</b>"+
      "</br>Similarity from Source Document : "+"<b>"+myArr.result.similarity+"%"+"</b>"+"</br>Score (Out of 100) : "+"<b>"+
      myArr.result.score+"</b>"+"</br>Remarks : "+"<b>"+myArr.result.remarks+"</b>";
    }
  };
}
const fs = require('fs');
const natural = require('natural');
const path = require('path');
const textract = require('textract');
const stringSimilarity = require('string-similarity');
const WordPOS = require('wordpos'),
    wordpos = new WordPOS();
var tokenizer = new natural.WordTokenizer();

var srcText,tarText;
var status = 0;
var tokenText;

// getting address of both files
var src_address = 'res/source.docx';
var tar_address = 'res/target_1.docx';

//creating objects to show from json file
var srcFile = {
  name:"",
  wordCount: 0,
  nounCount: 0,
  verbCount: 0,
  adjCount: 0,
};

var tarFile = {
  name:"",
  wordCount: 0,
  nounCount: 0,
  verbCount: 0,
  adjCount: 0,
};

var result = {
  status: "",
  score: 0,
  similarity: 0,
  remarks: "",
};

var data={srcFile, tarFile, result};

//start function which handles all promises for reading a file
function start(){
  ReadPromise(src_address,"src").then((message) => {
    console.log(message);
    completed();
  })
  .catch((message) => {
    console.log(message);
  });

  ReadPromise(tar_address,"target").then((message) => {
    console.log(message);
    completed();
  })
  .catch((message) => {
    console.log(message);
  });
}

// completed function which tracks record that both file must be read
function completed() {
  status++;
  if(status === 2)
    finish();       // calls when both files successfully read
}

function ReadPromise(address, document) {
  var Count = 0;

  return new Promise(function(resolve,reject){
    textract.fromFileWithPath(address, {preserveLineBreaks:true},function( error, text ) {
      function check(){
        Count++;
        if(Count % 3 === 0)
          resolve("Reading file: "+fname);
      }

      var fname = path.basename(address);     //extracting file name
      if(document === "src")
        srcFile.name = fname;
      else if(document === "target")
        tarFile.name = fname;

      if(error) {
          reject("Document" +fname +"can not be evaluated.");
      } else{
      	tokenText = tokenizer.tokenize(text);          //file converted into array of words

        
        if(document === "src")
        {     
          // srcText is for use in string-similarity
        	srcText = text;
            srcFile.wordCount = tokenText.length;       // counting no of words in source file
            wordpos.getNouns(srcText,function(result){
            	//console.log("\nNouns used: "+result);
            	srcFile.nounCount = result.length;         // counting no of nouns in source file
            	check();
            });
            wordpos.getAdjectives(srcText, function(result){
            	srcFile.adjCount = result.length;          // counting no of Adjectives in source file
            	check();
            });
            wordpos.getVerbs(srcText, function(result){
            	srcFile.verbCount = result.length;         // counting no of verbs in source file
            	check();
            });
        }
        else if(document === "target")
        {
        	tarText = text;
            tarFile.wordCount = tokenText.length;       // counting no of words in target file
            wordpos.getNouns(tarText,function(result){  
            	tarFile.nounCount = result.length;         // counting no of nouns in target file
            	check();
            });
            wordpos.getAdjectives(tarText, function(result){
            	tarFile.adjCount = result.length;          // counting no of Adjectives in target file
            	check();
            });
            wordpos.getVerbs(tarText, function(result){
            	tarFile.verbCount = result.length;         // counting no of verbs in target file
            	check();
            });
        }
      }
        
    })
  })
}

var finish = function(){
	console.log(srcFile);
	console.log(tarFile);

	if(tarFile.wordCount>=srcFile.wordCount-1000 && tarFile.wordCount<=srcFile.wordCount+1000){    // Wordcount criteria

		result.status = "Document Accepted on Wordcount basis";
		var marks = 100;

    // reducing marks on the basis of difference from source file
		marks -= Math.abs((srcFile.nounCount/srcFile.wordCount)*500 - (tarFile.nounCount/tarFile.wordCount)*500);
		marks -= Math.abs((srcFile.adjCount/srcFile.wordCount)*500 - (tarFile.adjCount/tarFile.wordCount)*500);
		marks -= Math.abs((srcFile.verbCount/srcFile.wordCount)*500 - (tarFile.verbCount/tarFile.wordCount)*500);

		marks = Math.round(marks);        //Rounding off marks 

		var similarity = stringSimilarity.compareTwoStrings(srcText, tarText);   //calculating similarity between source and target files
		result.similarity = Math.round(similarity*100);     //rounding off similarity

		result.score = (marks+result.similarity)/2;
		
		if(result.score>=80)                  //remarks criteria
			result.remarks = "Good Document. Very well Written";
		else if(result.score>=60 && result.score<80)
			result.remarks = "Average Document. Need more improvement";
		else
			result.remarks = "Poor Document";

		console.log(result);

	}

	else{
		result.status = "Document Rejected on Wordcount basis";
		result.remarks = "Try to make your document under acceptable limits : [" +srcFile.wordCount-500 +"-" +srcFile.wordCount+500 +"]";
	}

  //stringify data object and put in json
	let json = JSON.stringify(data,null,2);
	fs.writeFile('output.json',json,'utf8',(err) => {     //writing json into a output.json file
	  if(err){
	    console.log("Error");
	    return;
	  }
	  console.log("Success!");
	})
}

start();
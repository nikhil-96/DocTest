const fs = require('fs');
const natural = require('natural');
const path = require('path');
const textract = require('textract');
const stringSimilarity = require('string-similarity');
const WordPOS = require('wordpos'),
    wordpos = new WordPOS();
var tokenizer = new natural.WordTokenizer();

var srcText,tarText;
var src_wordcount=0,tar_wordcount=0;
var src_noun=0,tar_noun=0;
var src_verb=0,tar_verb=0;
var src_adj=0,tar_adj=0;
var status = 0;
var tokenText;

var src_address = 'res/source.docx';
var tar_address = 'res/target.docx';

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

function start(){
  fileReadPromise(src_address,"src").then((message) => {
    console.log(message);
    completed();
  })
  .catch((message) => {
    console.log(message);
  });

  fileReadPromise(tar_address,"target").then((message) => {
    console.log(message);
    completed();
  })
  .catch((message) => {
    console.log(message);
  });
}

function completed() {
  status++;
  if(status === 2)
    finish();
}

function fileReadPromise(address, document) {
  var Count = 0;

  return new Promise(function(resolve,reject){
    textract.fromFileWithPath(address, {preserveLineBreaks:true},function( error, text ) {
      function check(){
        Count++;
        if(Count % 3 === 0)
          resolve("Reading file: "+fname);
      }

      var fname = path.basename(address);
      if(document === "src")
        srcFile.name = fname;
      else if(document == "target")
        tarFile.name = fname;

      if(error) {
          reject("Document" +fname +"can not be evaluated.");
      } else{
      	tokenText = tokenizer.tokenize(text);

        // save text for global function use
        if(document === "src")
        {
        	srcText = text;
            srcFile.wordCount = tokenText.length;
            wordpos.getNouns(srcText,function(result){
            	//console.log("\nNouns used: "+result);
            	srcFile.nounCount = result.length;
            	check();
            });
            wordpos.getAdjectives(srcText, function(result){
            	srcFile.adjCount = result.length;
            	check();
            });
            wordpos.getVerbs(srcText, function(result){
            	srcFile.verbCount = result.length;
            	check();
            });
        }
        else if(document === "target")
        {
        	tarText = text;
            tarFile.wordCount = tokenText.length;
            wordpos.getNouns(tarText,function(result){
            	tarFile.nounCount = result.length;
            	check();
            });
            wordpos.getAdjectives(tarText, function(result){
            	tarFile.adjCount = result.length;
            	check();
            });
            wordpos.getVerbs(tarText, function(result){
            	tarFile.verbCount = result.length;
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

	if(tarFile.wordCount>=srcFile.wordCount-500 && tarFile.wordCount<=srcFile.wordCount+500){

		result.status = "Document Accepted on Wordcount basis";
		var marks = 100;
		marks -= Math.abs((srcFile.nounCount/srcFile.wordCount)*500 - (tarFile.nounCount/tarFile.wordCount)*500);
		marks -= Math.abs((srcFile.adjCount/srcFile.wordCount)*500 - (tarFile.adjCount/tarFile.wordCount)*500);
		marks -= Math.abs((srcFile.verbCount/srcFile.wordCount)*500 - (tarFile.verbCount/tarFile.wordCount)*500);

		marks = Math.round(marks);

		var similarity = stringSimilarity.compareTwoStrings(srcText, tarText);
		result.similarity = Math.round(similarity*100);

		result.score = (marks+result.similarity)/2;
		
		if(result.score>=80)
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

	let json = JSON.stringify(data,null,2);
	fs.writeFile('output.json',json,'utf8',(err) => {
	  if(err){
	    console.log("Error");
	    return;
	  }
	  console.log("Success!");
	})
}

start();

/*
var temp = path.basename(tar_address);
var tarf_name = temp.split('.');
var tarf_ext = path.extname(tar_address);
console.log("Filename : "+tarf_name[0]);
console.log("FileExtension : "+tarf_ext);

var twoinone = function(file,key){
	return new Promise((resolve,reject)=>{
		//reading files
		textract.fromFileWithPath(src_address,{preserveLineBreaks:true}, function( error, text ) {
			if(error)
				console.log("Error Code : "+error);
			else{
				//console.log(text);
				srcFile = text;
				tokenText = tokenizer.tokenize(srcFile);
				src_wordcount = tokenText.length;
				console.log("Source file Wordcount : " +src_wordcount);
				wordpos.getNouns(srcFile, function(result){
					src_noun = (result.length/src_word) * 500;
					console.log(src_noun);
				});
				wordpos.getVerbs(srcFile, function(result){
		    		src_verb = (result.length/src_word) * 500;
		    		console.log(src_verb);
				});
				wordpos.getAdjectives(srcFile, function(result){
		    		src_adj = (result.length/src_word) * 500;
		    		console.log(src_adj);
				});
			}

		})
	});
};

let promises = [];
let f1 = twoinone()

textract.fromFileWithPath(tar_address,{preserveLineBreaks:true}, function( error, text ) {
	if(error)
		console.log("Error! The file " +tarf_name+tarf_ext +"can not be evaluated");
	else{
		//console.log(text);
		tarFile = text;
		tokenText = tokenizer.tokenize(tarFile);
		tar_wordcount = tokenText.length;
		console.log("Target file Wordcount : " +tar_wordcount);
		wordpos.getNouns(tarFile, function(result){
			tar_noun = (result.length/tar_word) * 500;
			console.log(tar_noun);
		});
		wordpos.getVerbs(tarFile, function(result){
    		tar_verb = (result.length/tar_word) * 500;
    		console.log(tar_verb);
		});
		wordpos.getAdjectives(tarFile, function(result){
    		tar_adj = (result.length/tar_word) * 500;
    		console.log(tar_adj);
		});
	}

})
*/

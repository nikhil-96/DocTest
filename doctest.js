const fs = require('fs');
const natural = require('natural');
const path = require('path');
const stringSimilarity = require('string-similarity');
var tokenizer = new natural.WordTokenizer();

var base_folder = path.join(path.dirname(require.resolve("natural")), "brill_pos_tagger");
var rulesFilename = base_folder + "/data/English/tr_from_posjs.txt";
var lexiconFilename = base_folder + "/data/English/lexicon_from_posjs.json";
var defaultCategory = 'N';

var lexicon = new natural.Lexicon(lexiconFilename, defaultCategory);
var rules = new natural.RuleSet(rulesFilename);
var tagger = new natural.BrillPOSTagger(lexicon, rules);

var srcText,tarText;
var status = 0;
var tokenText;

// getting address of both files
var src_address = 'res/source.txt';
var tar_address = 'res/target.txt';

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
    var text = fs.readFileSync(address,'utf8');
      function check(){
          resolve("Reading file: "+fname);
      }

      var fname = path.basename(address);     //extracting file name
      if(document === "src")
        srcFile.name = fname;
      else if(document === "target")
        tarFile.name = fname;

      if(text === null) {
          reject("Document" +fname +"can not be evaluated.");
      } else{
      	tokenText = tokenizer.tokenize(text);          //file converted into array of words

        var taggerJSON = tagger.tag(tokenText);

        if(document === "src")
        {     
          // srcText is for use in string-similarity
        	srcText = text;
            srcFile.wordCount = tokenText.length;       // counting no of words in source file
             for(var arr of taggerJSON){
                  if(arr[1] == "NN" || arr[1] == "NNP" || arr[1] == "NNPS")
                    srcFile.nounCount++;
                  else if(arr[1] == "VB" || arr[1] == "VBD" || arr[1] == "VBG" || arr[1] == "VBN" || arr[1] == "VBP" || arr[1] == "VBZ")
                    srcFile.verbCount++;
                  else if(arr[1] == "JJ" || arr[1] == "JJR" || arr[1] == "JJS")
                    srcFile.adjCount++;
                
                }
          check();
        }
        else if(document === "target")
        {
        	tarText = text;
            tarFile.wordCount = tokenText.length;       // counting no of words in target file
            for(var arr of taggerJSON){
                  if(arr[1] == "NN" || arr[1] == "NNP" || arr[1] == "NNPS")
                    tarFile.nounCount++;
                  else if(arr[1] == "VB" || arr[1] == "VBD" || arr[1] == "VBG" || arr[1] == "VBN" || arr[1] == "VBP" || arr[1] == "VBZ")
                    tarFile.verbCount++;
                  else if(arr[1] == "JJ" || arr[1] == "JJR" || arr[1] == "JJS")
                    tarFile.adjCount++;
                
                }
          check();
        }
      }
        
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

		var similarity = natural.JaroWinklerDistance(srcText,tarText);   //calculating similarity between source and target files
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

start();      // start evaluating the document
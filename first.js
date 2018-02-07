var fs = require('fs');
var natural = require('natural');
var path = require('path');
var textract = require('textract');
var stringSimilarity = require('string-similarity');
var WordPOS = require('wordpos'),
    wordpos = new WordPOS();
//var string;
//console.log(content);
var bestDoc;
var address = '/home/sapient/Desktop/HTML_Basics.doc';
var wordcount;
var abc = path.basename(address);
var fname = abc.split('.');
var fext = path.extname(address);
console.log("Filename : "+fname[0]);
console.log("FileExtension : "+fext);

textract.fromFileWithPath('/home/sapient/Desktop/source.doc',{preserveLineBreaks:true}, function( error, text ) {
	if(error)
		console.log(error);
	else{
		//console.log(text);
		bestDoc = text;
	}

})

textract.fromFileWithPath(address,{preserveLineBreaks:true}, function( error, text ) {
	if(error)
		console.log(error);
	else{
		//console.log(text);
		wordcount = text.match(/\w+/g).length;
		console.log("Wordcount : " +wordcount);
		if(wordcount>=1500 && wordcount<=4000){
		wordpos.getNouns(text, getNouns);
		wordpos.getVerbs(text, getVerbs);
		wordpos.getAdjectives(text, getAdjectives);
		var similarity = stringSimilarity.compareTwoStrings(bestDoc,text);
		console.log(similarity);
		}
		else{
			console.log("Document rejected as wordcount not under permissible limits.");
			console.log("Permissible limit : [1500-3000]");
		}
	}

})

function getNouns(result)
{
	var NounPerc = (result.length/wordcount) * 500;
	console.log("NounCount : "+NounPerc +"%");
}

function getVerbs(result)
{
	var VerbPerc = (result.length/wordcount) * 500;
	console.log("VerbCount : "+VerbPerc +"%");
}

function getAdjectives(result)
{
	var AdjectivePerc = (result.length/wordcount) * 500;
	console.log("AdjectiveCount : "+AdjectivePerc +"%");
}



// use this as a script in your Google Sheet document

// fill in your own Parse App Id and Rest API Key
var parseAppId = 'YOUR PARSE APP ID';
var parseRestAPIKey = 'YOUR PARSE REST API KEY';

// if reverseRows is true, the rows in the pattern array will be reversed
var reverseRows = true;

// if convertValues is true, the value in each cell will be replaced with its corresponding value in the valueMap
// if the sheet contains a value that isn't listed in the valueMap, it will be replaced with 'UNDEFINED'
var convertValues = true;
var valueMap = {
	// 0: "Floor",
	// 1: "Wall",
	// 2: "PlayerSpawn",
	// 3: "Enemy1",
	// 4: "Enemy2",
};

// if the pattern contains any of the keys in patternSuffixMap, it will be published to a Parse class that includes the corresponding suffix
var patternSuffixMap = {
	// 2: "_Start"
};

var patternSuffixKeys = Object.keys(patternSuffixMap);

function parseRequest(endpoint, method, payload) {
	var url = 'https://api.parse.com/1/' + endpoint;

	var headers = {
		'X-Parse-Application-Id': parseAppId,
		'X-Parse-REST-API-Key': parseRestAPIKey,
		'Content-Type': 'application/json'
	};

	var options = {
		'method': method,
		'headers': headers,
		'payload': JSON.stringify(payload)
	};

	return UrlFetchApp.fetch(url, options);
}

function parseFunction(functionName, payload) {
	var endpoint = 'functions/' + functionName;

	return parseRequest(endpoint, 'post', payload);
}

function publishSheet(sheet) {
	if (sheet) {
		var patternName = sheet.getName();

		var values = sheet.getSheetValues(1, 1, sheet.getLastRow(), sheet.getLastColumn());

		if (reverseRows == true) {
			values = values.reverse();
		}

		var patternClass = SpreadsheetApp.getActiveSpreadsheet().getName();

		// check if the pattern name needs a suffix
		var flat = [].concat.apply([], values);
		for (var i = 0; i < patternSuffixKeys.length; i++) {
			var suffixKey = Number(patternSuffixKeys[i]);
			if (flat.indexOf(suffixKey) != -1) {
				patternClass = patternClass + patternSuffixMap[suffixKey];
			}
		}

		patternClass = patternClass.replace("-", "");
		patternClass = patternClass.replace(" ", "");

		var rowCount = values.length;
		var colCount = 0;

		// convert values to class names
		if (convertValues == true) {
			for (var x = 0; x < values.length; x++) {
				var row = values[x];
				for (var y = 0; y < row.length; y++) {
					colCount = row.length;
					var val = row[y];
					var newVal = valueMap[val];
					if (typeof newVal === 'undefined') {
						newVal = "UNDEFINED";
					};
					values[x][y] = newVal;
				}
			}
		}

		var payload = {
			"pattern": values,
			"name": patternName,
			"patternClass": patternClass,
			"rows": rowCount,
			"columns": colCount
		};

		parseFunction("publishPattern", payload);
	}
}

function publishToParse(e) {
	publishSheet(SpreadsheetApp.getActiveSheet());
}

function publishAllToParse(e) {
	var sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();

	for (var i = 0; i < sheets.length; i++) {
		var sheet = sheets[i];

		publishSheet(sheet);
	}
}

function onOpen() {
	var ui = SpreadsheetApp.getUi();
	ui.createMenu('Parse')
		.addItem('Publish to Parse', 'publishToParse')
		.addSeparator()
		.addItem('Publish All Sheets to Parse', 'publishAllToParse')
		.addToUi();
}

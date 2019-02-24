var ygoapi = require('./yugioh-api.js');

//console.log('\nygoapi.getStatus():\n');
//console.log(JSON.stringify(ygoapi.getStatus(), null, 4));

//console.log('\nygoapi.getCardInfo(\'sp15-en038\'):\n');
//console.log(JSON.stringify(ygoapi.getCardInfo('sp15-en038'), null, 4));


//console.log('\nygoapi.getCardInfo(\'ligma\'):\n');
//console.log(JSON.stringify(ygoapi.getCardInfo('ligma'), null, 4));


console.log('\nygoapi.getCardPrice(\'sp15-en038\'):\n');
console.log(JSON.stringify(ygoapi.getCardPrice('sp15-en038'), null, 4));


//console.log('\nygoapi.getCardPrice(\'ligma\'):\n');
//console.log(JSON.stringify(ygoapi.getCardPrice('ligma'), null, 4));
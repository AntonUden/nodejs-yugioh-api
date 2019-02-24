var request = require('sync-request');
var cheerio = require('cheerio');
var fakeUa = require('fake-useragent');
var querystring = require('querystring');

exports.getCardPrice = function(printTag) {
	printTag = printTag.toUpperCase();
	let result = new Object();

	console.log('Checking price for ' + printTag);

	let cardInfo = this.getCardInfo(printTag);

	if(cardInfo.success) {
		console.log('Card info found!');
		result.data = new Object();
		result.data.card = cardInfo.data;

		let url = 'https://www.cardmarket.com/en/YuGiOh/Cards/' + querystring.escape(cardInfo.data.name.replace(/\s+/g, '-').replace(/:+/g, ''));

		console.log(url);
		response = request('GET', url + '/Versions', {
			headers: {
				'user-agent': fakeUa()
			},
		});
		if(response.statusCode == 200) {
			let $ = cheerio.load(response.getBody('utf8'));
			let versions = $('#ReprintSection').find('.card-column');
			let URLs = [];

			for(let i = 0; i < versions.length; i++) {
				let url = 'https://www.cardmarket.com' + $(versions[i]).find('a').first().attr('href');
				console.log('Found ' + url);
				let expansion = $(versions[i]).find('.yugiohExpansionIcon').text();
				
				if(printTag.startsWith(expansion.toUpperCase())) {
					URLs.push(url);
				}
			}

			console.log(URLs);

			let allowedConditions = ['Mint', 'Near Mint', 'Excellent'];
			let allowedLanguage = ['English'];
			
			let httpError = false;
			
			for (let i = 0; i < URLs.length; i++) {
				response = request('GET', URLs[i], {
					headers: {
						'user-agent': fakeUa()
					},
				});

				if(response.statusCode == 200) {
					$ = cheerio.load(response.getBody('utf8'));

					if($('#tabContent-info').find('.icon').first().attr('onmouseover').toUpperCase().includes(cardInfo.data.price_data.rarity.replace(' Rare', '').toUpperCase())) {
						let articles = $('.article-table').find('.article-row');
						let prices = [];

						for(let j = 0; j < articles.length; j++) {
							let condition = $(articles[j]).find('.product-attributes').first().find('a[href*="CardCondition"]').first().find('span').first().data('original-title');
							if(allowedConditions.includes(condition)) {
								let language = $(articles[j]).find('.product-attributes').first().find('span.icon.mr-2').first().data('original-title');
								if(allowedLanguage.includes(language)) {
									let price = parseFloat($(articles[j]).find('.mobile-offer-container').first().find('div').first().find('span').first().text().replace(/,/g, '.'));
									console.log('Found price ' + price + ' €');
									prices.push(price);
								}
							}
						}
						
						let lowestPrice = undefined;
						for(let j = 0; j < prices.length; j++) {
							if(lowestPrice == undefined) {
								lowestPrice = prices[j];
								continue;
							}
							
							if(prices[j] < lowestPrice) {
								lowestPrice = prices[j];
							}
						}

						console.log('Lowest price ' + lowestPrice);
						
						result.success = true;
						result.error = false;
						result.data.cardmarket = new Object();
						result.data.cardmarket.found = true;
						result.data.cardmarket.prices = prices;
						result.data.cardmarket.lowest_price = lowestPrice;
						
						return result;
					}
				} else {
					httpError = true;
				}
			}
			console.log('0 Results found');
			result.success = false;
			result.error = httpError;
			result.message = '0 Results found'+ (httpError ? ' . HTTP error occurred' : '');
			return result;
		} else {
			console.log('Failed to find cardmarket Versions');
			result.success = false;
			result.error = true;
			result.message = 'cardmarket.com statusCode: ' + response.statusCode;
		}
	} else {
		console.log('Failed to get card info');
		if(cardInfo.error) {
			result.success = false;
			result.error = true;
			result.message = cardInfo.message;
		} else {
			result.success = false;
			result.error = false;
			result.message = cardInfo.message;
		}
	}

	return result;
};

exports.getCardInfo = function(printTag) {
	printTag = printTag.toUpperCase();
	console.log('Checking card info for ' + printTag);
	let result = new Object();

	let response = request('GET', 'https://yugiohprices.com/api/price_for_print_tag/' + printTag, {
		headers: {
			//'user-agent': fakeUa()
		},
	});
	
	if(response.statusCode == 200) {
		var data = JSON.parse(response.getBody('utf8'));
		if(data.status == 'success') {
			result.success = true;
			result.error = false;
			result.message = '';
			result.data = data.data;
		} else {
			console.log('Card not found');
			result.success = false;
			result.error = false;
			result.yugiohprices_status = data.status;
			result.message = data.message;
		}
	} else {
		console.log('HTTP Error ' + response.statusCode);
		result.success = false;
		result.error = true;
		result.message = 'yugiohprices.com statusCode: ' + response.statusCode;
		result.statusCode = response.statusCode;
	}

	return result;
};

exports.getStatus = function(printTag) {
	let result = new Object()
	result.yugiohprices = new Object();
	result.cardmarket = new Object();

	let response = undefined;

	// Random card from yugiohprices.com
	response = request('GET', 'https://yugiohprices.com/api/price_for_print_tag/LCGX-EN016', {
		headers: {
			//'user-agent': fakeUa()
		},
	});
	
	result.yugiohprices.working = (response.statusCode == 200);
	result.yugiohprices.statusCode = response.statusCode;

	response = request('GET', 'https://www.cardmarket.com/en/YuGiOh/Cards/Polymerization/Versions', {
		headers: {
			'user-agent': fakeUa()
		},
	});
	result.cardmarket.working = (response.statusCode == 200);
	result.cardmarket.statusCode = response.statusCode;
	
	return result;
};

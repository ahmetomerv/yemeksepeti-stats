const orders = [];
const orderDateRegex = /Sipariş\s*Tarihi:\s*((3[01]|[12][0-9]|0?[1-9])[.](1[012]|0?[1-9])[.]((?:19|20)\d{2}))/;
const orderPriceRegex = /Tutar\s*:\s*(\d*\,?[0-9]?[0-9]?)/;
const numberRegex = /\d+/;
const ysFooter = document.getElementsByClassName('ys-footer')[0];
let ordersTotalSum = 0;
let ordersAveragePrice = 0;
let orderPageCounter = 0;

initializeNetworkListener();
scrollToElement(ysFooter);

const PIXEL_RATIO = (() => {
	const context = document.createElement('canvas').getContext('2d'),
		 dpr = window.devicePixelRatio || 1,
		 bsr = context.webkitBackingStorePixelRatio ||
			  context.mozBackingStorePixelRatio ||
			  context.msBackingStorePixelRatio ||
			  context.oBackingStorePixelRatio ||
			  context.backingStorePixelRatio || 1;
	return dpr / bsr;
})();

function scrapeYsOrdersData() {
	const ordersNodeList = document.querySelectorAll('.order-item');
	let foodList = [];
	let foodListSortedByCount = [];

	if (ordersNodeList && ordersNodeList.length > 0) {
		[].forEach.call(ordersNodeList, (node, index) => {
			let order = {
				orderRestaurant: node.children[0].children[0].children[0].innerText, // order restaurant
				orderDate: node.children[0].children[0].children[1].innerText.match(orderDateRegex)[1], // order date
				orderContent: node.children[1].children[0].children[0].children[0].innerText.split(', '), // order content
				orderPrice: parseFloat(node.children[1].children[0].children[0].children[1].innerText.match(orderPriceRegex)[1]) // order price
			};

			orders.push(order);
			ordersTotalSum += orders[index].orderPrice ? orders[index].orderPrice : 0;
		});

		ordersAveragePrice = Math.floor(ordersTotalSum / orders.length);

		for (let z = 0; z < orders.length; z++) {
			for (let x = 0; x < orders[z].orderContent.length; x++) {
				foodList.push(orders[z].orderContent[x]);
			}
		}

		foodListSortedByCount = sortFoodByOrderCount(foodList);
		createYsStatsCanvas(foodListSortedByCount);

		console.log('Total orders: ' + orders.length);
		console.log('Total spending: ' + ordersTotalSum + ' TL');
		console.log('Average order price: ' + ordersAveragePrice + ' TL');
	}
}

function sortFoodByOrderCount(foodList) {
	let a = [];
	let b = [];
	let prev;
	let finalList = [];

	if (foodList && foodList.length > 0) {
		foodList.sort();
		for (let i = 0; i < foodList.length; i++) {
			if (foodList[i] !== prev) {
				a.push(foodList[i]);
				b.push(1);
			} else {
				b[b.length - 1]++;
			}
	
			prev = foodList[i];
		}
	
		for (let x = 0; x < a.length; x++) {
			const foodCountNum = Number(a[x].match(numberRegex)[0]);
			a[x] = a[x].replace(numberRegex, '').trim();
	
			if (foodCountNum > 1) {
				b[x]++
			}
	
			finalList.push({
				food: a[x],
				count: b[x],
			});
		}

		const dublicateFoods = [];
		const ids = [];
		const pureFoods = [];

		finalList.forEach(x => {
			if (ids[x.food]) {
				dublicateFoods.push(x)
			} else {
				ids[x.food] = true;
				pureFoods.push(x);
			}
		});
		
		pureFoods.forEach(x => {
			dublicateFoods.forEach(z => {
				if (x.food === z.food) {
					x.count += z.count;
				}
			})
		})

		pureFoods.sort((f, h) => {
			return h.count - f.count;
		});
	
		return pureFoods;
	}

	return [];
}

function createHiDPICanvas(width, height, ratio) {
	width = width || window.innerWidth;
	height = height || window.innerHeight;
	const canvasElement = document.createElement('canvas');

	if (!ratio) {
		ratio = PIXEL_RATIO;
	}

	canvasElement.width = width * ratio;
	canvasElement.height = height * ratio;
	canvasElement.style.width = width + 'px';
	canvasElement.style.height = height + 'px';
	canvasElement.getContext('2d').setTransform(ratio, 0, 0, ratio, 0, 0);

	return canvasElement;
}

function initializeCanvasGradient(context, width, height, color1, color2) {
	color1 = color1 || '#fff';
	color2 = color2 || '#000';
	width = width || window.innerWidth;
	height = height || window.innerHeight;
	const gradient = context.createLinearGradient(width, 0, 0,0);

	gradient.addColorStop(1, color1);
	gradient.addColorStop(0, color2);

	context.fillStyle = gradient;
	context.fillRect(0, 0, width, height);
}

function createImage(imgUrl) {
	if (imgUrl) {
		const element = document.createElement('img');
		element.setAttribute('crossorigin', '');
		element.src = imgUrl;

		return element;
	}
}

function createYsStatsCanvas(foodList) {
	const width = 1080;
	const height = 720;
	let canvas = createHiDPICanvas(width, height);
	let context = canvas.getContext('2d');

	initializeCanvasGradient(context, width, height, '#ed2e43', '#7e0300');

	const ysUserName = document.getElementById('ysUserName').innerText;
	const ysUserPictureSrc = document.getElementById('ysUserPicture').src;
	const ysProfileImage = createImage(ysUserPictureSrc);
	let profileImagePromiseResolve, profileImagePromiseReject;

	const profileImagePromise = new Promise((resolve, reject) => {
		profileImagePromiseResolve = resolve;
		profileImagePromiseReject = reject;
	});

	ysProfileImage.onload = () => {
		context.drawImage(ysProfileImage, 25, 20, 40, 40);
		context.fillStyle = '#fff';
		context.font = "italic 14px Roboto";
		context.fillText(ysUserName,  75, 45);
		profileImagePromiseResolve();
	};

	ysProfileImage.onerror = profileImagePromiseReject;

	context.fillStyle = '#fff';
	context.font = 'bold 35px Roboto';
	context.fillText('Yemeksepetim',  width/2 - 140, 50);

	context.fillStyle = 'rgba(255,255,255,0.33)';
	context.font = 'normal 15px Roboto';
	context.fillText('@ahmetomerv',  width - 140, 45);

	context.fillStyle = '#fff';
	context.font = 'normal 22px Roboto';
	context.fillText(`Toplamda ${orders.length} sipariş verildi, ${ordersTotalSum} TL harcandı. Ortalama sipariş tutarı ise ${ordersAveragePrice} TL.`,  25, 200);

	context.fillStyle = '#fff';
	context.font = 'bold 20px Roboto';
	context.fillText('En çok sipariş edilen yemekler:',  25, 250);

	for (let i = 0, y = 300; i < foodList.length; y += 40, i++) {
		if (i <= 9) {
			let rowText = `${i + 1} - ${foodList[i].food} (${foodList[i].count} adet)`;
			context.fillStyle = 'rgba(255,255,255,0.89)';
			context.font = '15px Roboto';
			context.fillText(rowText,25, y);
		} else if (i > 9) {
			break;
		}
	}

	profileImagePromise.then((val) => {
		canvas.id = 'ysStatsCanvas';
		canvas.style.display = 'none';
		document.body.appendChild(canvas);
		downloadCanvasImage(canvas, ysUserName);
		downloadJsonData(orders);
	}).catch(err => {
		console.log(err);
	});
}

const downloadCanvasImage = (canvas, userName) => {
	userName = userName.toLowerCase().replace(' ', '') || '';
	const fileName = userName ? (userName + '-' + 'ys-stats.png') : 'ys-stats.png';

	if (canvas) {
		const link = document.createElement('a');
		const data = canvas.toDataURL('image/png');

		canvas.setAttribute('crossorigin', '');
		link.style.display = 'none';
		link.download = fileName;
		link.href = data;
		link.click();
	}
};

function downloadJsonData(data) {
	if (data) {
		const fileName = 'ys-data.json';
		const link = document.createElement('a');
		const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data));

		link.style.display = 'none';
		link.download = fileName;
		link.href = dataStr;
		link.click();
	}
}

function scrollToElement(element) {
	if (element) {
		setTimeout(() => {
			element.scrollIntoView({ behavior: 'auto' });
		}, 500)
	}
}

function initializeNetworkListener() {
	const origOpen = XMLHttpRequest.prototype.open;
	XMLHttpRequest.prototype.open = function() {
		this.addEventListener('load', function() {
			const data = JSON.parse(this.responseText);
			orderPageCounter++;
			
			if (!data.HasNextPage && orderPageCounter > 3) {
			 	scrapeYsOrdersData();
			 	return;
			}
			
			if (data.HasNextPage) {
				scrollToElement(ysFooter);
				return;
			}
		});
		origOpen.apply(this, arguments);
	};
}


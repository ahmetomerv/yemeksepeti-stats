# Yemeksepeti Stats
Order statistics tool for Yemeksepeti. Orders history data are collected from DOM elements since Yemeksepeti doesn't have a public API. There is a way to listen to outgoing POST network calls to `/Account/GetOrderHistory` and access the data, which is triggered on scroll, but there's no way to run the code and catch the first request(well, this can be done with a browser extension, but I find that kind of usage to be inconvenient, for the time being at least).

One little drawback is that this only works for order history that are more than 3 pages, which are about 60 orders. This has to do with a bug Yemeksepeti API has which always returns `false` for `HasNextPage` property in the fourth call.

## Usage
To get your order history (overview [image](https://ahmetomerv.github.io/yemeksepeti-stats/assets/samples/ys-stats.png) and [json](https://ahmetomerv.github.io/yemeksepeti-stats/assets/samples/sample-data.json) file will be downloaded):



1. Copy the [code](https://raw.githubusercontent.com/ahmetomerv/yemeksepeti-stats/master/scripts/ys-stats.js)
2. Go to [Yemeksepeti Order History](https://www.yemeksepeti.com/hesabim/onceki-siparislerim) page
3. Open the console with F12
4. Paste the code and press Enter


---
[MIT License](https://opensource.org/licenses/MIT)
const widget = document.querySelector('.widget');
const widgetInfo = widget.querySelector('.widget__info');
const selectList = widget.querySelector(".widget__markets");

// connect to NEAR
const near = new nearApi.Near({
  keyStore: new nearApi.keyStores.BrowserLocalStorageKeyStore(),
  networkId: 'testnet',
  nodeUrl: 'https://rpc.testnet.near.org',
  walletUrl: 'https://wallet.testnet.near.org'
});

const wallet = new nearApi.WalletConnection(near, 'login-app');

const contract = new nearApi.Contract(
  wallet.account(),
  "app_2.spin_swap.testnet", {
    viewMethods: ["markets", "view_market"]
  }
);

async function getMarkets() {
  const markets = await contract.markets();

  for (let i = 0; i < markets.length; i++) {
    const option = document.createElement("option");
    option.value = markets[i].id;
    option.text = markets[i].base.ticker + ' / ' + markets[i].quote.ticker;
    selectList.appendChild(option);
  }
}

async function viewMarkets(id) {
  const markets = await contract.view_market({
    "market_id": id
  })

  console.log(markets)
  fillData(markets.ask_orders, markets.bid_orders);
}

function fillData(ask, bid) {
  const marketsTable = document.querySelector('.widget__orders');
  marketsTable.innerHTML = '';
  for (let i = 0; i < arguments.length; i++) {
    arguments[i].forEach(el => {
      el = '<div class="widget__orders__item"><div>' + formatExponential(el.price) + '</div><div>' + formatExponential(el.quantity) + '</div><div>' + (formatExponential(el.price) * formatExponential(el.quantity)).toFixed(2) + '</div></div>'
      marketsTable.insertAdjacentHTML('afterbegin', el);
    });

    // dividers
    if (i === 1) {
      el = ' <div class="widget__orders__item"><div class="ask-orders">Ask orders</div></div>';
      marketsTable.insertAdjacentHTML('afterbegin', el);
    }
    if (i === arguments.length - 2) {
      el = '<div class="widget__orders__item"><div class="bid-orders">Bid orders</div></div>';
      marketsTable.insertAdjacentHTML('afterbegin', el);
    }
  }
}

function formatExponential(number) {
  let bigNUM = number.toLocaleString('fullwide', {
    useGrouping: false
  });
  return Number(nearApi.utils.format.formatNearAmount(bigNUM)).toFixed(4);
}

selectList.addEventListener('change', () => {
  const marketId = selectList.options[selectList.selectedIndex].value;
  viewMarkets(Number(marketId));
})

getMarkets();
viewMarkets(1);
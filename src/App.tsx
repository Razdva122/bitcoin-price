import React, { useEffect, useState } from 'react';
import './App.css';
import { Header } from './components/header';
import { WalletsList } from './components/wallets-list';
import { Price } from './components/price';
import { Chart } from './components/chart';
import { IAppData, IGlobalState, IPortfolioState, TPriceType } from './interface';
import { 
	getPriceOfDate, 
	getStateOfWallet, 
	getDateInYYYYMMDDFormat, 
	getAveragePrice,
	collectAllPricesFromDate,
	getPriceOfDatesFromCache,
	getTotalBTCByDays,
	getAVGBTCByDays
} from './helpers';
import { Spin } from 'antd';

import { PORTFOLIO_DATA_PATH } from './const';

function App() {
	const [portfolios, setPortfolios] = useState<IAppData>(JSON.parse(localStorage.getItem(PORTFOLIO_DATA_PATH) ?? '{}'));
	const [portfolioState, setPortfolioState] = useState<IGlobalState | undefined>(undefined);
	const [selectedPortfolio, setSelectedPortfolio] = useState<string | undefined>(Object.keys(portfolios)[2]);
	const [priceType, setPriceType] = useState<TPriceType>('diff');

	useEffect(() => {
		const getData = async function() {
			const promisesAddresses: Array<Promise<any>> = [];
			const promisesPrices: Array<Promise<any>> = [];
	
			const 
				todayDate = getDateInYYYYMMDDFormat(new Date().toString()),
				todayPrice = await getPriceOfDate(todayDate);

			const globalState = Object.entries(portfolios).reduce<IGlobalState>((acc, [el, {wallets}]) => {
				acc[el] = {
					wallets: wallets.reduce<IPortfolioState['wallets']>((acc, el) => {
						acc[el] = {transactions: []}
						return acc;
					}, {}),
					total: {
						current: {
							BTC: 0,
							USD: 0,
							RUB: 0
						},
						buy: {
							BTC: 0,
							USD: 0,
							RUB: 0
						},
					},
					transactions: []
				};
				return acc;
			}, {});

			Object.entries(portfolios).forEach(([key, {wallets}]) => {
				wallets.forEach((wallet) => {
					const statePromise = getStateOfWallet(wallet);
					promisesAddresses.push(statePromise);

					statePromise.then((res) => {
						res.txrefs?.forEach((tx: any) => {
							const date = getDateInYYYYMMDDFormat(tx.confirmed);

							if (tx.value < 100000) {
								return;
							}

							const valueBTC = tx.value / 100000000;

							const pricePromise = getPriceOfDate(date);

							promisesPrices.push(pricePromise);

							pricePromise.then((data) => {
								const result = {
									wallet,
									date,
									price: {
										current: {
											BTC: Number(valueBTC.toFixed(7)),
											USD: Math.floor(valueBTC / todayPrice.BTC),
											RUB: Math.floor((valueBTC / todayPrice.BTC) * todayPrice.RUB * 1.05),
										},
										buy: {
											BTC: Number(valueBTC.toFixed(7)),
											USD: Math.floor(valueBTC / data.BTC),
											RUB: Math.floor((valueBTC / data.BTC) * data.RUB * 1.05),
										}
									}
								};

								globalState[key].transactions.push(result);
								globalState[key].wallets[wallet].transactions.push(result);
							});
						})
					})
				})
			});

			(await Promise.all(promisesAddresses));

			(await Promise.all(promisesPrices));

			Object.values(globalState).forEach((value) => {
				value.total = value.transactions.reduce((acc, el) => {
					acc.buy.BTC += el.price.buy.BTC;
					acc.buy.USD += el.price.buy.USD;
					acc.buy.RUB += el.price.buy.RUB;

					acc.current.BTC += el.price.current.BTC;
					acc.current.USD += el.price.current.USD;
					acc.current.RUB += el.price.current.RUB;
					return acc;
				}, {
					current: {
						BTC: 0,
						USD: 0,
						RUB: 0,
					},
					buy: {
						BTC: 0,
						USD: 0,
						RUB: 0,
				}})
			})

			let firstDate = todayDate;

			Object.values(globalState).forEach(({transactions}) => {
				transactions.forEach((transaction) => {
					if (new Date(firstDate) > new Date(transaction.date)) {
						firstDate = transaction.date;
					}
				});
			});

			collectAllPricesFromDate(firstDate);

			setPortfolioState(globalState);
		}
		
    getData();
  }, [portfolios]);

	function updatePortfolios(portfolios: IAppData): void {
		localStorage.setItem(PORTFOLIO_DATA_PATH, JSON.stringify(portfolios));
		setPortfolios(portfolios);
	}

	function addPortfolio(name: string): void {
		if (name && portfolios[name] === undefined) {
			updatePortfolios({...portfolios, [name]: {wallets: []}})
		}
	}

	function addWallet(wallet: string): void {
		if (selectedPortfolio && portfolios[selectedPortfolio] && !portfolios[selectedPortfolio].wallets.includes(wallet)) {
			updatePortfolios({...portfolios, [selectedPortfolio]: {wallets: [...portfolios[selectedPortfolio].wallets, wallet]}})
		}
	}

	let mainContent;

	if (!selectedPortfolio) {
		mainContent = <div>Select or create portfolio to work</div>
	} else if (!portfolioState) {
		mainContent = <Spin tip="Loading" size="large"><div className="spin-content" /></Spin>
	} else {
		const priceDate = getPriceOfDatesFromCache();

		const 
			totalBTC = getTotalBTCByDays(portfolioState[selectedPortfolio].transactions),
			avgRUB = getAVGBTCByDays(portfolioState[selectedPortfolio].transactions, 'RUB'),
			avgUSD = getAVGBTCByDays(portfolioState[selectedPortfolio].transactions, 'USD');

		const chartDate = {
			labels: priceDate.map((el) => el.date),
			datasets: [
				{
					label: 'RUB',
					data: priceDate.map((el) => el.RUB),
					yAxisID: 'y',
				},
				{
					label: 'BTC',
					data: priceDate.map((el) => 1 / el.BTC),
					yAxisID: 'y1',
				},
				{
					label: 'Amount BTC',
					data: priceDate.map(({date}) => {
						const transaction = totalBTC.find((el) => el.date === date);

						if (transaction) {
							return transaction.BTC;
						}

						return null;
					}),
					yAxisID: 'y2',
				},
				{
					label: 'Average USD',
					data: priceDate.map(({date}) => {
						const transaction = avgUSD.find((el) => el.date === date);

						if (transaction) {
							return transaction.AVGPrice;
						}

						return null;
					}),
					yAxisID: 'y3',
				},
				{
					label: 'Average USD/RUB',
					data: priceDate.map(({date, RUB}) => {
						const transaction = avgRUB.find((el) => el.date === date);

						if (transaction) {
							return Math.floor(transaction.AVGPrice / RUB);
						}

						return null;
					}),
					yAxisID: 'y3',
				},
			]
		}

		const chartOptions = {
			responsive: true,
			spanGaps: true,
			scales: {
				y: {
					display: false,
					position: 'left',
				},
				y1: {
					display: true,
					position: 'left',
				},
				y2: {
					display: false,
					position: 'left',
				},
				y3: {
					display: false,
					position: 'left',
				}
			}
		}

		mainContent = (<div>
			<Price price={portfolioState[selectedPortfolio].total} text={'TOTAL:'} type={priceType}></Price>
			<Price price={getAveragePrice(portfolioState[selectedPortfolio].total)} text={'AVG buy:'} type={priceType}></Price>
			<WalletsList addWallet={addWallet} wallets={portfolioState[selectedPortfolio].wallets}></WalletsList>
			<Chart type={'line'} data={chartDate} options={chartOptions}></Chart>
		</div>)
	}

  return (
    <div className="App">
      <Header
				portfolios={portfolios}
				selectedPortfolio={selectedPortfolio}
				priceType={priceType}
				addPortfolio={addPortfolio}
				setSelectedPortfolio={setSelectedPortfolio}
				setPriceType={setPriceType}
			></Header>
			{mainContent}
    </div>
  );
}

export default App;

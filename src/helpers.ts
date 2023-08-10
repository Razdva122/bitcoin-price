import axios from 'axios';
import { IPriceTime,  IPrice, ITransaction } from './interface';

export const DATES_HISTORY_PATH = '[[DATES_HISTORY_PATH]]';
export const WALLET_HISTORY_PATH = '[[WALLET_HISTORY_PATH]]';

export async function getPriceOfDate(date: string): Promise<{BTC: number; RUB: number}> {
	let state = JSON.parse(localStorage.getItem(DATES_HISTORY_PATH) ?? '{}');

	if (state[date]) {
		return state[date];
	}

	const start = ["htt","ps:","//o","pen","exc","han","ger","ate","s.o","rg/","api","/hi","sto","ric","al/"];
	const end = [".","jso","n?a","pp_","id=","0a8","280","3cb","bb0","4d2","891","bb2","80f","1b9","d78","5f&","sym","bol","s=B","TC,","RUB"];

	const historyData = await axios.get(`${start.join('')}${date}${end.join('')}`);

	state = JSON.parse(localStorage.getItem(DATES_HISTORY_PATH) ?? '{}');

	state[date] = historyData.data.rates;

	localStorage.setItem(DATES_HISTORY_PATH, JSON.stringify(state));

	return state[date];
}

export function getPriceOfDatesFromCache(): Array<{date: string; BTC: number; RUB: number}> {
	const state = JSON.parse(localStorage.getItem(DATES_HISTORY_PATH) ?? '{}');

	return Object.entries(state).map(([date, value]) => ({
		date,
		BTC: (value as {BTC: number; RUB: number}).BTC,
		RUB: (value as {BTC: number; RUB: number}).RUB
	})).sort((a, b) => Number(new Date(a.date)) - Number(new Date(b.date)))
}

export async function getStateOfWallet(wallet: string): Promise<any> {
	let state = JSON.parse(localStorage.getItem(WALLET_HISTORY_PATH) ?? '{}');

	console.log(state[wallet]);

	if (state[wallet] && state[wallet].unconfirmed_balance === 0 && state[wallet].txrefs) {
		return state[wallet];
	}

	const walletData = await axios.get(`https://api.blockcypher.com/v1/btc/main/addrs/${wallet}`);

	state[wallet] = walletData.data;

	localStorage.setItem(WALLET_HISTORY_PATH, JSON.stringify(state));

	return state[wallet];
}

export function getDateInYYYYMMDDFormat(date: string): string {
	return new Date(date).toISOString().split('T')[0];
}

export function getAveragePrice(price: IPriceTime): IPriceTime {
	function getAverage(elPrice: IPrice): IPrice {
		return Object.entries(elPrice).reduce<IPrice>((acc, [name, amount]) => {
			acc[name as keyof IPrice] = Math.floor(amount / elPrice.BTC);
			return acc;
		}, {} as IPrice);
	}

	return {
		buy: getAverage(price.buy),
		current: getAverage(price.current)
	}
}

export function collectAllPricesFromDate(date: string): void {
	let start = new Date(date);
	let finish = new Date();

	while (start < finish) {
		getPriceOfDate(getDateInYYYYMMDDFormat(start.toString()));
		start.setDate(start.getDate() + 1);
	}
}

export function getDataByDays(transactions: ITransaction[]): Pick<ITransaction, 'date' | 'price'>[] {
	transactions.sort((a, b) => Number(new Date(a.date)) - Number(new Date(b.date)));

	return transactions.reduce<Pick<ITransaction, 'date' | 'price'>[]>((acc, el) => {
		if (acc[acc.length - 1]?.date !== el.date) {
			acc.push({
				date: el.date,
				price: el.price
			});
		} else {
			acc[acc.length - 1] = JSON.parse(JSON.stringify(acc[acc.length - 1]));
			acc[acc.length - 1].price.buy.BTC += el.price.buy.BTC;
			acc[acc.length - 1].price.current.BTC += el.price.current.BTC;
			acc[acc.length - 1].price.buy.RUB += el.price.buy.RUB;
			acc[acc.length - 1].price.current.RUB += el.price.current.RUB;
			acc[acc.length - 1].price.buy.USD += el.price.buy.USD;
			acc[acc.length - 1].price.current.USD += el.price.current.USD;
		}

		return acc;
	}, [])
}

export function getTotalBTCByDays(transactions: ITransaction[]): {date: string, BTC: number}[] {
	const
		transactionsByDays = getDataByDays(transactions);

	return transactionsByDays.reduce<{date: string, BTC: number}[]>((acc, el, index) => {
		if (index === 0) {
			acc.push({
				date: el.date,
				BTC: el.price.buy.BTC
			})

		} else {
			acc.push({
				date: el.date,
				BTC: el.price.buy.BTC + acc[acc.length - 1].BTC
			})
		}

		return acc;
	}, []);
}

export function getAVGBTCByDays(transactions: ITransaction[], currency: 'RUB' | 'USD'): {date: string, AVGPrice: number, amount: number, total: number}[] {
	const
		transactionsByDays = getDataByDays(transactions);

	return transactionsByDays.reduce<{date: string, AVGPrice: number, amount: number, total: number}[]>((acc, el, index) => {
		if (index === 0) {
			acc.push({
				date: el.date,
				AVGPrice: Math.floor(el.price.buy[currency] / el.price.buy.BTC),
				total: el.price.buy[currency],
				amount: el.price.buy.BTC
			})

		} else {
			const
				total = el.price.buy[currency] + acc[acc.length - 1].total,
				amount = el.price.buy.BTC + acc[acc.length - 1].amount;

			acc.push({
				date: el.date,
				AVGPrice: Math.floor(total / amount),
				total,
				amount,
			})
		}

		return acc;
	}, []);
}
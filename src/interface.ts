
export interface IPrice {
	BTC: number;
	USD: number;
	RUB: number;
}

export interface IPriceTime {
	current: IPrice;
	buy: IPrice;
};

export interface ITransaction {
	wallet: string;
	date: string;
	price: IPriceTime;
}

export interface IPortfolioState {
	wallets: {[key: string]: {transactions: Array<ITransaction>}};
	transactions: Array<ITransaction>;
	total: IPriceTime;
}

export interface IGlobalState {
	[key: string]: IPortfolioState
}

export interface IAppState {
	[key: string]: IPortfolioState
}

export interface IPortfolioData {
	wallets: Array<string>;
}

export interface IAppData {
	[key: string]: IPortfolioData;
}

export interface IPriceHistory {
	[key: string]: {
		btc: number;
		rub: number;
	}
}

export type TPriceType = 'full' | 'diff';

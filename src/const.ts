export const DATES_HISTORY_PATH = '[[DATES_HISTORY_PATH]]';
export const WALLET_HISTORY_PATH = '[[WALLET_HISTORY_PATH]]';
export const PORTFOLIO_DATA_PATH = '[[PORTFOLIO_DATA_PATH]]';

(window as any).cloneState = function cloneState() {
	return {
		[WALLET_HISTORY_PATH]: localStorage.getItem(WALLET_HISTORY_PATH),
		[DATES_HISTORY_PATH]: localStorage.getItem(DATES_HISTORY_PATH),
		[PORTFOLIO_DATA_PATH]: localStorage.getItem(PORTFOLIO_DATA_PATH),
	};
}

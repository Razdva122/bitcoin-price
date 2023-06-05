import React, { FC } from 'react';
import { IPriceTime } from '../../interface';

import './style.css';

export const Price: FC<{price: IPriceTime, text?: string}> = ({price, text}) => {
	const textHtml = text ? <span>{text}&nbsp;</span> : null;

	const diffOfPrice = (currency: 'USD' | 'RUB') => {
		let priceDiff;

		if (price.buy[currency] <= price.current[currency]) {
			priceDiff = <span className='profit'>+{(price.current[currency] - price.buy[currency]).toLocaleString('ru-RU')}</span>
		} else {
			priceDiff = <span className='loss'>-{(price.buy[currency] - price.current[currency]).toLocaleString('ru-RU')}</span>
		}

		return (
			<span>
				{currency}: {(price.buy[currency]).toLocaleString('ru-RU')} ({priceDiff})
			</span>
		)
	}
	return (
		<div className='price-container'>
			{textHtml}
			<span className='BTC-price'>BTC: {price.buy.BTC.toFixed(7)}</span>
			<span className='USD-price'>{diffOfPrice('USD')}</span>
			<span className='RUB-price'>{diffOfPrice('RUB')}</span>
		</div>
	)
}

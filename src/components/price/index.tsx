import React, { FC } from 'react';
import { IPriceTime, TPriceType } from '../../interface';

import './style.css';

export const Price: FC<{price: IPriceTime, text?: string, type?: TPriceType}> = ({price, text, type}) => {
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

	const totalPrice = (currency: 'USD' | 'RUB') => {
		return (
			<span>
				{currency}: {(price.current[currency]).toLocaleString('ru-RU')}
			</span>
		)
	}

	return (
		<div className='price-container'>
			{textHtml}
			<span className='BTC-price'>BTC: {price.buy.BTC.toFixed(7)}</span>
			<span className='USD-price'>{type === 'total' ? totalPrice('USD') : diffOfPrice('USD')}</span>
			<span className='RUB-price'>{type === 'total' ? totalPrice('RUB') : diffOfPrice('RUB')}</span>
		</div>
	)
}

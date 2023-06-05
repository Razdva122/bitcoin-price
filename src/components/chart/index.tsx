import React, { FC, useRef, useEffect } from 'react';
import ChartJS from 'chart.js/auto';
import type {ChartType} from 'chart.js/auto';

export const Chart: FC<{data: ChartJS['data'], options?: ChartJS['options'], type: ChartType}> = ({data, type, options}) => {
  const graphRef = useRef<HTMLCanvasElement>(null);
	const chartId = useRef<string | null>(null);

  useEffect(() => {
		if (chartId.current !== null) {
			return;
		}

    if (graphRef.current) {
      const myChart = new ChartJS(graphRef.current.getContext('2d')!, {
				type,
        data,
				options
      });

			chartId.current = myChart.id;
    }
  }, [graphRef.current, data, options, type]);

  return (
    <div>
      <canvas ref={graphRef}/>
    </div>
  );
}
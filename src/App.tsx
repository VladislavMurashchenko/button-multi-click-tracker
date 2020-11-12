import React, { useState, useRef, useEffect } from 'react';

import { fromEvent } from 'rxjs';
import { map } from 'rxjs/operators';

import styles from './App.module.css';
import {
  calcMillisecondDifferences,
  createIdGenerator,
  collectEventsWithTimeout,
} from './utils';

type MultiClickData = {
  id: number;
  clicksCount: number;
  millisecondDifferences: number[];
};

const createMultiClickId = createIdGenerator();

const DELAY_BETWEEN_CLICKS = 250;

function App() {
  const clickTrackerRef = useRef<HTMLButtonElement>(null);
  const [clicksCount, setClicksCount] = useState(2);
  const [multiClickList, setMultiClickList] = useState([] as MultiClickData[]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = +e.target.value;

    if (value >= 2 && value <= 10) {
      setClicksCount(value);
    }
  };

  const handleResetList = () => {
    setMultiClickList([]);
  };

  useEffect(() => {
    if (!clickTrackerRef.current) {
      throw Error('No button ref');
    }

    const subscription = fromEvent(clickTrackerRef.current, 'click')
      .pipe(
        collectEventsWithTimeout(clicksCount, DELAY_BETWEEN_CLICKS),
        map(
          (events: Event[]): Omit<MultiClickData, 'id'> => ({
            clicksCount,
            millisecondDifferences: calcMillisecondDifferences(events),
          }),
        ),
      )
      .subscribe((multiClickData: Omit<MultiClickData, 'id'>) => {
        setMultiClickList((list) =>
          list.concat({ id: createMultiClickId(), ...multiClickData }),
        );
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [clicksCount]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.controls}>
        <input
          className={styles.input}
          min={2}
          max={10}
          type="number"
          value={clicksCount}
          onChange={handleInputChange}
        />
        <button ref={clickTrackerRef} className={styles.button}>
          click tracker
        </button>
        <button onClick={handleResetList} className={styles.button}>
          reset list
        </button>
      </div>

      <ul className={styles.list}>
        {multiClickList.map(({ id, clicksCount, millisecondDifferences }) => {
          return (
            <li key={id} className={styles.listItem}>
              <span>clicks count: {clicksCount}; </span>
              <span>
                with intervals:{' '}
                {millisecondDifferences.map((time) => `${time}ms`).join(' ')}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default App;

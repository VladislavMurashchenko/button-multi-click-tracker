import { pipe, OperatorFunction } from 'rxjs';
import { scan, filter } from 'rxjs/operators';

export const createIdGenerator = () => {
  let id = 1;

  return () => {
    return id++;
  };
};

export const calcMillisecondDifferences = (events: Event[]) => {
  return events.reduce(
    (acc: number[], event: Event, i: number, arr: Event[]) => {
      const prevEvent = arr[i - 1];

      if (prevEvent) {
        acc.push(Math.round(event.timeStamp - prevEvent.timeStamp));
      }

      return acc;
    },
    [],
  );
};

export const collectEventsWithTimeout = (
  countToCollect: number,
  timeout: number,
): OperatorFunction<Event, Event[]> => {
  return pipe(
    scan((acc: Event[], event: Event) => {
      const prevEvent = acc[acc.length - 1] ?? {};
      const delayAfterPrevEvent = event.timeStamp - prevEvent.timeStamp;

      if (acc.length === countToCollect || delayAfterPrevEvent > timeout) {
        return [event];
      }

      return acc.concat(event);
    }, []),
    filter((events: Event[]) => events.length === countToCollect),
  );
};

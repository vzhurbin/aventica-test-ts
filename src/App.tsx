import * as React from 'react';

const getMondaySunday = (date: number) => {
  const newDate = new Date(date)
  const weekDay = newDate.getDay();
  const daysSinceMonday = weekDay === 0 ? 6 : weekDay - 1;

  const mondayMs = newDate.setDate(newDate.getDate() - daysSinceMonday);
  const sundayMs = newDate.setDate(newDate.getDate() + 6);

  return {
    monday: new Date(mondayMs).toLocaleDateString(),
    sunday: new Date(sundayMs).toLocaleDateString(),
  }
}

const syncTime = () => {
  fetch('https://yandex.com/time/sync.json?geo=213')
    .then(res => {
      if (res.ok) {
        return res.json();
      } else {
        return Promise.reject({
          status: res.status,
          statusText: res.statusText
        });
      }
    })
  // .then(res => console.log(res))
  // .catch((err) => console.log('Fetch error: ', err.message))
};

interface IPeriod {
  start: number;
  end: number;
}

interface IState {
  date?: number;
  focused?: boolean;
  updateTime?: number;
}

export default class DateRange extends React.PureComponent<any, IState> {
  public state: IState = {
    date: undefined,
    focused: undefined,
    updateTime: undefined,
  }

  public inputRef: React.RefObject<HTMLInputElement> = React.createRef();

  public componentDidMount() {
    if (this.inputRef.current) {
      this.inputRef.current.focus();
    }
  }

  public onChange = (e: any) => {
    const { date } = this.state;
    const inputDate = new Date(e.target.value).getTime();
    const newDate = date !== inputDate ? inputDate : date;

    this.setState({
      date: newDate,
      updateTime: syncTime() || Date.now(),
    })
  }

  public renderItems = (items: string[]) => {
    return (
      <div>
        {items.map((value, index) => <div key={index}>{value}</div>)}
      </div>)
  }

  public createItems = (period: IPeriod) => {
    const dates = [];
    const weekMs = 3600000 * 168;
    for (let i = +period.start; i < +period.end; i += weekMs) {
      const { monday, sunday } = getMondaySunday(i);
      dates.push(`${monday} - ${sunday}`)
    }

    return dates;
  }

  public toggleFocus = (state: boolean) => () =>
    this.setState({ focused: state })

  public createPeriod = (date: number) => {
    const newDate = new Date(date);
    newDate.setFullYear(newDate.getFullYear() + 1);
    return {
      end: newDate.getTime(),
      start: date,
    }
  }

  public render() {
    const { date, updateTime, focused } = this.state;
    const bgColor = focused ? '#f00' : '#fff';

    return (
      <div>
        <div>
          <input
            type="date"
            ref={this.inputRef}
            style={{ backgroundColor: bgColor }}
            onChange={this.onChange}
            onFocus={this.toggleFocus(true)}
            onBlur={this.toggleFocus(false)}
          />
        </div>
        <hr />
        <div>
          {`Последнее изменение: ${updateTime ? new Date(updateTime).toLocaleString() : ''}`}
        </div>
        <hr />
        <div>
          {date
            ? this.renderItems(this.createItems(this.createPeriod(date)))
            : null}
        </div>
      </div>)
  }
}

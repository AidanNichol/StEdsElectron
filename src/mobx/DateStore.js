import XDate from 'xdate';
import {observable, computed} from 'mobx';
export const dateDisplay = (dat)=> new XDate(dat).toString('dd MMM HH:mm')

export class DateStore {

	@observable today;
	constructor(today) {
		if (today)this.today = new XDate(today);
		else {
			this.today = new XDate();
			setInterval(()=>{
				const newToday = new XDate();
				if (newToday.toString('yyyy-MM-dd') !== this.todaysDate)this.today = newToday;
			}, 60000)
		}
		console.log(this)
	}

	@computed get todaysDate() {
		return this.today.toString('yyyy-MM-dd');
	}
	getLogTime(today = new Date()) {
		return new XDate(today).toString('i');
	}
	@computed get now() {
		return new XDate().toString('yyyy-MM-dd HH:mm');
	}

	@computed get prevDate() {return this.today.clone().addDays(-55).toString('yyyy-MM-dd');}
	@computed get lastAvailableDate() {return this.today.clone().addDays(59).toString('yyyy-MM-dd');}
	@computed get logTime() {
			return new XDate().toString('i');
		}
	datetimeIsRecent(datStr){
		return this.datetimeIsToday(datStr)
	}
	datetimeIsToday(datStr){
		return datStr.substr(0,10) === this.todaysDate; // in the same day
	}
}
const dateStore = new DateStore();
// const dateStore = new DateStore('2017-01-13');

export default dateStore;

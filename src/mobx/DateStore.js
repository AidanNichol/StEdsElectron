import XDate from 'xdate';
import { computed} from 'mobx';
export const dateDisplay = (dat)=> new XDate(dat).toString('dd MMM HH:mm')

export class DateStore {

	today;
	constructor(today) {
		if (today)this.today = new XDate(today);
		else this.today = new XDate();
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

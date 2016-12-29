import XDate from 'xdate';

var _today = XDate.today();


export var getTodaysDate = function() {
		return _today.toString('yyyy-MM-dd');
	};
export var getLogTime = function(_today = new Date()) {
		return new XDate(_today).toString('i');
	};
export var now = function() {
		return new XDate().toString('yyyy-MM-dd HH:mm');
	};
export var getPrevDate = function() {return new XDate(_today).addDays(-55).toString('yyyy-MM-dd');};
export var getLastAvailableDate = function() {return new XDate(_today).addDays(59).toString('yyyy-MM-dd');};
export function datetimeIsRecent(datStr){
	return datetimeIsToday(datStr);
	// var dat = new XDate(datStr);
	// return dat.diffHours(new XDate()) < 1; // in the last hour
}
export function datetimeIsToday(datStr){
	var dat = XDate.today().toString('yyyy-MM-dd');
	console.log('datetimeIsToday', {dat, datStr})
	return datStr.substr(0,10) === dat; // in the same day
}
export var getSubsDue = function() {
		var year = _today.getFullYear();
		var dat = new XDate(_today).setDate(1).setMonth(10);// month is 0 based
		if (_today.valueOf() > dat.valueOf())year += 1;
		return year;
	};
export var getSubsLate = function() {
		var year = _today.getFullYear();
		var dat = new XDate(_today).setDate(1).setMonth(1);
		if (_today.valueOf() < dat.valueOf())year -= 1;
		return year;
	};

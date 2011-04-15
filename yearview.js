/** The full names of the months to use as titles */
var MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** The VERY short names of the months to use as headings */
var DOW = ["S", "M", "T", "W", "T", "F", "S"];

/** The lengths of the months */
var DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

var SHOW_MONTH = "Click to display this month";

/**
 * Given a date, check if it is a leap year.
 * @param date The date in question.
 * @return Whether it is a leap year.
 */
function isLeapYear(date) {
  var y = date.getFullYear();
  if ((y % 4) == 0 && (y % 100) != 0) {
    return true;
  }
  return (y % 400) == 0;
}

/**
 * Display the current year.
 * @param opt_override An override year.
 */
function displayCurrentYear(opt_override) {
  var year = opt_override || (new Date()).getFullYear();
  showYear(year);
}

/**
 * Get the number of days in a month.
 * @param date The date in question.
 * @return The number of days in that month.
 */
function getDaysInMonth(date) {
  var days = DAYS_IN_MONTH[date.getMonth()];
  return (days == 28 && isLeapYear(date)) ? 29 : days;
}

/**
 * How many weeks does a given month overlap?
 * @param y The year.
 * @param m The month.
 * @return The number of weeks that the month overlap.
 */
function getWeeksInMonth(y, m) {
  var firstDate = new Date(y, m, 1);
  var firstDayOfMonth = firstDate.getDay();
  var daysInMonth = getDaysInMonth(firstDate);

  return Math.ceil((firstDayOfMonth + daysInMonth) / 7)
}


/**
 * Get the HTML for a specific month.
 * @param out The string buffer to append the output.
 * @param y The year.
 * @param m The month.
 * @param opt_weeks The minimum number of weeks to display.
 */
function getMonthHtml(out, y, m, opt_weeks) {
  var today = new Date();
  var todayYear = today.getFullYear();
  var todayMonth = today.getMonth();
  var todayDate = today.getDate();

  out.push('<table class="month" border=0 cellspacing=0>',
      '<tr><td colspan=7 title="',
      SHOW_MONTH, '" class="monthHeader clickable" ',
      'onclick="displayBirthdays(', y, ',', m+1, ')">', MONTH_NAMES[m], 
      '<tr>');

  for(var i = 0; i < DOW.length; ++i) {
    out.push('<td class="dow" style="color:black">', DOW[i]);
  }
  var firstDate = new Date(y, m, 1);
  var firstDayOfMonth = firstDate.getDay();
  var daysInMonth = getDaysInMonth(firstDate);
  var i = 0;
  var weeks = 0;
  var minWeeks = opt_weeks || Math.ceil(daysInMonth / 7);

  for(var d = 1 - firstDayOfMonth; 1; ++d) {
    var dow = i++ % 7;

    if (minWeeks <= weeks && dow == 0) {
      break;
    }
    if (dow == 0) {
      if(weeks>0)
      	out.push('</tr>');    
      out.push('<tr>');
      ++weeks;
    }
    out.push('<td class="');
    var c = 'normal';
    if (y == todayYear && m == todayMonth && d == todayDate){
      c = 'today';
    }
    if ((d <= daysInMonth) && ((dow == 0) || (dow == 6))){
      c = 'weekend ';
    }
    out.push(c);

    if (d >= 1 && d <= daysInMonth) {
    	if(birthdayInfo[m+1] && birthdayInfo[m+1][d])
      		out.push(' clickable" onclick="displayBirthdays(', y, ',', m+1, ',', d, ')" title="', birthdayInfo[m+1][d].length, ' friend(s)">', d);
      	else
      		out.push('">', d);
    } else {
      out.push('">&nbsp;');
    }
    out.push('</td>');
  }
  out.push('</tr></table>');
}

/**
 * This is the main drawing function. It will display a specific year.
 * @param year The year to draw.
 */
function showYear(y) {
  var out = ['<table>'];
  var weeks = 0;
  for (var m = 0; m < 12; ++m) {
    // Every 4 months, we start a new row.
    if (m % 4 == 0) {
      out.push('<tr>');

      // Calculate the maximum number of weeks for the months in this row.
      weeks = Math.max(getWeeksInMonth(y, m), getWeeksInMonth(y, m+1),
          getWeeksInMonth(y, m+2), getWeeksInMonth(y, m+3));
    }
    out.push('<td class="outer">');
    getMonthHtml(out, y, m, weeks);
  }
  out.push('</table>');
  document.getElementById('calendar_div').innerHTML = out.join('');  
}

// Setup the style + buttons
var DARK_BLUE = '#112aba';
var LIGHT_BLUE = '#e8eef7';
var WEEKEND = '#eee';
var WHITE = '#fff';
var TODAY = '#557799';
var TODAY_BORDER_DARK = '#246';
var TODAY_BORDER_LIGHT = '#9bd';
var BORDER_GREY = '#a2bbd3';
var DIVIDER = '#c3d9ff';

/**
 * @return A string containing the styles.
 */
function getStyles() {
  var out = ['<style>'];
  out.push(
      '.month td {text-align: center; padding:2px 4px 1px}',
      '.month,td.dow,td.monthHeader {background-color:', LIGHT_BLUE, '}',
      'td.normal {background-color:', WHITE, '}',
      'td.weekend {background-color:', WEEKEND, '}',
      'td.outer {padding-right: 4px; padding-bottom: 4px; }',
      'td.dow {border-width: 0 0 1px 0; border-style:solid;',
          'border-color: ', DIVIDER, '}',
      'td.today {padding: 1px 3px !important; background-color:', TODAY,
          ';color:#fff !important; border-width: 1px; border-style:solid;',
          'border-color: ', TODAY_BORDER_DARK, ' ', TODAY_BORDER_LIGHT, ' ',
          TODAY_BORDER_LIGHT, ' ', TODAY_BORDER_DARK, '}',
      'td.monthHeader {font-weight:bold}',
      '.month {background-color:', LIGHT_BLUE,
          ';border: 1px solid ', BORDER_GREY, '}',
      'body, td {font-family:Arial;font-size: 12.8px}',
      'body {margin-left:10px; background-color:', WHITE, '}',
      'td {vertical-align: top}',
      '.clickable {font-weight:bold;cursor:pointer; color:', DARK_BLUE, '}',
      '.clickable:hover {text-decoration: underline}');
  out.push('</style>');
  return out.join('');
}

document.write(getStyles());


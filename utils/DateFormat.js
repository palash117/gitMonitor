const formatDateFromIsoString = (isoDateString) => {
  if (!isoDateString) {
    return "";
  }
  let date = new Date();
  date = new Date(date.getTime() + Math.floor(1000 * 60 * 60 * 5.5));
  var curr_date = date.getDate();

  var curr_month = "" + (date.getMonth() + 1);
  curr_month = curr_month.length > 1 ? curr_month : "0" + curr_month;

  var curr_year = date.getFullYear();

  let datePart = curr_date + "/" + curr_month + "/" + curr_year;
  let timePart = date.toLocaleTimeString();
  return datePart + " " + timePart;
};
module.exports = formatDateFromIsoString;

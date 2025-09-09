import moment from 'moment';

export const formatChatDate = (dateString: string): string => {
  const date = moment(dateString);
  const now = moment();

  if (isSameDay(date, now)) {
    return `Today ${formatTime(date)}`;
  } else {
    const yesterday = moment(now).subtract(1, 'days');

    if (isSameDay(date, yesterday)) {
      return `Yesterday ${formatTime(date)}`;
    } else if (isMonday(date)) {
      return `Monday ${formatTime(date)}`;
    } else {
      return `${getFormattedDate(date)} ${formatTime(date)}`;
    }
  }
};

function isSameDay(date1: moment.Moment, date2: moment.Moment): boolean {
  return date1.isSame(date2, 'day');
}

function isMonday(date: moment.Moment): boolean {
  return date.day() === 1; // 0 is Sunday, 1 is Monday, and so on
}

function getFormattedDate(date: moment.Moment): string {
  return date.format('Do MMM');
}

function formatTime(date: moment.Moment): string {
  return date.format('h:mm a');
}
